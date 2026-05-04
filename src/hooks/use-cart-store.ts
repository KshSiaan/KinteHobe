"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartSelection = {
  variantId: string;
  kind: "base" | "color" | "size" | "custom" | string;
  title: string;
  sku?: string | null;
  price: string;
  compareAtPrice?: string | null;
  stockQuantity: number;
  images: string[];
  optionLabel?: string | null;
  optionValue?: string | null;
};

export type CartLineItem = {
  id: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  categoryId: string;
  quantity: number;
  selection: CartSelection;
  unitPrice: number;
  compareAtPrice?: number | null;
  lineTotal: number;
  lineCompareAtTotal?: number | null;
  createdAt: string;
  updatedAt: string;
};

type AddCartItemInput = {
  productId: string;
  productSlug: string;
  productTitle: string;
  categoryId: string;
  selection: CartSelection;
  quantity?: number;
};

type CartStoreState = {
  items: CartLineItem[];
  addItem: (item: AddCartItemInput) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  compareAtSubtotal: number;
};

function createLineId(input: AddCartItemInput) {
  const selectionKey = [
    input.selection.variantId,
    input.selection.kind,
    input.selection.optionLabel ?? "",
    input.selection.optionValue ?? "",
    input.selection.sku ?? "",
  ].join("|");

  return `${input.productId}:${selectionKey}`;
}

function toNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return value;
  const parsed = Number.parseFloat(value ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function getLineTotals(item: CartLineItem) {
  const lineTotal = item.unitPrice * item.quantity;
  const lineCompareAtTotal =
    item.compareAtPrice !== undefined && item.compareAtPrice !== null
      ? item.compareAtPrice * item.quantity
      : null;

  return {
    lineTotal,
    lineCompareAtTotal,
  };
}

function recalculateSummary(items: CartLineItem[]) {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
  const compareAtSubtotal = items.reduce(
    (total, item) => total + (item.lineCompareAtTotal ?? item.lineTotal),
    0,
  );

  return {
    itemCount,
    subtotal,
    compareAtSubtotal,
  };
}

function buildCartItem(input: AddCartItemInput): CartLineItem {
  const now = new Date().toISOString();
  const quantity = Math.max(1, input.quantity ?? 1);
  const unitPrice = toNumber(input.selection.price);
  const compareAtPrice =
    input.selection.compareAtPrice === undefined ||
    input.selection.compareAtPrice === null ||
    input.selection.compareAtPrice === ""
      ? null
      : toNumber(input.selection.compareAtPrice);

  const item: CartLineItem = {
    id: createLineId(input),
    productId: input.productId,
    productSlug: input.productSlug,
    productTitle: input.productTitle,
    categoryId: input.categoryId,
    quantity,
    selection: input.selection,
    unitPrice,
    compareAtPrice,
    lineTotal: 0,
    lineCompareAtTotal: null,
    createdAt: now,
    updatedAt: now,
  };

  const totals = getLineTotals(item);
  return {
    ...item,
    ...totals,
  };
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (input) => {
        const nextItem = buildCartItem(input);

        set((previous) => {
          const existingIndex = previous.items.findIndex(
            (item) => item.id === nextItem.id,
          );

          const maxQuantity = Math.max(1, nextItem.selection.stockQuantity || 1);

          if (existingIndex === -1) {
            const quantity = Math.min(nextItem.quantity, maxQuantity);
            const item = {
              ...nextItem,
              quantity,
              updatedAt: nextItem.createdAt,
            };

            const totals = getLineTotals(item);
            const items = [...previous.items, { ...item, ...totals }];
            return {
              items,
              ...recalculateSummary(items),
            };
          }

          const existingItem = previous.items[existingIndex];
          const quantity = Math.min(
            existingItem.quantity + nextItem.quantity,
            maxQuantity,
          );
          const updatedItem: CartLineItem = {
            ...existingItem,
            quantity,
            updatedAt: new Date().toISOString(),
          };

          const totals = getLineTotals(updatedItem);
          const items = previous.items.map((item, index) =>
            index === existingIndex
              ? {
                  ...updatedItem,
                  ...totals,
                }
              : item,
          );

          return {
            items,
            ...recalculateSummary(items),
          };
        });
      },
      updateQuantity: (lineId, quantity) => {
        const nextQuantity = Math.max(1, quantity);

        set((previous) => {
          const items = previous.items.map((item) => {
            if (item.id !== lineId) return item;

            const maxQuantity = Math.max(1, item.selection.stockQuantity || 1);
            const cappedQuantity = Math.min(nextQuantity, maxQuantity);

            const updatedItem: CartLineItem = {
              ...item,
              quantity: cappedQuantity,
              updatedAt: new Date().toISOString(),
            };

            return {
              ...updatedItem,
              ...getLineTotals(updatedItem),
            };
          });

          return {
            items,
            ...recalculateSummary(items),
          };
        });
      },
      removeItem: (lineId) => {
        set((previous) => {
          const items = previous.items.filter((item) => item.id !== lineId);
          return {
            items,
            ...recalculateSummary(items),
          };
        });
      },
      clearCart: () =>
        set({
          items: [],
          itemCount: 0,
          subtotal: 0,
          compareAtSubtotal: 0,
        }),
      itemCount: 0,
      subtotal: 0,
      compareAtSubtotal: 0,
    }),
    {
      name: "cart-store",
      partialize: (state) => ({
        items: state.items,
        itemCount: state.itemCount,
        subtotal: state.subtotal,
        compareAtSubtotal: state.compareAtSubtotal,
      }),
    },
  ),
);

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}