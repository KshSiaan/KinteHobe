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
import { createCategory } from "@/lib/api/admin";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

import { PlusIcon, RefreshCwIcon, UploadCloudIcon, XIcon } from "lucide-react";
import React from "react";
import { sileo } from "sileo";
import { useRouter } from "next/navigation";

interface BuildCategoryFormDataValues extends CategoryInput {
  image: File;
  banner: File;
}

function buildCategoryFormData(
  values: BuildCategoryFormDataValues,
  iconFiles: File[],
  bannerFiles: File[],
) {
  const formData = new FormData();

  formData.append("name", values.name);
  formData.append("slug", values.slug);
  formData.append("description", values.description);
  formData.append("isActive", String(values.isActive));
  formData.append("metaTitle", values.metaTitle);
  formData.append("metaDescription", values.metaDescription);

  if (iconFiles[0]) {
    formData.append("image", iconFiles[0]);
  }

  if (bannerFiles[0]) {
    formData.append("banner", bannerFiles[0]);
  }

  return formData;
}

export default function Add() {
  const [open, setOpen] = React.useState(false);
  const [iconFiles, setIconFiles] = React.useState<File[]>([]);
  const [bannerFiles, setBannerFiles] = React.useState<File[]>([]);
  const ICON_MAX_BYTES = 500 * 1024;
  const BANNER_MAX_BYTES = 2 * 1024 * 1024;
  const navig = useRouter();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      isActive: true,
      metaTitle: "",
      metaDescription: "",
    },
  });

  const createCategoryMutation = useMutation({
    mutationKey: ["create-category"],
    mutationFn: createCategory,
    onSuccess: () => {
      sileo.success({
        title: "Category created",
        description: "Category has been submitted successfully.",
      });
      handleReset();
      setOpen(false);
      navig.refresh();
    },
    onError: (error) => {
      sileo.error({
        title: "Failed to create category",
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
    if (createCategoryMutation.isPending) {
      return;
    }

    reset({
      name: "",
      slug: "",
      description: "",
      isActive: true,
      metaTitle: "",
      metaDescription: "",
    });
    setIconFiles([]);
    setBannerFiles([]);
  }, [createCategoryMutation.isPending, reset]);

  const onSubmit = React.useCallback(
    (values: CategoryInput) => {
      if (bannerFiles.length <= 0) {
        sileo.error({
          title: "Banner required",
          description: "Please upload a category banner.",
        });
        return;
      }
      if (iconFiles.length <= 0) {
        sileo.error({
          title: "Icon required",
          description: "Please upload a category icon.",
        });
        return;
      }
      createCategoryMutation.mutate(
        buildCategoryFormData(
          {
            ...values,
            image: iconFiles[0],
            banner: bannerFiles[0],
          },
          iconFiles,
          bannerFiles,
        ),
      );
    },
    [bannerFiles, createCategoryMutation, iconFiles],
  );

  const isBusy = isSubmitting || createCategoryMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Add new Category
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[90dvh] min-w-[90dvw] flex-col overflow-hidden">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogHeader className="">
            <DialogTitle>Add Product Category</DialogTitle>
          </DialogHeader>
          <ScrollArea className="min-h-0 flex-1">
            <div className="w-full p-4 rounded-md space-y-4">
              <Label htmlFor="banner">Category Banner</Label>
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
              <Label htmlFor="icon">Category Icon</Label>
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
                  <FieldLabel htmlFor="isActive">
                    Set as active immediately
                  </FieldLabel>
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
          <DialogFooter className="w-full flex justify-end items-center">
            <Popover>
              <Tooltip>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button variant={"outline"} type="button">
                      <RefreshCwIcon />
                      Reset
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>
                  <p>Reset Form</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent>
                <div>
                  <p className="text-sm">
                    Are you sure you want to reset the form? All unsaved changes
                    will be lost.
                  </p>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="destructive"
                      type="button"
                      onClick={handleReset}
                      disabled={isBusy}
                    >
                      Reset Form
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button type="submit" disabled={isBusy}>
              Upload Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
