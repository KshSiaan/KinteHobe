"use client";

import { create } from "zustand";

type ProductSelectionState = {
  productId: string | null;
  selectedVariantId: string | null;
  setSelection: (input: {
    productId: string;
    selectedVariantId: string;
  }) => void;
  resetSelection: () => void;
};

export const useProductSelectionStore = create<ProductSelectionState>((set) => ({
  productId: null,
  selectedVariantId: null,
  setSelection: ({ productId, selectedVariantId }) =>
    set({ productId, selectedVariantId }),
  resetSelection: () => set({ productId: null, selectedVariantId: null }),
}));