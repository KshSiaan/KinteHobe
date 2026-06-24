"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircleIcon,
  DownloadIcon,
  EyeIcon,
  FileTextIcon,
  GlobeIcon,
  SaveIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LegalPdfViewer } from "./pdf-viewer";
import { FaqTab } from "./faq-tab";

type LegalPageType =
  | "about_us"
  | "terms_of_service"
  | "privacy_policy"
  | "cookie_policy";

type LegalDocument = {
  id: string;
  pageType: LegalPageType;
  fileName: string;
  filePath: string;
  fileSize: number;
  isActive: boolean;
  uploadedAt: string;
  uploadedBy: string | null;
};

type LegalContent = {
  id: string;
  pageType: LegalPageType;
  title: string;
  content: string;
  metaDescription: string;
  isPublished: boolean;
  updatedAt: string;
};

type ContentDraft = {
  title: string;
  content: string;
  metaDescription: string;
  isPublished: boolean;
};

const LEGAL_SLUGS: Record<LegalPageType, string> = {
  about_us: "about-us",
  terms_of_service: "terms-of-service",
  privacy_policy: "privacy-policy",
  cookie_policy: "cookie-policy",
};

const PAGE_TYPES: { value: LegalPageType; label: string }[] = [
  { value: "about_us", label: "About Us" },
  { value: "terms_of_service", label: "Terms of Service" },
  { value: "privacy_policy", label: "Privacy Policy" },
  { value: "cookie_policy", label: "Cookie Policy" },
];

const MAX_BYTES = 30 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

const EMPTY_DRAFT: ContentDraft = {
  title: "",
  content: "",
  metaDescription: "",
  isPublished: false,
};

export default function Page() {
  const [docs, setDocs] = useState<LegalDocument[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<
    Partial<Record<LegalPageType, boolean>>
  >({});
  const [uploadError, setUploadError] = useState<
    Partial<Record<LegalPageType, string>>
  >({});
  const [activating, setActivating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewDoc, setViewDoc] = useState<{
    id: string;
    fileName: string;
  } | null>(null);

  // Content editor state
  const [drafts, setDrafts] = useState<Record<LegalPageType, ContentDraft>>(
    Object.fromEntries(
      PAGE_TYPES.map((pt) => [pt.value, { ...EMPTY_DRAFT }]),
    ) as Record<LegalPageType, ContentDraft>,
  );
  const [contentLoading, setContentLoading] = useState<
    Partial<Record<LegalPageType, boolean>>
  >({});
  const [saving, setSaving] = useState<
    Partial<Record<LegalPageType, boolean>>
  >({});
  const [saveError, setSaveError] = useState<
    Partial<Record<LegalPageType, string>>
  >({});
  const [saveSuccess, setSaveSuccess] = useState<
    Partial<Record<LegalPageType, boolean>>
  >({});

  const fileInputRefs = useRef<
    Partial<Record<LegalPageType, HTMLInputElement | null>>
  >({});

  const fetchDocs = useCallback(async () => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/admin/legal");
      const data = await res.json();
      if (!res.ok) {
        setFetchError(data.message ?? "Failed to load documents");
        return;
      }
      setDocs(data.docs ?? []);
    } catch {
      setFetchError("Network error");
    } finally {
      setFetchLoading(false);
    }
  }, []);

  const fetchContent = useCallback(async (type: LegalPageType) => {
    setContentLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const res = await fetch(`/api/admin/legal/content/${type}`);
      const data = await res.json();
      if (res.ok && data.content) {
        const c: LegalContent = data.content;
        setDrafts((prev) => ({
          ...prev,
          [type]: {
            title: c.title,
            content: c.content,
            metaDescription: c.metaDescription,
            isPublished: c.isPublished,
          },
        }));
      }
    } finally {
      setContentLoading((prev) => ({ ...prev, [type]: false }));
    }
  }, []);

  useEffect(() => {
    fetchDocs();
    for (const pt of PAGE_TYPES) {
      fetchContent(pt.value);
    }
  }, [fetchDocs, fetchContent]);

  function docsForType(type: LegalPageType): LegalDocument[] {
    return docs.filter((d) => d.pageType === type);
  }

  async function handleSaveContent(type: LegalPageType) {
    const draft = drafts[type];
    setSaving((prev) => ({ ...prev, [type]: true }));
    setSaveError((prev) => ({ ...prev, [type]: undefined }));
    setSaveSuccess((prev) => ({ ...prev, [type]: false }));
    try {
      const res = await fetch(`/api/admin/legal/content/${type}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError((prev) => ({
          ...prev,
          [type]: data.message ?? "Save failed",
        }));
        return;
      }
      setSaveSuccess((prev) => ({ ...prev, [type]: true }));
      setTimeout(
        () => setSaveSuccess((prev) => ({ ...prev, [type]: false })),
        3000,
      );
    } catch {
      setSaveError((prev) => ({ ...prev, [type]: "Network error" }));
    } finally {
      setSaving((prev) => ({ ...prev, [type]: false }));
    }
  }

  function updateDraft(type: LegalPageType, patch: Partial<ContentDraft>) {
    setDrafts((prev) => ({ ...prev, [type]: { ...prev[type], ...patch } }));
  }

  async function handleUpload(pageType: LegalPageType, file: File) {
    setUploadError((prev) => ({ ...prev, [pageType]: undefined }));

    if (
      file.type !== "application/pdf" ||
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setUploadError((prev) => ({
        ...prev,
        [pageType]: "Only PDF files are allowed",
      }));
      return;
    }

    if (file.size === 0) {
      setUploadError((prev) => ({ ...prev, [pageType]: "File is empty" }));
      return;
    }

    if (file.size > MAX_BYTES) {
      setUploadError((prev) => ({
        ...prev,
        [pageType]: `File exceeds 30 MB limit (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      }));
      return;
    }

    setUploading((prev) => ({ ...prev, [pageType]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pageType", pageType);

      const res = await fetch("/api/admin/legal/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError((prev) => ({
          ...prev,
          [pageType]: data.message ?? "Upload failed",
        }));
        return;
      }

      await fetchDocs();
    } catch {
      setUploadError((prev) => ({ ...prev, [pageType]: "Network error" }));
    } finally {
      setUploading((prev) => ({ ...prev, [pageType]: false }));
      const input = fileInputRefs.current[pageType];
      if (input) input.value = "";
    }
  }

  async function handleActivate(id: string) {
    setActivating(id);
    try {
      const res = await fetch(`/api/admin/legal/${id}/activate`, {
        method: "PATCH",
      });
      if (res.ok) {
        await fetchDocs();
      }
    } finally {
      setActivating(null);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/legal/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocs((prev) => prev.filter((d) => d.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  }

  function handleDownload(id: string) {
    window.location.href = `/api/admin/legal/${id}/download`;
  }

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 sm:max-w-[86dvw]">
      <LegalPdfViewer
        docId={viewDoc?.id ?? null}
        fileName={viewDoc?.fileName ?? ""}
        onClose={() => setViewDoc(null)}
      />
      <h1 className="text-2xl font-bold">Legal Pages</h1>

      {fetchError && <p className="text-sm text-destructive">{fetchError}</p>}

      <Tabs defaultValue="about_us">
        <TabsList>
          {PAGE_TYPES.map((pt) => (
            <TabsTrigger key={pt.value} value={pt.value}>
              {pt.label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {PAGE_TYPES.map((pt) => {
          const typeDocs = docsForType(pt.value);
          const isUploading = uploading[pt.value] ?? false;
          const typeError = uploadError[pt.value];
          const draft = drafts[pt.value];
          const isSaving = saving[pt.value] ?? false;
          const isContentLoading = contentLoading[pt.value] ?? false;
          const contentErr = saveError[pt.value];
          const didSave = saveSuccess[pt.value] ?? false;

          return (
            <TabsContent key={pt.value} value={pt.value} className="mt-4 flex flex-col gap-6">
              {/* ── Content Editor ── */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{pt.label} — Web Content</CardTitle>
                    <CardDescription className="mt-1">
                      This content is displayed at{" "}
                      <a
                        href={`/${LEGAL_SLUGS[pt.value]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-foreground transition-colors"
                      >
                        /{LEGAL_SLUGS[pt.value]}
                      </a>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`published-${pt.value}`}
                        checked={draft?.isPublished ?? false}
                        onCheckedChange={(v) =>
                          updateDraft(pt.value, { isPublished: v })
                        }
                        disabled={isSaving || isContentLoading}
                      />
                      <Label htmlFor={`published-${pt.value}`} className="text-sm">
                        {draft?.isPublished ? "Published" : "Draft"}
                      </Label>
                    </div>
                    <Button
                      size="sm"
                      disabled={isSaving || isContentLoading}
                      onClick={() => handleSaveContent(pt.value)}
                    >
                      <SaveIcon className="size-4 mr-2" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={`/${LEGAL_SLUGS[pt.value]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <GlobeIcon className="size-4 mr-2" />
                        Preview
                      </a>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                  {isContentLoading ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Loading content...
                    </p>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`title-${pt.value}`}>Page Title</Label>
                        <Input
                          id={`title-${pt.value}`}
                          placeholder={`${pt.label} title`}
                          value={draft?.title ?? ""}
                          onChange={(e) =>
                            updateDraft(pt.value, { title: e.target.value })
                          }
                          disabled={isSaving}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`meta-${pt.value}`}>
                          Meta Description
                          <span className="ml-2 text-xs text-muted-foreground font-normal">
                            (used for SEO)
                          </span>
                        </Label>
                        <Input
                          id={`meta-${pt.value}`}
                          placeholder="Brief description for search engines (150–160 chars)"
                          value={draft?.metaDescription ?? ""}
                          onChange={(e) =>
                            updateDraft(pt.value, {
                              metaDescription: e.target.value,
                            })
                          }
                          disabled={isSaving}
                          maxLength={160}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {(draft?.metaDescription ?? "").length}/160
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`content-${pt.value}`}>
                          HTML Content
                          <span className="ml-2 text-xs text-muted-foreground font-normal">
                            (supports HTML markup)
                          </span>
                        </Label>
                        <Textarea
                          id={`content-${pt.value}`}
                          placeholder="<h2>Section</h2><p>Your legal content here...</p>"
                          value={draft?.content ?? ""}
                          onChange={(e) =>
                            updateDraft(pt.value, { content: e.target.value })
                          }
                          disabled={isSaving}
                          rows={14}
                          className="font-mono text-sm resize-y"
                        />
                      </div>

                      {contentErr && (
                        <p className="text-sm text-destructive">{contentErr}</p>
                      )}
                      {didSave && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Content saved successfully.
                        </p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* ── PDF Documents ── */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{pt.label} — PDF Documents</CardTitle>
                    <CardDescription className="mt-1">
                      Upload and manage PDF versions of this page.
                    </CardDescription>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <input
                      ref={(el) => {
                        fileInputRefs.current[pt.value] = el;
                      }}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(pt.value, file);
                      }}
                    />
                    <Button
                      size="sm"
                      disabled={isUploading || fetchLoading}
                      onClick={() => fileInputRefs.current[pt.value]?.click()}
                    >
                      <UploadIcon className="size-4 mr-2" />
                      {isUploading ? "Uploading..." : "Upload PDF"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      PDF only · max 30 MB
                    </p>
                    {typeError && (
                      <p className="text-xs text-destructive">{typeError}</p>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {fetchLoading ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Loading documents...
                    </p>
                  ) : typeDocs.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                      <FileTextIcon className="size-10 opacity-30" />
                      <p className="text-sm">No documents uploaded yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File Name</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Uploaded At</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {typeDocs.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium max-w-55 truncate">
                              {doc.fileName}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {formatBytes(doc.fileSize)}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                              {formatDate(doc.uploadedAt)}
                            </TableCell>
                            <TableCell>
                              {doc.isActive ? (
                                <Badge className="gap-1">
                                  <CheckCircleIcon className="size-3" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    setViewDoc({
                                      id: doc.id,
                                      fileName: doc.fileName,
                                    })
                                  }
                                  title="View"
                                >
                                  <EyeIcon className="size-4" />
                                </Button>

                                {!doc.isActive && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={activating === doc.id}
                                    onClick={() => handleActivate(doc.id)}
                                  >
                                    {activating === doc.id
                                      ? "Setting..."
                                      : "Set Active"}
                                  </Button>
                                )}

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDownload(doc.id)}
                                  title="Download"
                                >
                                  <DownloadIcon className="size-4" />
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="text-destructive hover:text-destructive"
                                      disabled={deleting === doc.id}
                                      title="Delete"
                                    >
                                      <Trash2Icon className="size-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete document?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        <strong>{doc.fileName}</strong> will be
                                        permanently deleted from storage and
                                        cannot be recovered.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => handleDelete(doc.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
        <TabsContent value="faq" className="mt-4">
          <FaqTab />
        </TabsContent>
      </Tabs>
    </main>
  );
}
