"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/use-cart-store";
import { useProductSelectionStore } from "@/hooks/use-product-selection-store";
import { ArrowDown, MinusIcon, PlusIcon, TruckIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function Controller({
  data,
}: {
  data: {
    product: {
      id: string;
      slug: string;
      categoryId: string;
      status: string;
      variantIds: Array<string>;
      createdAt: string;
      updatedAt: string;
    };
    category: {
      id: string;
      parentId: string | null;
      name: string;
      slug: string;
      description: string;
      image: string;
      banner: string;
      isActive: boolean;
      metaTitle: string;
      metaDescription: string;
      createdAt: string;
      updatedAt: string;
    };
    variants: Array<{
      id: string;
      groupId: string;
      code?: string;
      sku: string;
      price: string;
      compareAtPrice: string;
      stockQuantity: number;
      weight?: string;
      details: string;
      metadata: Array<{
        id: string;
        name: string;
        description: string;
      }>;
      position: number;
      kind: string;
      enabled: boolean;
      title: string;
      optionName: string | null;
      images: Array<string>;
      createdAt: string;
      updatedAt: string;
    }>;
  };
}) {
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const selectedVariantId = useProductSelectionStore(
    (state) => state.selectedVariantId,
  );
  const [quantity, setQuantity] = useState(1);

  const purchasableVariant =
    data.variants.find((variant) => variant.id === selectedVariantId) ||
    data.variants.find((variant) => variant.kind === "base") ||
    data.variants[0];

  const cartLineQuantity = useMemo(() => {
    if (!purchasableVariant) return 0;

    return (
      cartItems.find(
        (item) => item.selection.variantId === purchasableVariant.id,
      )?.quantity ?? 0
    );
  }, [cartItems, purchasableVariant]);

  const remainingStock = Math.max(
    0,
    (purchasableVariant?.stockQuantity ?? 0) - cartLineQuantity,
  );

  const isOutOfStock =
    !purchasableVariant || purchasableVariant.stockQuantity <= 0;
  const isAlreadyAtCartLimit =
    Boolean(purchasableVariant) && remainingStock <= 0 && !isOutOfStock;

  useEffect(() => {
    if (!purchasableVariant) return;

    setQuantity((current) => {
      const nextQuantity = Math.min(
        Math.max(1, current),
        Math.max(1, remainingStock || purchasableVariant.stockQuantity),
      );

      return Number.isFinite(nextQuantity) ? nextQuantity : 1;
    });
  }, [purchasableVariant, remainingStock]);

  return (
    <Card className="sticky top-30 self-start max-h-[calc(100vh-136px)]">
      <CardContent className="flex h-full w-full flex-col justify-between gap-6">
        <div className="space-y-4">
          <p className="flex items-center gap-2 font-semibold text-yellow-600 text-xs">
            <TruckIcon className="size-4" />
            This product would take 3-7 days to reach you.
          </p>

          {purchasableVariant ? (
            <div className="space-y-2 rounded-lg border p-4">
              <p className="font-bold text-sm text-green-600 flex items-center gap-1">
                Selected Product <ArrowDown className="size-4" />
              </p>
              <p className="font-semibold text-base">
                {purchasableVariant.title}
              </p>
              <p className="text-sm text-muted-foreground">
                ${purchasableVariant.price}
                {purchasableVariant.compareAtPrice ? (
                  <span className="line-through text-xs text-muted-foreground/70 ml-2">
                    ${purchasableVariant.compareAtPrice}
                  </span>
                ) : (
                  ""
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                Stock: {purchasableVariant.stockQuantity}
              </p>
            </div>
          ) : null}
        </div>
        <div className="space-y-3">
          <div className="flex items-stretch gap-3">
            <div className="flex min-w-28 items-center rounded-lg border bg-background">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-none!"
                disabled={isOutOfStock || quantity <= 1}
                onClick={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
              >
                <MinusIcon className="size-4" />
              </Button>
              <div className="flex-1 text-center text-sm font-semibold">
                {quantity}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-none!"
                disabled={
                  isOutOfStock ||
                  isAlreadyAtCartLimit ||
                  !purchasableVariant ||
                  quantity >= remainingStock
                }
                onClick={() =>
                  setQuantity((current) =>
                    purchasableVariant
                      ? Math.min(current + 1, remainingStock)
                      : current,
                  )
                }
              >
                <PlusIcon className="size-4" />
              </Button>
            </div>

            <Button
              className="flex-1 rounded-lg"
              disabled={
                isOutOfStock || isAlreadyAtCartLimit || !purchasableVariant
              }
              onClick={() => {
                if (!purchasableVariant) return;

                addItem({
                  productId: data.product.id,
                  productSlug: data.product.slug,
                  productTitle:
                    data.variants.find((variant) => variant.kind === "base")
                      ?.title ?? purchasableVariant.title,
                  categoryId: data.product.categoryId,
                  quantity,
                  selection: {
                    variantId: purchasableVariant.id,
                    kind: purchasableVariant.kind,
                    title: purchasableVariant.title,
                    sku: purchasableVariant.sku,
                    price: purchasableVariant.price,
                    compareAtPrice: purchasableVariant.compareAtPrice,
                    stockQuantity: purchasableVariant.stockQuantity,
                    images: purchasableVariant.images,
                    optionLabel:
                      purchasableVariant.kind === "color"
                        ? purchasableVariant.title
                        : purchasableVariant.optionName,
                    optionValue:
                      purchasableVariant.kind === "color"
                        ? purchasableVariant.code
                        : purchasableVariant.optionName,
                  },
                });
              }}
            >
              {isOutOfStock
                ? "Out of stock"
                : isAlreadyAtCartLimit
                  ? "Cart limit reached"
                  : "Add to cart"}
            </Button>
          </div>
          <Button
            className="w-full rounded-lg"
            variant="success"
            disabled={isOutOfStock || !purchasableVariant}
          >
            Buy it now
          </Button>
          <p className="text-muted-foreground text-xs">
            Quantity is limited to the stock remaining for the selected color,
            size, or custom variant.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
