"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
  FileUploadList,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  FileUploadItemDelete,
  FileUploadClear,
} from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateCategory } from "@/lib/api/admin";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

import {
  PencilLineIcon,
  RefreshCwIcon,
  UploadCloudIcon,
  XIcon,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";
import React from "react";
import { sileo } from "sileo";
import { useRouter } from "next/navigation";

interface BuildCategoryFormDataValues extends CategoryInput {
  image?: File;
  banner?: File;
}

function buildCategoryFormData(
  values: BuildCategoryFormDataValues,
  iconFiles: File[],
  bannerFiles: File[],
  removeIcon: boolean,
  removeBanner: boolean,
) {
  const formData = new FormData();

  formData.append("name", values.name);
  formData.append("slug", values.slug);
  formData.append("description", values.description);
  formData.append("isActive", String(values.isActive));
  formData.append("metaTitle", values.metaTitle);
  formData.append("metaDescription", values.metaDescription);

  // Only append files if new ones were selected
  if (iconFiles[0]) {
    formData.append("image", iconFiles[0]);
  }

  if (bannerFiles[0]) {
    formData.append("banner", bannerFiles[0]);
  }

  // Track if user wants to remove existing images
  if (removeIcon) {
    formData.append("removeIcon", "true");
  }

  if (removeBanner) {
    formData.append("removeBanner", "true");
  }

  return formData;
}

export default function Edit({
  category,
}: {
  category: {
    id: string;
    name: string;
    parentId: string | null;
    slug: string;
    description: string | null;
    image: string | null;
    banner: string | null;
    isActive: boolean | null;
    metaTitle: string | null;
    metaDescription: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}) {
  const [open, setOpen] = React.useState(false);
  const [iconFiles, setIconFiles] = React.useState<File[]>([]);
  const [bannerFiles, setBannerFiles] = React.useState<File[]>([]);
  const [removeIcon, setRemoveIcon] = React.useState(false);
  const [removeBanner, setRemoveBanner] = React.useState(false);
  const ICON_MAX_BYTES = 500 * 1024;
  const BANNER_MAX_BYTES = 2 * 1024 * 1024;
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      isActive: category.isActive ?? true,
      metaTitle: category.metaTitle || "",
      metaDescription: category.metaDescription || "",
    },
  });

  const updateCategoryMutation = useMutation({
    mutationKey: ["update-category", category.id],
    mutationFn: (formData: FormData) => updateCategory(category.id, formData),
    onSuccess: () => {
      sileo.success({
        title: "Category updated",
        description: "Category has been updated successfully.",
      });
      handleReset();
      setOpen(false);
      router.refresh();
    },
    onError: (error) => {
      sileo.error({
        title: "Failed to update category",
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    },
  });

  const onFileValidate = React.useCallback(
    (file: File, currentFiles: File[], maxBytes: number): string | null => {
      // Validate max files
      if (currentFiles.length >= 1) {
        return "You can only upload 1 file";
      }

      // Validate file type (only images)
      if (!file.type.startsWith("image/")) {
        return "Only image files are allowed";
      }

      // Validate file size (max 2MB)
      if (file.size > maxBytes) {
        return `File size must be less than ${Math.round(maxBytes / 1024)}KB`;
      }

      return null;
    },
    [],
  );

  const onFileReject = React.useCallback((file: File, message: string) => {
    sileo.error({
      title: message,
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const handleReset = React.useCallback(() => {
    if (updateCategoryMutation.isPending) {
      return;
    }

    reset({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      isActive: category.isActive ?? true,
      metaTitle: category.metaTitle || "",
      metaDescription: category.metaDescription || "",
    });
    setIconFiles([]);
    setBannerFiles([]);
    setRemoveIcon(false);
    setRemoveBanner(false);
  }, [updateCategoryMutation.isPending, reset, category]);

  const onSubmit = React.useCallback(
    (values: CategoryInput) => {
      updateCategoryMutation.mutate(
        buildCategoryFormData(
          {
            ...values,
          },
          iconFiles,
          bannerFiles,
          removeIcon,
          removeBanner,
        ),
      );
    },
    [bannerFiles, iconFiles, updateCategoryMutation, removeIcon, removeBanner],
  );

  const isBusy = isSubmitting || updateCategoryMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" title="Edit category">
          <PencilLineIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[90dvh] min-w-[90dvw] flex-col overflow-hidden">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl">
              Edit Product Category
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Update category details, images, and metadata
            </p>
          </DialogHeader>
          <ScrollArea className="min-h-0 flex-1">
            <div className="w-full p-4 rounded-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="banner">Category Banner</Label>
                {category.banner &&
                  !removeBanner &&
                  bannerFiles.length === 0 && (
                    <div className="relative rounded-lg border border-dashed p-3 bg-muted/30">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium">Current Banner</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {category.banner}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setRemoveBanner(true)}
                          disabled={isBusy}
                          className="gap-1.5 text-destructive hover:text-destructive"
                        >
                          <Trash2Icon className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                {removeBanner && (
                  <div className="rounded-lg border border-dashed border-destructive/50 bg-destructive/5 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-destructive">
                          Banner will be removed
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Upload a new banner or cancel
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setRemoveBanner(false)}
                        disabled={isBusy}
                      >
                        Undo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <FileUpload
                id="banner"
                value={bannerFiles}
                onValueChange={setBannerFiles}
                onFileValidate={(file) =>
                  onFileValidate(file, bannerFiles, BANNER_MAX_BYTES)
                }
                onFileReject={onFileReject}
                accept="image/*"
                maxFiles={1}
                maxSize={BANNER_MAX_BYTES}
                className="w-full"
              >
                <FileUploadDropzone className="w-full">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center rounded-full border p-2.5">
                      <UploadCloudIcon className="size-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-sm">
                      Drag & drop files here
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Or click to browse (max 1 file, images only)
                    </p>
                  </div>
                  <FileUploadTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-2 w-fit">
                      Browse files
                    </Button>
                  </FileUploadTrigger>
                </FileUploadDropzone>
                <FileUploadTrigger />
                <FileUploadList>
                  {bannerFiles.map((file) => (
                    <FileUploadItem key={file.name} value={file}>
                      <FileUploadItemPreview />
                      <FileUploadItemMetadata />
                      <FileUploadItemDelete asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <XIcon />
                        </Button>
                      </FileUploadItemDelete>
                    </FileUploadItem>
                  ))}
                </FileUploadList>
                <FileUploadClear />
              </FileUpload>
              <div className="space-y-2">
                <Label htmlFor="icon">Category Icon</Label>
                {category.image && !removeIcon && iconFiles.length === 0 && (
                  <div className="relative rounded-lg border border-dashed p-3 bg-muted/30">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Current Icon</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {category.image}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setRemoveIcon(true)}
                        disabled={isBusy}
                        className="gap-1.5 text-destructive hover:text-destructive"
                      >
                        <Trash2Icon className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
                {removeIcon && (
                  <div className="rounded-lg border border-dashed border-destructive/50 bg-destructive/5 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-destructive">
                          Icon will be removed
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Upload a new icon or cancel
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setRemoveIcon(false)}
                        disabled={isBusy}
                      >
                        Undo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <FileUpload
                id="icon"
                value={iconFiles}
                onValueChange={setIconFiles}
                onFileValidate={(file) =>
                  onFileValidate(file, iconFiles, ICON_MAX_BYTES)
                }
                onFileReject={onFileReject}
                accept="image/*"
                maxFiles={1}
                maxSize={ICON_MAX_BYTES}
                className="w-full"
              >
                <FileUploadDropzone className="w-full">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center rounded-full border p-2.5">
                      <UploadCloudIcon className="size-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-sm">
                      Drag & drop files here
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Or click to browse (max 1 file, images only)
                    </p>
                  </div>
                  <FileUploadTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-2 w-fit">
                      Browse files
                    </Button>
                  </FileUploadTrigger>
                </FileUploadDropzone>
                <FileUploadTrigger />
                <FileUploadList>
                  {iconFiles.map((file) => (
                    <FileUploadItem key={file.name} value={file}>
                      <FileUploadItemPreview />
                      <FileUploadItemMetadata />
                      <FileUploadItemDelete asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <XIcon />
                        </Button>
                      </FileUploadItemDelete>
                    </FileUploadItem>
                  ))}
                </FileUploadList>
                <FileUploadClear />
              </FileUpload>
              <div className="space-y-4 rounded-lg border p-6">
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name">Category name</FieldLabel>
                  <Input
                    id="name"
                    placeholder="Electronics"
                    {...register("name")}
                    aria-invalid={!!errors.name}
                    disabled={isBusy}
                  />
                  <FieldError
                    errors={
                      errors.name?.message
                        ? [{ message: errors.name.message }]
                        : []
                    }
                  />
                </Field>
                <Field data-invalid={!!errors.slug}>
                  <FieldLabel htmlFor="slug">Category slug</FieldLabel>
                  <Input
                    id="slug"
                    placeholder="electronics"
                    {...register("slug")}
                    aria-invalid={!!errors.slug}
                    disabled={isBusy}
                  />
                  <FieldError
                    errors={
                      errors.slug?.message
                        ? [{ message: errors.slug.message }]
                        : []
                    }
                  />
                  <FieldDescription>
                    The slug is the URL-friendly version of the category name.
                    It should be lowercase and contain only letters, numbers,
                    and hyphens.
                  </FieldDescription>
                </Field>
                <Field data-invalid={!!errors.description}>
                  <FieldLabel htmlFor="description">
                    Category description
                  </FieldLabel>
                  <Textarea
                    id="description"
                    placeholder="Enter category description"
                    rows={4}
                    {...register("description")}
                    aria-invalid={!!errors.description}
                    disabled={isBusy}
                  />
                  <FieldError
                    errors={
                      errors.description?.message
                        ? [{ message: errors.description.message }]
                        : []
                    }
                  />
                </Field>
                <Field data-invalid={!!errors.isActive}>
                  <FieldLabel htmlFor="isActive">Set as active</FieldLabel>
                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field }) => (
                      <Switch
                        id="isActive"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isBusy}
                      />
                    )}
                  />
                  <FieldError
                    errors={
                      errors.isActive?.message
                        ? [{ message: errors.isActive.message }]
                        : []
                    }
                  />
                </Field>
              </div>
              <div className="border rounded-lg bg-accent-foreground/10">
                <div className="bg-primary p-2 rounded-t-lg text-center text-sm">
                  <p className="text-primary-foreground">
                    Metadata (for SEO) - Important
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <Field data-invalid={!!errors.metaTitle}>
                    <FieldLabel htmlFor="metaTitle">Metadata title</FieldLabel>
                    <Input
                      className="bg-background"
                      id="metaTitle"
                      placeholder="electronics"
                      {...register("metaTitle")}
                      aria-invalid={!!errors.metaTitle}
                      disabled={isBusy}
                    />
                    <FieldError
                      errors={
                        errors.metaTitle?.message
                          ? [{ message: errors.metaTitle.message }]
                          : []
                      }
                    />
                    <FieldDescription>
                      The metadata title is what appears in search engine
                      results. It should be concise and include relevant
                      keywords for better SEO performance.
                    </FieldDescription>
                  </Field>
                  <Field data-invalid={!!errors.metaDescription}>
                    <FieldLabel htmlFor="metaDescription">
                      Metadata description
                    </FieldLabel>
                    <Textarea
                      className="bg-background"
                      id="metaDescription"
                      placeholder="Enter metadata description"
                      rows={4}
                      {...register("metaDescription")}
                      aria-invalid={!!errors.metaDescription}
                      disabled={isBusy}
                    />
                    <FieldError
                      errors={
                        errors.metaDescription?.message
                          ? [{ message: errors.metaDescription.message }]
                          : []
                      }
                    />
                    <FieldDescription>
                      The metadata description provides a brief summary of the
                      category for search engines. It should be compelling and
                      include relevant keywords to improve click-through rates
                      from search results.
                    </FieldDescription>
                  </Field>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="w-full flex justify-between items-center border-t pt-4 mt-4">
            <Popover>
              <Tooltip>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isBusy}
                      className="gap-2"
                    >
                      <RefreshCwIcon className="h-4 w-4" />
                      Reset Changes
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>
                  <p>Revert to original values</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent side="top" className="w-72">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Discard changes?</p>
                  <p className="text-sm text-muted-foreground">
                    All unsaved changes will be lost.
                  </p>
                  <div className="flex justify-end gap-2">
                    <PopoverTrigger asChild>
                      <Button variant="outline" type="button" size="sm">
                        Cancel
                      </Button>
                    </PopoverTrigger>
                    <Button
                      variant="destructive"
                      type="button"
                      size="sm"
                      onClick={handleReset}
                      disabled={isBusy}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button type="submit" disabled={isBusy} className="gap-2">
              {isBusy && <Loader2Icon className="h-4 w-4 animate-spin" />}
              {isBusy ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
