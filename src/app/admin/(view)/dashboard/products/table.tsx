"use client";
import ImageViewer_Motion from "@/components/commerce-ui/image-viewer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Eye, Trash2Icon } from "lucide-react";
import React from "react";
import { products } from "./products-data";
export default function ProductTable() {
  return products.map((product) => (
    <TableRow key={product.id}>
      <TableCell className="font-mono text-sm">{product.id}</TableCell>
      <TableCell className="font-mono text-sm">
        <ImageViewer_Motion
          thumbnailUrl={product.image}
          imageUrl={product.image}
          className="size-25 rounded-lg"
        />
      </TableCell>
      <TableCell className="font-medium">{product.title}</TableCell>
      <TableCell className="text-sm">{product.category}</TableCell>
      <TableCell className="font-medium">${product.price.toFixed(2)}</TableCell>
      <TableCell>
        <Badge
          variant={
            product.stock > 10
              ? "default"
              : product.stock > 0
                ? "secondary"
                : "destructive"
          }
        >
          {product.stock} in stock
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            title="View product"
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            title="Delete product"
            className="h-8 w-8 p-0 text-red-600"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ));
}
