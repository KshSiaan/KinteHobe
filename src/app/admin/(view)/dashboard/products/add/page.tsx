"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCategories } from "@/lib/api/base";
import { useQuery } from "@tanstack/react-query";
import {
  ArchiveIcon,
  FileClockIcon,
  PlusIcon,
  Undo2,
  UploadIcon,
  ZapIcon,
} from "lucide-react";
import React from "react";
import Base, { type ProductBaseOutput } from "./base";
import Colors, { type ProductColorVariantsOutput } from "./color";
import Sizes, { type ProductSizeVariantsOutput } from "./size";
import CustomVariants, { type ProductCustomVariantsOutput } from "./custom";
import DatasetPreviewSheet from "./dataset-preview-sheet";
import { useProductAddDatasetStore } from "./use-product-add-dataset-store";

export default function Page() {
  const baseValues = useProductAddDatasetStore((state) => state.baseValues);
  const baseInputValues = useProductAddDatasetStore(
    (state) => state.baseInputValues,
  );
  const colorValues = useProductAddDatasetStore((state) => state.colorValues);
  const sizeValues = useProductAddDatasetStore((state) => state.sizeValues);
  const customValues = useProductAddDatasetStore((state) => state.customValues);
  const colorVariantActive = useProductAddDatasetStore(
    (state) => state.colorVariantActive,
  );
  const sizeVariantActive = useProductAddDatasetStore(
    (state) => state.sizeVariantActive,
  );
  const customVariantList = useProductAddDatasetStore(
    (state) => state.customVariantList,
  );
  const showVariant = useProductAddDatasetStore((state) => state.showVariant);
  const setBaseValues = useProductAddDatasetStore(
    (state) => state.setBaseValues,
  );
  const setColorValues = useProductAddDatasetStore(
    (state) => state.setColorValues,
  );
  const setSizeValues = useProductAddDatasetStore(
    (state) => state.setSizeValues,
  );
  const setCustomValues = useProductAddDatasetStore(
    (state) => state.setCustomValues,
  );
  const setColorVariantActive = useProductAddDatasetStore(
    (state) => state.setColorVariantActive,
  );
  const setSizeVariantActive = useProductAddDatasetStore(
    (state) => state.setSizeVariantActive,
  );
  const setCustomVariantList = useProductAddDatasetStore(
    (state) => state.setCustomVariantList,
  );
  const setShowVariant = useProductAddDatasetStore(
    (state) => state.setShowVariant,
  );
  const [customVariantTitle, setCustomVariantTitle] = React.useState("");
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const handleBaseChange = React.useCallback(
    (output: ProductBaseOutput) => {
      setBaseValues(output);
    },
    [setBaseValues],
  );
  const handleColorsChange = React.useCallback(
    (output: ProductColorVariantsOutput) => {
      setColorValues(output);
    },
    [setColorValues],
  );
  const handleSizesChange = React.useCallback(
    (output: ProductSizeVariantsOutput) => {
      setSizeValues(output);
    },
    [setSizeValues],
  );
  const handleCustomChange = React.useCallback(
    (customKey: string, output: ProductCustomVariantsOutput) => {
      setCustomValues(customKey, output);
    },
    [setCustomValues],
  );

  const hasInvalidCustomVariants = React.useMemo(
    () =>
      customVariantList.some((_, index) => {
        const key = `custom-${index}`;
        return !customValues[key]?.isValid;
      }),
    [customValues, customVariantList],
  );

  const canSubmit = React.useMemo(() => {
    if (!baseValues.isValid) {
      return false;
    }

    if (
      baseInputValues.title.trim().length === 0 ||
      baseInputValues.images.length === 0
    ) {
      return false;
    }

    if (colorVariantActive && !colorValues.isValid) {
      return false;
    }

    if (sizeVariantActive && !sizeValues.isValid) {
      return false;
    }

    if (hasInvalidCustomVariants) {
      return false;
    }

    return true;
  }, [
    baseInputValues.images.length,
    baseInputValues.title,
    baseValues.isValid,
    colorValues.isValid,
    colorVariantActive,
    hasInvalidCustomVariants,
    sizeValues.isValid,
    sizeVariantActive,
  ]);

  const selectedCustomIndex = React.useMemo(() => {
    if (!showVariant.startsWith("custom-")) {
      return -1;
    }

    const parsed = Number.parseInt(showVariant.replace("custom-", ""), 10);
    return Number.isNaN(parsed) ? -1 : parsed;
  }, [showVariant]);

  const selectedCustomTitle =
    selectedCustomIndex >= 0
      ? (customVariantList[selectedCustomIndex] ??
        `Custom Variant ${selectedCustomIndex + 1}`)
      : "Custom Variant";

  const selectedCustomKey =
    selectedCustomIndex >= 0 ? `custom-${selectedCustomIndex}` : null;

  const handleSelectedCustomChange = React.useCallback(
    (output: ProductCustomVariantsOutput) => {
      if (!selectedCustomKey) {
        return;
      }
      handleCustomChange(selectedCustomKey, output);
    },
    [handleCustomChange, selectedCustomKey],
  );

  const motherObject = React.useMemo(
    () => ({
      baseVariant: {
        activeTab: showVariant,
        enabled: true,
        ...baseValues,
      },
      sizeVariant: {
        enabled: sizeVariantActive,
        ...sizeValues,
      },
      colorAndCustomVariants: {
        colorVariant: {
          enabled: colorVariantActive,
          ...colorValues,
        },
        customVariants: {
          titles: customVariantList,
          datasets: customValues,
        },
      },
    }),
    [
      baseValues,
      colorValues,
      colorVariantActive,
      customValues,
      customVariantList,
      showVariant,
      sizeValues,
      sizeVariantActive,
    ],
  );

  return (
    <div className="flex-1 w-full p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <p>This is the page where you can add a new product.</p>
      <Card>
        <CardContent className="space-y-4">
          <Label>Product Slug (for URL)</Label>
          <Input placeholder="Product Slug" />
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
          <div className="flex items-start">
            <Label className="flex-1">Product Status:</Label>
            <RadioGroup defaultValue="option-one" className="w-fit flex">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="option-one" id="option-one" />
                <Label htmlFor="option-one">
                  <ZapIcon className="size-3" />
                  Active
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="option-two" id="option-two" />
                <Label htmlFor="option-two">
                  <FileClockIcon className="size-3" />
                  Draft
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="option-three" id="option-three" />
                <Label htmlFor="option-three">
                  <ArchiveIcon className="size-3" />
                  Archived
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex justify-between items-center">
          <Tabs value={showVariant} onValueChange={setShowVariant}>
            <TabsList>
              <TabsTrigger
                className="data-active:bg-primary data-active:text-primary-foreground"
                value="base"
              >
                Base Variant
              </TabsTrigger>
              {colorVariantActive && (
                <TabsTrigger
                  className="data-active:bg-primary data-active:text-primary-foreground"
                  value="colors"
                >
                  Color Variant
                </TabsTrigger>
              )}
              {sizeVariantActive && (
                <TabsTrigger
                  className="data-active:bg-primary data-active:text-primary-foreground"
                  value="sizes"
                >
                  Size Variant
                </TabsTrigger>
              )}
              {customVariantList.map((_, index) => (
                <TabsTrigger
                  // biome-ignore lint/suspicious/noArrayIndexKey: Order is static for user-added labels.
                  key={index}
                  className="data-active:bg-primary data-active:text-primary-foreground"
                  value={`custom-${index}`}
                >
                  {customVariantList[index]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="items-center space-x-2 flex">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant={"outline"}>
                  <PlusIcon />
                  Add Custom Variant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Variant</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Label>Variant Title</Label>
                  <Input
                    placeholder={`Custom Variant #${customVariantList.length + 1}`}
                    value={customVariantTitle}
                    onChange={(e) => setCustomVariantTitle(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => {
                      const safeTitle =
                        customVariantTitle.trim() ||
                        `Custom Variant ${customVariantList.length + 1}`;
                      const nextList = [...customVariantList, safeTitle];
                      setCustomVariantList([...nextList]);
                      setCustomVariantTitle("");
                      setShowVariant(`custom-${nextList.length - 1}`);
                    }}
                  >
                    Add Variant
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <PlusIcon />
                  Add Defined variant
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem
                  checked={colorVariantActive}
                  onCheckedChange={(checked) =>
                    setColorVariantActive(checked === true)
                  }
                >
                  Color Variant
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sizeVariantActive}
                  onCheckedChange={(checked) =>
                    setSizeVariantActive(checked === true)
                  }
                >
                  Size Variant
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      <Card>
        {showVariant === "base" ? (
          <Base
            initialDraftValues={baseValues.draftValues}
            onChange={handleBaseChange}
          />
        ) : showVariant === "colors" ? (
          <Colors
            initialDraftValues={colorValues.draftValues}
            onChange={handleColorsChange}
          />
        ) : showVariant === "sizes" ? (
          <Sizes
            initialDraftValues={sizeValues.draftValues}
            onChange={handleSizesChange}
          />
        ) : selectedCustomIndex >= 0 ? (
          <CustomVariants
            key={selectedCustomKey}
            variantTitle={selectedCustomTitle}
            initialDraftValues={
              selectedCustomKey
                ? customValues[selectedCustomKey]?.draftValues
                : undefined
            }
            onChange={handleSelectedCustomChange}
          />
        ) : (
          <div className="p-6">Variant form goes here</div>
        )}
      </Card>
      <Card>
        <CardContent className="pt-2 pb-4">
          {/* Alert-style info block using accent colors */}
          <div className="rounded-lg bg-accent p-4 space-y-2">
            <div className="flex gap-3 items-start">
              <span className="text-destructive font-bold text-lg shrink-0">
                *
              </span>
              <div className="space-y-1">
                <p className="font-semibold text-accent-foreground">
                  Complete all fields before adding
                </p>
                <p className="text-sm text-accent-foreground/90">
                  You can edit product details anytime after adding, but verify
                  everything first to avoid errors.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center gap-2">
          <Button variant="outline">
            <Undo2 className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button disabled={!canSubmit}>
            <UploadIcon className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </CardFooter>
      </Card>
      <DatasetPreviewSheet motherObject={motherObject} />
    </div>
  );
}
