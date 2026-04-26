"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getCategories } from "@/lib/api/base";
import { useQuery } from "@tanstack/react-query";
import { UploadCloudIcon, XIcon } from "lucide-react";
import React from "react";

export default function Page() {
  const [bannerFiles, setBannerFiles] = React.useState<File[]>([]);
  const { data, isPending } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  return (
    <div className="flex-1 w-full p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <p>This is the page where you can add a new product.</p>
      <Card>
        <CardContent className="space-y-4">
          <Label>Product Images:</Label>
          <FileUpload
            id="banner"
            value={bannerFiles}
            onValueChange={setBannerFiles}
            // onFileValidate={(file) =>
            //   onFileValidate(file, bannerFiles, BANNER_MAX_BYTES)
            // }
            // onFileReject={onFileReject}
            // accept="image/*"
            maxFiles={4}
            // maxSize={BANNER_MAX_BYTES}
            multiple
            className="w-full"
          >
            <FileUploadDropzone className="w-full">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center rounded-full border p-2.5">
                  <UploadCloudIcon className="size-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm">Drag & drop files here</p>
                <p className="text-muted-foreground text-xs">
                  Or click to browse (max 4 files, images only)
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
          <Label>Product Title</Label>
          <Input placeholder="Product Title" />
          <Label>Product Slug (for URL)</Label>
          <Input placeholder="Product Slug" />
          <Label>Product Description</Label>
          <Textarea placeholder="Product Description" />
          <Label>Product Category</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {data?.data?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label>Product Status</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"active"}>Active</SelectItem>
              <SelectItem value={"draft"}>Draft</SelectItem>
              <SelectItem value={"archived"}>Archived</SelectItem>
            </SelectContent>
          </Select>
          <Label>Stock quantity (0 = out of stock)</Label>
          <Input placeholder="0" />
          <Label>SKU number (Optional)</Label>
          <Input placeholder="1234..." />
          <Label>Weight (Optional)</Label>
          <Input placeholder="1kg" />
        </CardContent>
      </Card>
    </div>
  );
}
