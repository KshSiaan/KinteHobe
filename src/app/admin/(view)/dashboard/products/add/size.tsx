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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  productSizeVariantSchema,
  type ProductSizeVariantFormInput,
  type ProductSizeVariantInput,
} from "@/lib/validations/product-size";
import { NameDescriptionTableField } from "./name-description-table-field";
import { Textarea } from "@/components/ui/textarea";
import {
  CirclePlusIcon,
  PackageSearchIcon,
  RulerIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type VariantFieldKey = keyof ProductSizeVariantFormInput;

export type ProductSizeVariantsOutput = {
  draftValues: ProductSizeVariantFormInput[];
  values: ProductSizeVariantInput[] | null;
  isValid: boolean;
  errors: Record<string, Partial<Record<VariantFieldKey, string[]>>>;
  rootError?: string;
};

type SizeProps = {
  onChange?: (output: ProductSizeVariantsOutput) => void;
  initialDraftValues?: ProductSizeVariantFormInput[];
};

function createVariant(): ProductSizeVariantFormInput {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return {
    id,
    sizeName: "",
    sizeCode: "",
    sku: "",
    stockQuantity: "",
    price: "",
    compareAtPrice: "",
    weight: "",
    details: "",
    metadataRows: [],
  };
}

export default function SizeVariants({
  onChange,
  initialDraftValues,
}: SizeProps) {
  const [variants, setVariants] = useState<ProductSizeVariantFormInput[]>(
    initialDraftValues && initialDraftValues.length > 0
      ? initialDraftValues
      : [createVariant()],
  );
  const [touched, setTouched] = useState<
    Record<string, Partial<Record<VariantFieldKey, boolean>>>
  >({});

  const parsedVariants = useMemo(() => {
    return variants.map((variant) => {
      const result = productSizeVariantSchema.safeParse(variant);
      return { id: variant.id, result };
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
    variants.length === 0 ? "Add at least one size variant." : undefined;

  const values = useMemo(() => {
    if (rootError) {
      return null;
    }

    if (parsedVariants.some((entry) => !entry.result.success)) {
      return null;
    }

    return parsedVariants
      .map((entry) => (entry.result.success ? entry.result.data : null))
      .filter((entry): entry is ProductSizeVariantInput => entry !== null);
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
    value: ProductSizeVariantFormInput[K],
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

  function getSizeSummary(variant: ProductSizeVariantFormInput) {
    const label = variant.sizeName.trim() || "Untitled size";
    const stock = variant.stockQuantity.trim() || "0";
    const price = variant.price.trim() || "0.00";
    return { label, stock, price };
  }

  return (
    <CardContent className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg border bg-background p-2">
            <RulerIcon />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-base">Size Variants</h3>
            <p className="text-muted-foreground text-sm">
              Add each size with its own inventory, pricing, and SKU details.
            </p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={addVariant}>
          <CirclePlusIcon data-icon="inline-start" />
          Add Size
        </Button>
      </div>

      {rootError ? (
        <p className="text-destructive text-sm">{rootError}</p>
      ) : null}

      <Accordion type="multiple" className="w-full">
        {variants.map((variant, index) => {
          const summary = getSizeSummary(variant);
          const sizeNameError = getError(variant.id, "sizeName");
          const sizeCodeError = getError(variant.id, "sizeCode");
          const skuError = getError(variant.id, "sku");
          const stockError = getError(variant.id, "stockQuantity");
          const priceError = getError(variant.id, "price");
          const compareAtPriceError = getError(variant.id, "compareAtPrice");
          const weightError = getError(variant.id, "weight");
          const detailsError = getError(variant.id, "details");

          return (
            <AccordionItem key={variant.id} value={variant.id}>
              <AccordionTrigger>
                <div className="flex w-full items-center gap-3 pr-4">
                  <span className="font-medium">
                    Size {index + 1}: {summary.label}
                  </span>
                  <Badge variant="secondary">${summary.price}</Badge>
                  <Badge variant="outline">Stock: {summary.stock}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="overflow-y-scroll">
                <div className="flex flex-col gap-5">
                  <FieldGroup>
                    <Field data-invalid={!!sizeNameError}>
                      <FieldLabel>Size Name</FieldLabel>
                      <Input
                        placeholder="e.g. Small"
                        value={variant.sizeName}
                        aria-invalid={!!sizeNameError}
                        onChange={(event) => {
                          setVariantField(
                            variant.id,
                            "sizeName",
                            event.target.value,
                          );
                          touchVariantField(variant.id, "sizeName");
                        }}
                        onBlur={() => touchVariantField(variant.id, "sizeName")}
                      />
                      <FieldError>{sizeNameError}</FieldError>
                    </Field>

                    <Field data-invalid={!!sizeCodeError}>
                      <FieldLabel>Size Code (Optional)</FieldLabel>
                      <Input
                        placeholder="e.g. S"
                        value={variant.sizeCode}
                        aria-invalid={!!sizeCodeError}
                        onChange={(event) => {
                          setVariantField(
                            variant.id,
                            "sizeCode",
                            event.target.value,
                          );
                          touchVariantField(variant.id, "sizeCode");
                        }}
                        onBlur={() => touchVariantField(variant.id, "sizeCode")}
                      />
                      <FieldError>{sizeCodeError}</FieldError>
                    </Field>

                    <Field data-invalid={!!skuError}>
                      <FieldLabel>SKU (Optional)</FieldLabel>
                      <Input
                        placeholder="e.g. TSH-RED-S"
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

                    <Field data-invalid={!!weightError}>
                      <FieldLabel>Weight (Optional)</FieldLabel>
                      <Input
                        placeholder="e.g. 1kg, 500ml"
                        value={variant.weight}
                        aria-invalid={!!weightError}
                        onChange={(event) => {
                          setVariantField(
                            variant.id,
                            "weight",
                            event.target.value,
                          );
                          touchVariantField(variant.id, "weight");
                        }}
                        onBlur={() => touchVariantField(variant.id, "weight")}
                      />
                      <FieldError>{weightError}</FieldError>
                    </Field>

                    <Field data-invalid={!!detailsError}>
                      <FieldLabel>Size Details (Optional)</FieldLabel>
                      <Textarea
                        placeholder="Add fit notes, body measurements, or guidance for this size."
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

                    <NameDescriptionTableField
                      title="Additional Size Details (Optional)"
                      subtitle="Track extra rows like chest, length, or fit tips for this size."
                      addLabel="Add detail row"
                      value={variant.metadataRows ?? []}
                      onChange={(rows) => {
                        setVariantField(variant.id, "metadataRows", rows);
                        touchVariantField(variant.id, "metadataRows");
                      }}
                      namePlaceholder="e.g. Chest"
                      descriptionPlaceholder="e.g. 38-40 in"
                    />
                  </FieldGroup>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/20 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <PackageSearchIcon />
                      Keep each size variant complete for accurate inventory
                      sync.
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={variants.length <= 1}
                      onClick={() => removeVariant(variant.id)}
                    >
                      <Trash2Icon data-icon="inline-start" />
                      Remove Size
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
