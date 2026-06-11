"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { EditIcon, Loader2Icon } from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { uploadAvatar } from "./actions";

export default function General() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [uploading, setUploading] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const result = await uploadAvatar(formData);
      if (result.error) {
        console.error("Avatar upload failed:", result.error);
        return;
      }

      await authClient.updateUser({ image: result.url });
      setAvatarSrc(result.url);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || name === user?.name) return;

    setSaving(true);
    try {
      await authClient.updateUser({ name: name.trim() });
    } finally {
      setSaving(false);
    }
  };

  const displayAvatar = avatarSrc ?? user?.image ?? undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          General Settings
        </CardTitle>
        <CardDescription>
          Manage your general account settings, including profile information
          and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Avatar className="size-24 relative overflow-hidden">
          <AvatarImage src={displayAvatar} />
          <AvatarFallback>
            {user?.name ? user.name.charAt(0) : "U"}
          </AvatarFallback>
          <label
            className="absolute bottom-0 flex justify-center items-center right-0 h-full w-full bg-primary rounded-full p-1 cursor-pointer z-10 opacity-0 hover:opacity-100 transition-opacity"
            htmlFor="avatar-upload"
            aria-disabled={uploading}
            style={uploading ? { pointerEvents: "none" } : undefined}
          >
            {uploading ? (
              <Loader2Icon className="size-4 text-background animate-spin" />
            ) : (
              <EditIcon className="size-4 text-background" />
            )}
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
          </label>
        </Avatar>

        <div className="mt-6">
          <form onSubmit={handleSave}>
            <FieldGroup>
              <Field>
                <FieldLabel>Full Name</FieldLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input value={user?.email ?? ""} readOnly placeholder="Email" />
                <FieldDescription className="text-xs">
                  NOTE: This is the email address associated with your account.
                  Unchangeable for now.
                </FieldDescription>
              </Field>
              <div className="">
                <Button
                  type="submit"
                  disabled={saving || !name.trim() || name === user?.name}
                >
                  {saving ? (
                    <>
                      <Loader2Icon className="size-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
