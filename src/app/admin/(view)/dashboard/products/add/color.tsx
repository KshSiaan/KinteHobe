"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  ColorPicker,
  ColorPickerAlphaSlider,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@/components/ui/color-picker";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
import {
  productColorVariantSchema,
  type ProductColorVariantFormInput,
  type ProductColorVariantInput,
} from "@/lib/validations/product-color";
import { NameDescriptionTableField } from "./name-description-table-field";
import { Textarea } from "@/components/ui/textarea";
import {
  CirclePlusIcon,
  PackageSearchIcon,
  PaletteIcon,
  Trash2Icon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type VariantFieldKey = keyof ProductColorVariantFormInput;

export type ProductColorVariantsOutput = {
  draftValues: ProductColorVariantFormInput[];
  values: ProductColorVariantInput[] | null;
  isValid: boolean;
  errors: Record<string, Partial<Record<VariantFieldKey, string[]>>>;
  rootError?: string;
};

type BaseProps = {
  onChange?: (output: ProductColorVariantsOutput) => void;
  initialDraftValues?: ProductColorVariantFormInput[];
};

function createVariant(): ProductColorVariantFormInput {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return {
    id,
    colorName: "",
    colorValue: "#000000",
    sku: "",
    stockQuantity: "",
    price: "",
    compareAtPrice: "",
    details: "",
    images: [],
    metadataRows: [],
  };
}

export default function ColorVariants({
  onChange,
  initialDraftValues,
}: BaseProps) {
  const [variants, setVariants] = useState<ProductColorVariantFormInput[]>(
    initialDraftValues && initialDraftValues.length > 0
      ? initialDraftValues
      : [createVariant()],
  );
  const [touched, setTouched] = useState<
    Record<string, Partial<Record<VariantFieldKey, boolean>>>
  >({});

  const parsedVariants = useMemo(() => {
    return variants.map((variant) => {
      const result = productColorVariantSchema.safeParse(variant);
      return {
        id: variant.id,
        result,
      };
    });
  }, [variants]);

  const allErrors = useMemo(() => {
    return Object.fromEntries(
      parsedVariants
        .filter((entry) => !entry.result.success)
        .map((entry) => [
          entry.id,
          entry.result.success
            ? {}
            : (entry.result.error.flatten().fieldErrors as Partial<
                Record<VariantFieldKey, string[]>
              >),
        ]),
    ) as Record<string, Partial<Record<VariantFieldKey, string[]>>>;
  }, [parsedVariants]);

  const visibleErrors = useMemo(() => {
    return Object.fromEntries(
      Object.entries(allErrors).map(([id, variantErrors]) => {
        const variantTouched = touched[id] ?? {};
        const filtered = Object.fromEntries(
          Object.entries(variantErrors).filter(([key]) =>
            Boolean(variantTouched[key as VariantFieldKey]),
          ),
        ) as Partial<Record<VariantFieldKey, string[]>>;
        return [id, filtered];
      }),
    ) as Record<string, Partial<Record<VariantFieldKey, string[]>>>;
  }, [allErrors, touched]);

  const rootError =
    variants.length === 0 ? "Add at least one color variant." : undefined;

  const values = useMemo(() => {
    if (rootError) {
      return null;
    }

    if (parsedVariants.some((entry) => !entry.result.success)) {
      return null;
    }

    return parsedVariants
      .map((entry) => (entry.result.success ? entry.result.data : null))
      .filter((entry): entry is ProductColorVariantInput => entry !== null);
  }, [parsedVariants, rootError]);

  const isValid = !rootError && values !== null;

  useEffect(() => {
    onChange?.({
      draftValues: variants,
      values,
      isValid,
      errors: visibleErrors,
      rootError,
    });
  }, [isValid, onChange, rootError, values, variants, visibleErrors]);

  function setVariantField<K extends VariantFieldKey>(
    id: string,
    key: K,
    value: ProductColorVariantFormInput[K],
  ) {
    setVariants((previous) =>
      previous.map((variant) =>
        variant.id === id
          ? {
              ...variant,
              [key]: value,
            }
          : variant,
      ),
    );
  }

  function touchVariantField(id: string, key: VariantFieldKey) {
    setTouched((previous) => ({
      ...previous,
      [id]: {
        ...(previous[id] ?? {}),
        [key]: true,
      },
    }));
  }

  function addVariant() {
    setVariants((previous) => [...previous, createVariant()]);
  }

  function removeVariant(id: string) {
    setVariants((previous) => previous.filter((variant) => variant.id !== id));
    setTouched((previous) => {
      const { [id]: _removed, ...rest } = previous;
      return rest;
    });
  }

  function getError(id: string, key: VariantFieldKey) {
    return visibleErrors[id]?.[key]?.[0];
  }

  function getColorSummary(variant: ProductColorVariantFormInput) {
    const label = variant.colorName.trim() || "Untitled color";
    const stock = variant.stockQuantity.trim() || "0";
    const price = variant.price.trim() || "0.00";
    return { label, stock, price };
  }

  return (
    <CardContent className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg border bg-background p-2">
            <PaletteIcon />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-base">Color Variants</h3>
            <p className="text-muted-foreground text-sm">
              Add each color with its own images, stock, and price details.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={addVariant}>
          <CirclePlusIcon data-icon="inline-start" />
          Add Color
        </Button>
      </div>

      {rootError ? (
        <p className="text-destructive text-sm">{rootError}</p>
      ) : null}

      <Accordion type="multiple" className="w-full">
        {variants.map((variant, index) => {
          const summary = getColorSummary(variant);
          const imagesError = getError(variant.id, "images");
          const colorNameError = getError(variant.id, "colorName");
          const colorValueError = getError(variant.id, "colorValue");
          const skuError = getError(variant.id, "sku");
          const stockError = getError(variant.id, "stockQuantity");
          const priceError = getError(variant.id, "price");
          const compareAtPriceError = getError(variant.id, "compareAtPrice");
          const detailsError = getError(variant.id, "details");

          return (
            <AccordionItem key={variant.id} value={variant.id}>
              <AccordionTrigger>
                <div className="flex w-full items-center gap-3 pr-4">
                  <span
                    className="size-4 rounded-full border"
                    style={{ backgroundColor: variant.colorValue }}
                  />
                  <span className="font-medium">
                    Color {index + 1}: {summary.label}
                  </span>
                  <Badge variant="secondary">${summary.price}</Badge>
                  <Badge variant="outline">Stock: {summary.stock}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="overflow-y-scroll">
                <div className="flex flex-col gap-5">
                  <FieldGroup>
                    <Field data-invalid={!!colorNameError}>
                      <FieldLabel>Color Name</FieldLabel>
                      <Input
                        placeholder="e.g. Midnight Blue"
                        value={variant.colorName}
                        aria-invalid={!!colorNameError}
                        onChange={(event) => {
                          setVariantField(
                            variant.id,
                            "colorName",
                            event.target.value,
                          );
                          touchVariantField(variant.id, "colorName");
                        }}
                        onBlur={() =>
                          touchVariantField(variant.id, "colorName")
                        }
                      />
                      <FieldError>{colorNameError}</FieldError>
                    </Field>

                    <Field data-invalid={!!colorValueError}>
                      <FieldLabel>Color Value</FieldLabel>
                      <ColorPicker
                        value={variant.colorValue}
                        onValueChange={(value) => {
                          setVariantField(variant.id, "colorValue", value);
                          touchVariantField(variant.id, "colorValue");
                        }}
                      >
                        <ColorPickerTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <ColorPickerSwatch />
                            {variant.colorValue}
                          </Button>
                        </ColorPickerTrigger>
                        <ColorPickerContent>
                          <ColorPickerArea />
                          <ColorPickerEyeDropper />
                          <ColorPickerHueSlider />
                          <ColorPickerAlphaSlider />
                          <ColorPickerFormatSelect />
                          <ColorPickerInput />
                        </ColorPickerContent>
                      </ColorPicker>
                      <FieldError>{colorValueError}</FieldError>
                    </Field>

                    <Field data-invalid={!!skuError}>
                      <FieldLabel>SKU (Optional)</FieldLabel>
                      <Input
                        placeholder="e.g. TSH-BLU-M"
                        value={variant.sku}
                        aria-invalid={!!skuError}
                        onChange={(event) => {
                          setVariantField(
                            variant.id,
                            "sku",
                            event.target.value,
                          );
                          touchVariantField(variant.id, "sku");
                        }}
                        onBlur={() => touchVariantField(variant.id, "sku")}
                      />
                      <FieldError>{skuError}</FieldError>
                    </Field>

                    <Field data-invalid={!!stockError}>
                      <FieldLabel>Stock Quantity</FieldLabel>
                      <Input
                        placeholder="0"
                        value={variant.stockQuantity}
                        aria-invalid={!!stockError}
                        onChange={(event) => {
                          setVariantField(
                            variant.id,
                            "stockQuantity",
                            event.target.value,
                          );
                          touchVariantField(variant.id, "stockQuantity");
                        }}
                        onBlur={() =>
                          touchVariantField(variant.id, "stockQuantity")
                        }
                      />
                      <FieldError>{stockError}</FieldError>
                    </Field>

                    <Field data-invalid={!!priceError}>
                      <FieldLabel>Price</FieldLabel>
                      <Input
                        placeholder="0.00"
                        value={variant.price}
                        aria-invalid={!!priceError}
                        onChange={(event) => {
                          setVariantField(
                            variant.id,
                            "price",
                            event.target.value,
                          );
                          touchVariantField(variant.id, "price");
                        }}
                        onBlur={() => touchVariantField(variant.id, "price")}
                      />
                      <FieldError>{priceError}</FieldError>
                    </Field>

                    <Field data-invalid={!!compareAtPriceError}>
                      <FieldLabel>Compare-at Price (Optional)</FieldLabel>
                      <Input
                        placeholder="0.00"
                        value={variant.compareAtPrice}
                        aria-invalid={!!compareAtPriceError}
                        onChange={(event) => {
                          setVariantField(
                            variant.id,
                            "compareAtPrice",
                            event.target.value,
                          );
                          touchVariantField(variant.id, "compareAtPrice");
                        }}
                        onBlur={() =>
                          touchVariantField(variant.id, "compareAtPrice")
                        }
                      />
                      <FieldError>{compareAtPriceError}</FieldError>
                    </Field>

                    <Field data-invalid={!!detailsError}>
                      <FieldLabel>Variant Details (Optional)</FieldLabel>
                      <Textarea
                        placeholder="Describe this color variant, fabric notes, care notes, or fit differences."
                        value={variant.details}
                        aria-invalid={!!detailsError}
                        onChange={(event) => {
                          setVariantField(
                            variant.id,
                            "details",
                            event.target.value,
                          );
                          touchVariantField(variant.id, "details");
                        }}
                        onBlur={() => touchVariantField(variant.id, "details")}
                      />
                      <FieldError>{detailsError}</FieldError>
                    </Field>

                    <Field data-invalid={!!imagesError}>
                      <FieldLabel>Variant Images</FieldLabel>
                      <FileUpload
                        id={`images-${variant.id}`}
                        value={variant.images}
                        onValueChange={(files) => {
                          setVariantField(variant.id, "images", files);
                          touchVariantField(variant.id, "images");
                        }}
                        accept="image/*"
                        maxFiles={8}
                        multiple
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
                              Upload up to 8 photos for this color variant.
                            </p>
                          </div>
                          <FileUploadTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 w-fit"
                              type="button"
                            >
                              Browse files
                            </Button>
                          </FileUploadTrigger>
                        </FileUploadDropzone>
                        <FileUploadTrigger />
                        <FileUploadList>
                          {variant.images.map((file) => (
                            <FileUploadItem key={file.name} value={file}>
                              <FileUploadItemPreview />
                              <FileUploadItemMetadata />
                              <FileUploadItemDelete asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                  type="button"
                                >
                                  <XIcon />
                                </Button>
                              </FileUploadItemDelete>
                            </FileUploadItem>
                          ))}
                        </FileUploadList>
                        <FileUploadClear />
                      </FileUpload>
                      <FieldError>{imagesError}</FieldError>
                    </Field>

                    <NameDescriptionTableField
                      title="Additional Color Details (Optional)"
                      subtitle="Track optional pairs like finish, dye lot, or display notes for this color."
                      addLabel="Add detail row"
                      value={variant.metadataRows ?? []}
                      onChange={(rows) => {
                        setVariantField(variant.id, "metadataRows", rows);
                        touchVariantField(variant.id, "metadataRows");
                      }}
                      namePlaceholder="e.g. Finish"
                      descriptionPlaceholder="e.g. Matte"
                    />
                  </FieldGroup>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/20 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <PackageSearchIcon />
                      Keep each color variant complete to avoid catalog
                      mismatch.
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={variants.length <= 1}
                      onClick={() => removeVariant(variant.id)}
                    >
                      <Trash2Icon data-icon="inline-start" />
                      Remove Color
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </CardContent>
  );
}
