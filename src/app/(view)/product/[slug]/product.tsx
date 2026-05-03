"use client";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, Share2, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import RatingReviews from "./rating-reviews";
import { Card, CardContent } from "@/components/ui/card";

export default function Product({
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
      parentId: any;
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
      optionName: any;
      images: Array<string>;
      createdAt: string;
      updatedAt: string;
    }>;
  };
}) {
  const [activeVariant, setActiveVariant] = React.useState(
    data.variants.find((v) => v.kind === "base") || data.variants[0],
  );

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  // Reset index when variant changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    setActiveImageIndex(0);
  }, [activeVariant]);

  const images = activeVariant?.images || [];

  // Prevent out-of-bounds access
  const safeIndex = activeImageIndex >= images.length ? 0 : activeImageIndex;

  const activeImage = images[safeIndex] || "https://placehold.co/900x600.png";
  const sizes = data.variants.reduce((acc, variant) => {
    if (variant.kind === "size") {
      acc.add(variant.weight || "Unknown Size");
    }
    return acc;
  }, new Set<string>());
  const base = data.variants.find((v) => v.kind === "base");
  const colors = data?.variants.filter((v) => v.kind === "color") || [];

  const priceNum = parseFloat(activeVariant?.price || "0");
  const compareNum = parseFloat(activeVariant?.compareAtPrice || "0");
  const discount =
    compareNum > priceNum
      ? Math.round(((compareNum - priceNum) / compareNum) * 100)
      : 0;
  const isOutOfStock =
    !activeVariant?.stockQuantity || activeVariant.stockQuantity <= 0;

  const ratingData = [
    { stars: 5, count: 90, total: 100 },
    { stars: 4, count: 5, total: 100 },
    { stars: 3, count: 0, total: 100 },
    { stars: 2, count: 5, total: 100 },
    { stars: 1, count: 0, total: 100 },
  ];

  const averageRating = 4.5;
  const totalReviews = 120;

  return (
    <div className="col-span-3">
      <header className="h-[calc(80vh-104px)] grid grid-cols-3 gap-6 py-2">
        {/* Main Image */}
        <div className="h-full w-full relative col-span-2 border rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 group">
          <Image
            src={activeImage}
            alt="Product Image"
            fill
            className="object-contain object-center w-full transition-transform duration-300 group-hover:scale-105"
            priority
          />
          {discount > 0 && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
              -{discount}%
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-xs">
            {safeIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="grid grid-rows-3 gap-4 overflow-y-auto pr-2">
          {images.map((img, index) => (
            // biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
            // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              className="relative w-full h-full cursor-pointer rounded-lg overflow-hidden group/thumb"
              onClick={() => setActiveImageIndex(index)}
            >
              <Image
                src={img || "https://placehold.co/900x600.png"}
                alt={`Thumbnail ${index}`}
                fill
                className={`object-contain bg-slate-50 transition-all duration-200 ${
                  safeIndex === index
                    ? "ring-2 ring-blue-500 border"
                    : "opacity-60 hover:opacity-100 border"
                }`}
              />
            </div>
          ))}
        </div>
      </header>
      <div className="grid grid-cols-3 gap-6 mt-6 py-4 border-b">
        <div className="col-span-2">
          {/* Sizes Section */}
          {sizes.size > 0 && (
            <div className="mb-6">
              <div className="font-semibold text-sm text-slate-700 mb-3">
                Available Sizes
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(sizes).map((size) => (
                  <Badge
                    key={size}
                    variant="outline"
                    className="px-3 py-1.5 cursor-pointer hover:bg-slate-100 transition"
                  >
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Colors Section */}
          {colors.length > 0 && (
            <div>
              <div className="font-semibold text-sm text-slate-700 mb-3">
                Available Colors
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveVariant(base || data.variants[0]);
                  }}
                  className={`overflow-hidden size-8 aspect-square rounded-lg border-2 transition-all ${
                    activeVariant?.kind !== "color"
                      ? "ring-2 ring-blue-500 border-blue-500"
                      : "border-slate-300 hover:border-slate-400"
                  } cursor-pointer bg-white relative`}
                  title="Original"
                >
                  <div className="w-6 h-12 bg-slate-800 absolute -top-3 transform -left-0.5 -translate-x-1/2 rotate-6"></div>
                </button>
                {colors.map((color) => (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveVariant(color);
                    }}
                    key={color.code}
                    className={`size-8 aspect-square rounded-lg border-2 transition-all ${
                      activeVariant?.id === color.id
                        ? "ring-2 ring-blue-500 border-blue-500"
                        : "border-slate-300 hover:border-slate-400"
                    } cursor-pointer`}
                    style={{
                      backgroundColor: color.code,
                    }}
                    title={color.title}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Product Info */}
      <div className="flex flex-col gap-6 mt-8">
        {/* Header with Title and Actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {activeVariant?.title || "Product Title"}
            </h1>
            {activeVariant?.sku && (
              <p className="text-sm text-slate-600">
                Product ID:{" "}
                <span className="font-mono font-semibold">
                  #{activeVariant?.sku || "N/A"}
                </span>
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="rounded-lg"
            >
              <Heart
                size={20}
                className={isWishlisted ? "fill-red-500 text-red-500" : ""}
              />
            </Button>
            <Button size="icon" variant="outline" className="rounded-lg">
              <Share2 size={20} />
            </Button>
          </div>
        </div>

        {/* Stock & Price Section */}

        {/* Availability */}
        <div className="flex items-center gap-3 rounded-lg ">
          {isOutOfStock ? (
            <>
              <AlertCircle className="text-red-500" size={20} />
              <div>
                <p className="text-xs text-slate-600">Availability:</p>
                <p className="font-semibold text-red-600">Out of Stock</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-600">Availability:</p>
              <p className="font-semibold text-green-600">
                In Stock ({activeVariant?.stockQuantity} left)
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 ">
          <p className="text-xs text-slate-600">Price:</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ${activeVariant?.price || "Free"}
            </span>
            {discount > 0 && (
              <span className="text-sm line-through text-slate-500">
                ${activeVariant?.compareAtPrice}
              </span>
            )}
          </div>
        </div>
        {/* Product Details Section */}
        <div className="mt-6 pt-6 border-t">
          <h2 className="font-bold text-lg text-slate-900 mb-3">
            Product Details
          </h2>
          <p className="text-slate-700 leading-relaxed mb-6">
            {activeVariant?.details || "Product description goes here."}
          </p>

          {/* Specifications Table */}
          {activeVariant?.metadata && activeVariant.metadata.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4">
                Specifications
              </h3>
              <Table>
                <TableBody>
                  {activeVariant.metadata.map((meta) => (
                    <TableRow
                      key={meta.id}
                      className="hover:bg-slate-100 transition"
                    >
                      <TableCell className="font-semibold text-slate-900 py-3 w-1/3">
                        {meta.name}
                      </TableCell>
                      <TableCell className="text-slate-700 py-3">
                        {meta.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        <Separator />
        <RatingReviews />
      </div>
    </div>
  );
}
