"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileUpload,
  FileUploadClear,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { useMutation } from "@tanstack/react-query";
import { UploadCloudIcon, UploadIcon, XIcon } from "lucide-react";
import Image from "next/image";
import React from "react";
import { sileo } from "sileo";

export default function Page() {
  const [bannerFiles, setBannerFiles] = React.useState<File[]>([]);
  const BANNER_MAX_BYTES = 2 * 1024 * 1024;
  const { mutate, isPending } = useMutation({
    mutationKey: ["uploadBanner"],
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const res = await fetch("/api/admin/banner", {
        method: "POST",
        body: (() => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", type);
          return formData;
        })(),
      });
      return res.json();
    },

    onError: (err) => {
      sileo.error({
        title: "Upload Failed",
        description: "There was an error uploading the banner.",
      });
    },
    onSuccess: (res: { message: string }) => {
      sileo.success({
        title: "Upload Successful",
        description: res.message,
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
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Banner:</CardTitle>
        </CardHeader>
        <CardContent>
          <Image
            className="w-full aspect-[4/1] object-contain"
            src={"/img/banner.webp"}
            width={1920}
            height={1080}
            alt="banner"
          />
        </CardContent>
        <CardFooter className="flex justify-center items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UploadIcon />
                Upload Banner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload a new banner for Hero Section</DialogTitle>
              </DialogHeader>
              <div className="">
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
                  <FileUploadDropzone className="max-w-full">
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-fit"
                      >
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                          >
                            <XIcon />
                          </Button>
                        </FileUploadItemDelete>
                      </FileUploadItem>
                    ))}
                  </FileUploadList>
                  <FileUploadClear />
                </FileUpload>
              </div>
              <DialogFooter>
                <Button>Confirm & Update</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}
