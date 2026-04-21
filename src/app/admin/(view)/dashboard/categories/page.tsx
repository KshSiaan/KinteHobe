import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, PlusIcon, Trash2Icon } from "lucide-react";
import React from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  status: "active" | "inactive" | "archived";
  createdAt: string;
}

const categories: Category[] = [
  {
    id: "cat-001",
    name: "Electronics",
    slug: "electronics",
    description: "Computers, phones, and gadgets",
    productCount: 248,
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "cat-002",
    name: "Fashion",
    slug: "fashion",
    description: "Clothing, shoes, and accessories",
    productCount: 512,
    status: "active",
    createdAt: "2024-01-20",
  },
  {
    id: "cat-003",
    name: "Home & Garden",
    slug: "home-garden",
    description: "Furniture, decor, and outdoor items",
    productCount: 186,
    status: "active",
    createdAt: "2024-02-01",
  },
  {
    id: "cat-004",
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    description: "Sports equipment and outdoor gear",
    productCount: 94,
    status: "active",
    createdAt: "2024-02-10",
  },
  {
    id: "cat-005",
    name: "Books & Media",
    slug: "books-media",
    description: "Books, movies, and digital content",
    productCount: 367,
    status: "active",
    createdAt: "2024-02-15",
  },
  {
    id: "cat-006",
    name: "Beauty & Personal Care",
    slug: "beauty-care",
    description: "Cosmetics, skincare, and wellness",
    productCount: 203,
    status: "active",
    createdAt: "2024-03-01",
  },
  {
    id: "cat-007",
    name: "Toys & Games",
    slug: "toys-games",
    description: "Children's toys and board games",
    productCount: 156,
    status: "inactive",
    createdAt: "2024-03-10",
  },
  {
    id: "cat-008",
    name: "Pet Supplies",
    slug: "pet-supplies",
    description: "Pet food, toys, and accessories",
    productCount: 128,
    status: "active",
    createdAt: "2024-03-15",
  },
];

export default function Page() {
  return (
    <div className="p-6 flex flex-col flex-1 h-full w-full">
      <div className="flex flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <Button>
          <PlusIcon />
          Add new Category
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-center">Products</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-mono text-sm">{category.id}</TableCell>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell className="text-slate-600">/{category.slug}</TableCell>
              <TableCell className="text-sm text-slate-600">
                {category.description}
              </TableCell>
              <TableCell className="text-center font-semibold">
                {category.productCount}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    category.status === "active"
                      ? "default"
                      : category.status === "inactive"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {category.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {category.createdAt}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    title="View user"
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    title="Ban user"
                    className="h-8 w-8 p-0 text-red-600"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
