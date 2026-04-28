"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductBaseOutput } from "./base";
import type { ProductColorVariantsOutput } from "./color";
import type { ProductCustomVariantsOutput } from "./custom";
import type { ProductSizeVariantsOutput } from "./size";

function createInitialBaseValues(): ProductBaseOutput {
  return {
    draftValues: {
      images: [],
      title: "",
      description: "",
      stockQuantity: "",
      sku: "",
      weight: "",
      price: "",
      compareAtPrice: "",
      metadataRows: [],
    },
    values: null,
    isValid: false,
    errors: {},
  };
}

function createInitialColorValues(): ProductColorVariantsOutput {
  return {
    draftValues: [],
    values: null,
    isValid: false,
    errors: {},
    rootError: "Add at least one color variant.",
  };
}

function createInitialSizeValues(): ProductSizeVariantsOutput {
  return {
    draftValues: [],
    values: null,
    isValid: false,
    errors: {},
    rootError: "Add at least one size variant.",
  };
}

type ProductAddDatasetState = {
  baseValues: ProductBaseOutput;
  baseInputValues: ProductBaseOutput["draftValues"];
  colorValues: ProductColorVariantsOutput;
  sizeValues: ProductSizeVariantsOutput;
  customValues: Record<string, ProductCustomVariantsOutput>;
  colorVariantActive: boolean;
  sizeVariantActive: boolean;
  customVariantList: string[];
  showVariant: string;
  setBaseValues: (output: ProductBaseOutput) => void;
  setColorValues: (output: ProductColorVariantsOutput) => void;
  setSizeValues: (output: ProductSizeVariantsOutput) => void;
  setCustomValues: (customKey: string, output: ProductCustomVariantsOutput) => void;
  setColorVariantActive: (active: boolean) => void;
  setSizeVariantActive: (active: boolean) => void;
  setCustomVariantList: (
    next:
      | string[]
      | ((previous: string[]) => string[]),
  ) => void;
  setShowVariant: (tab: string) => void;
  resetDataset: () => void;
  resetVersion: number;
};

function withoutFilesFromBase(output: ProductBaseOutput): ProductBaseOutput {
  return {
    ...output,
    draftValues: {
      ...output.draftValues,
      images: [],
    },
    values: null,
  };
}

function withoutFilesFromColor(
  output: ProductColorVariantsOutput,
): ProductColorVariantsOutput {
  return {
    ...output,
    draftValues: output.draftValues.map((variant) => ({
      ...variant,
      images: [],
    })),
    values: null,
  };
}

export const useProductAddDatasetStore = create<ProductAddDatasetState>()(
  persist(
    (set) => ({
      baseValues: createInitialBaseValues(),
      baseInputValues: createInitialBaseValues().draftValues,
      colorValues: createInitialColorValues(),
      sizeValues: createInitialSizeValues(),
      customValues: {},
      colorVariantActive: false,
      sizeVariantActive: false,
      customVariantList: [],
      showVariant: "base",
      resetVersion: 0,
      setBaseValues: (output) =>
        set({ baseValues: output, baseInputValues: output.draftValues }),
      setColorValues: (output) => set({ colorValues: output }),
      setSizeValues: (output) => set({ sizeValues: output }),
      setCustomValues: (customKey, output) =>
        set((previous) => ({
          customValues: {
            ...previous.customValues,
            [customKey]: output,
          },
        })),
      setColorVariantActive: (active) => set({ colorVariantActive: active }),
      setSizeVariantActive: (active) => set({ sizeVariantActive: active }),
      setCustomVariantList: (next) =>
        set((previous) => ({
          customVariantList:
            typeof next === "function" ? next(previous.customVariantList) : next,
        })),
      setShowVariant: (tab) => set({ showVariant: tab }),
        resetDataset: () =>
          set((previous) => ({
            baseValues: createInitialBaseValues(),
            baseInputValues: createInitialBaseValues().draftValues,
            colorValues: createInitialColorValues(),
            sizeValues: createInitialSizeValues(),
            customValues: {},
            colorVariantActive: false,
            sizeVariantActive: false,
            customVariantList: [],
            showVariant: "base",
            resetVersion: previous.resetVersion + 1,
          })),
    }),
    {
      name: "product-add-dataset-store",
      partialize: (state) => ({
        ...state,
        baseValues: withoutFilesFromBase(state.baseValues),
        baseInputValues: {
          ...state.baseInputValues,
          images: [],
        },
        colorValues: withoutFilesFromColor(state.colorValues),
      }),
    },
  ),
);
