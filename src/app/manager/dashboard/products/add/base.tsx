"use client";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  productBaseSchema,
  type ProductBaseFormInput,
  type ProductBaseInput,
} from "@/lib/validations/product";
import { NameDescriptionTableField } from "./name-description-table-field";

import { Textarea } from "@/components/ui/textarea";

import { UploadCloudIcon, XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type ProductBaseOutput = {
  draftValues: ProductBaseFormInput;
  values: ProductBaseInput | null;
  isValid: boolean;
  errors: Partial<Record<keyof ProductBaseFormInput, string[]>>;
};

type BaseProps = {
  onChange?: (output: ProductBaseOutput) => void;
  initialDraftValues?: ProductBaseFormInput;
};

const defaultBaseFormValues: ProductBaseFormInput = {
  images: [],
  title: "",
  description: "",
  stockQuantity: "",
  sku: "",
  weight: "",
  price: "",
  compareAtPrice: "",
  metadataRows: [],
};

export default function Base({ onChange, initialDraftValues }: BaseProps) {
  const [formValues, setFormValues] = useState<ProductBaseFormInput>(
    initialDraftValues ?? defaultBaseFormValues,
  );
  const [touched, setTouched] = useState<
    Partial<Record<keyof ProductBaseFormInput, boolean>>
  >({});

  const validationResult = useMemo(
    () => productBaseSchema.safeParse(formValues),
    [formValues],
  );

  const validationErrors = useMemo(
    () =>
      validationResult.success
        ? {}
        : (validationResult.error.flatten().fieldErrors as Partial<
            Record<keyof ProductBaseFormInput, string[]>
          >),
    [validationResult],
  );

  const fieldErrors = useMemo(() => {
    return Object.fromEntries(
      Object.entries(validationErrors).filter(([key]) =>
        Boolean(touched[key as keyof ProductBaseFormInput]),
      ),
    ) as Partial<Record<keyof ProductBaseFormInput, string[]>>;
  }, [touched, validationErrors]);

  useEffect(() => {
    onChange?.({
      draftValues: formValues,
      values: validationResult.success ? validationResult.data : null,
      isValid: validationResult.success,
      errors: fieldErrors,
    });
  }, [fieldErrors, formValues, onChange, validationResult]);

  function setField<K extends keyof ProductBaseFormInput>(
    key: K,
    value: ProductBaseFormInput[K],
  ) {
    setFormValues((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function touchField<K extends keyof ProductBaseFormInput>(key: K) {
    setTouched((previous) => ({ ...previous, [key]: true }));
  }

  const bannerFiles = formValues.images;

  const imageError = fieldErrors.images?.[0];
  const titleError = fieldErrors.title?.[0];
  const descriptionError = fieldErrors.description?.[0];
  const stockError = fieldErrors.stockQuantity?.[0];
  const skuError = fieldErrors.sku?.[0];
  const weightError = fieldErrors.weight?.[0];
  const priceError = fieldErrors.price?.[0];
  const compareAtPriceError = fieldErrors.compareAtPrice?.[0];

  return (
    <>
      <CardContent className="flex flex-col gap-4">
        <FieldGroup>
          <Field data-invalid={!!imageError}>
            <FieldLabel>Product Images</FieldLabel>
            <FileUpload
              id="banner"
              value={bannerFiles}
              onValueChange={(files) => {
                setField("images", files);
                touchField("images");
              }}
              accept="image/*"
              maxFiles={4}
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
            <FieldError>{imageError}</FieldError>
          </Field>

          <Field data-invalid={!!titleError}>
            <FieldLabel>Product Title</FieldLabel>
            <Input
              placeholder="Product Title"
              value={formValues.title}
              aria-invalid={!!titleError}
              onChange={(event) => {
                setField("title", event.target.value);
                touchField("title");
              }}
              onBlur={() => touchField("title")}
            />
            <FieldError>{titleError}</FieldError>
          </Field>

          <Field data-invalid={!!descriptionError}>
            <FieldLabel>Product Description</FieldLabel>
            <Textarea
              placeholder="Product Description"
              value={formValues.description}
              aria-invalid={!!descriptionError}
              onChange={(event) => {
                setField("description", event.target.value);
                touchField("description");
              }}
              onBlur={() => touchField("description")}
            />
            <FieldError>{descriptionError}</FieldError>
          </Field>

          <Field data-invalid={!!stockError}>
            <FieldLabel>Stock quantity (0 = out of stock)</FieldLabel>
            <Input
              placeholder="0"
              value={formValues.stockQuantity}
              aria-invalid={!!stockError}
              onChange={(event) => {
                setField("stockQuantity", event.target.value);
                touchField("stockQuantity");
              }}
              onBlur={() => touchField("stockQuantity")}
            />
            <FieldError>{stockError}</FieldError>
          </Field>

          <Field data-invalid={!!skuError}>
            <FieldLabel>SKU number (Optional)</FieldLabel>
            <Input
              placeholder="1234..."
              value={formValues.sku}
              aria-invalid={!!skuError}
              onChange={(event) => {
                setField("sku", event.target.value);
                touchField("sku");
              }}
              onBlur={() => touchField("sku")}
            />
            <FieldError>{skuError}</FieldError>
          </Field>

          <Field data-invalid={!!weightError}>
            <FieldLabel>Weight (Optional)</FieldLabel>
            <Input
              placeholder="1kg"
              value={formValues.weight}
              aria-invalid={!!weightError}
              onChange={(event) => {
                setField("weight", event.target.value);
                touchField("weight");
              }}
              onBlur={() => touchField("weight")}
            />
            <FieldError>{weightError}</FieldError>
          </Field>
        </FieldGroup>
      </CardContent>
      <CardContent className="border-t pt-4">
        <FieldGroup>
          <Field data-invalid={!!priceError}>
            <FieldLabel>Price</FieldLabel>
            <Input
              placeholder="0.00"
              value={formValues.price}
              aria-invalid={!!priceError}
              onChange={(event) => {
                setField("price", event.target.value);
                touchField("price");
              }}
              onBlur={() => touchField("price")}
            />
            <FieldError>{priceError}</FieldError>
          </Field>

          <Field data-invalid={!!compareAtPriceError}>
            <FieldLabel>Compare-at Price</FieldLabel>
            <Input
              placeholder="0"
              value={formValues.compareAtPrice}
              aria-invalid={!!compareAtPriceError}
              onChange={(event) => {
                setField("compareAtPrice", event.target.value);
                touchField("compareAtPrice");
              }}
              onBlur={() => touchField("compareAtPrice")}
            />
            <FieldError>{compareAtPriceError}</FieldError>
          </Field>

          <NameDescriptionTableField
            title="Additional Product Info (Optional)"
            subtitle="Add optional name/description rows such as material, care, or shipping notes."
            addLabel="Add info row"
            value={formValues.metadataRows ?? []}
            onChange={(rows) => {
              setField("metadataRows", rows);
              touchField("metadataRows");
            }}
            namePlaceholder="e.g. Material"
            descriptionPlaceholder="e.g. 100% Organic Cotton"
          />
        </FieldGroup>
      </CardContent>
    </>
  );
}
