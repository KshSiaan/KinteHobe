"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import {
  GlobeIcon,
  Loader2Icon,
  LogOutIcon,
  MonitorIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  TabletIcon,
  Trash2Icon,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

type Session = {
  id: string;
  token: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  expiresAt: Date | string;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId: string;
};

function parseSession(session: Session) {
  const parser = new UAParser(session.userAgent ?? "");
  const result = parser.getResult();
  const deviceType = result.device.type;

  let DeviceIcon = MonitorIcon;
  if (deviceType === "mobile") DeviceIcon = SmartphoneIcon;
  else if (deviceType === "tablet") DeviceIcon = TabletIcon;
  else if (!result.browser.name) DeviceIcon = GlobeIcon;

  const browser = result.browser.name ?? "Unknown browser";
  const os = result.os.name ?? "Unknown OS";
  const label = `${browser} on ${os}`;

  return { DeviceIcon, label, browser, os };
}

export default function Security() {
  const { data: session } = authClient.useSession();
  const currentToken = session?.session?.token;

  // --- Change Password ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }

    setSaving(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      if (result.error) {
        setPwError(result.error.message ?? "Failed to change password.");
        return;
      }

      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setSaving(false);
    }
  };

  // --- Sessions ---
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const result = await authClient.listSessions();
      if (result.data) setSessions(result.data as Session[]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const revokeSession = async (token: string) => {
    setRevoking(token);
    try {
      await authClient.revokeSession({ token });
      setSessions((prev) => prev.filter((s) => s.token !== token));
    } finally {
      setRevoking(null);
    }
  };

  const revokeOthers = async () => {
    setRevokingAll(true);
    try {
      await authClient.revokeOtherSessions();
      setSessions((prev) => prev.filter((s) => s.token === currentToken));
    } finally {
      setRevokingAll(false);
    }
  };

  const otherSessions = sessions.filter((s) => s.token !== currentToken);
  const currentSession = sessions.find((s) => s.token === currentToken);

  return (
    <div className="flex flex-col gap-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password. You'll need your current password to confirm.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword}>
            <FieldGroup>
              <Field>
                <FieldLabel>Current Password</FieldLabel>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </Field>
              <Field>
                <FieldLabel>New Password</FieldLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Confirm New Password</FieldLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </Field>
              {pwError && <p className="text-sm text-destructive">{pwError}</p>}
              {pwSuccess && (
                <p className="text-sm text-green-600">
                  Password updated successfully.
                </p>
              )}
              <div>
                <Button
                  type="submit"
                  disabled={
                    saving ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                >
                  {saving ? (
                    <>
                      <Loader2Icon className="size-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              Session Management
            </CardTitle>
            <CardDescription>
              Active sessions on your account across devices.
            </CardDescription>
          </div>
          {otherSessions.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={revokeOthers}
              disabled={revokingAll}
            >
              {revokingAll ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <LogOutIcon className="size-4" />
              )}
              Revoke all others
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
              <Loader2Icon className="size-4 animate-spin" />
              Loading sessions…
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {currentSession && (
                <SessionRow
                  session={currentSession}
                  isCurrent
                  revoking={false}
                  onRevoke={() => {}}
                />
              )}
              {otherSessions.map((s) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  isCurrent={false}
                  revoking={revoking === s.token}
                  onRevoke={() => revokeSession(s.token)}
                />
              ))}
              {sessions.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">
                  No sessions found.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SessionRow({
  session,
  isCurrent,
  revoking,
  onRevoke,
}: {
  session: Session;
  isCurrent: boolean;
  revoking: boolean;
  onRevoke: () => void;
}) {
  const { DeviceIcon, label } = parseSession(session);
  const createdAt = new Date(session.createdAt);
  const timeStr = createdAt.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
      <div className="flex items-center gap-3">
        <DeviceIcon className="size-5 text-muted-foreground shrink-0" />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{label}</span>
            {isCurrent && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                <ShieldCheckIcon className="size-3" />
                Current
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {session.ipAddress && <span>{session.ipAddress}</span>}
            {session.ipAddress && <span>·</span>}
            <span>{timeStr}</span>
          </div>
        </div>
      </div>
      {!isCurrent && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRevoke}
          disabled={revoking}
          className="text-destructive hover:text-destructive shrink-0"
        >
          {revoking ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <Trash2Icon className="size-4" />
          )}
        </Button>
      )}
    </div>
  );
}
