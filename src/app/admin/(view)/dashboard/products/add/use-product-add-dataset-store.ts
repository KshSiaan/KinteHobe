"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductBaseOutput } from "./base";
import type { ProductColorVariantsOutput } from "./color";
import type { ProductCustomVariantsOutput } from "./custom";
import type { ProductSizeVariantsOutput } from "./size";

const initialBaseValues: ProductBaseOutput = {
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

const initialColorValues: ProductColorVariantsOutput = {
  draftValues: [],
  values: null,
  isValid: false,
  errors: {},
  rootError: "Add at least one color variant.",
};

const initialSizeValues: ProductSizeVariantsOutput = {
  draftValues: [],
  values: null,
  isValid: false,
  errors: {},
  rootError: "Add at least one size variant.",
};

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
      baseValues: initialBaseValues,
      baseInputValues: initialBaseValues.draftValues,
      colorValues: initialColorValues,
      sizeValues: initialSizeValues,
      customValues: {},
      colorVariantActive: false,
      sizeVariantActive: false,
      customVariantList: [],
      showVariant: "base",
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
