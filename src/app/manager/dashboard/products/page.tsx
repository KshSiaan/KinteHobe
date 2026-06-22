"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { EyeIcon, PencilLineIcon, PlusIcon, SearchIcon } from "lucide-react";
import { products } from "./products-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  const { data, isPending } = useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<{
      message: string;
      lowestInStock: Array<{
        id: string;
        title: string;
        image: string;
        price: string;
        stockQuantity: number;
      }>;
      stats: {
        totalInStock: number;
        averagePrice: number;
        totalOutOfStock: number;
        lastUpdated: string;
      };
      data: Array<{
        id: string;
        slug: string;
        category: {
          id: string;
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
        categoryId: string;
        status: string;
        variantIds: Array<string>;
        createdAt: string;
        updatedAt: string;
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
          publicImages: Array<string>;
        }>;
      }>;
    }> => {
      const response = await fetch("/api/manage/product");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
  });

  if (isPending) {
    return <div>Loading...</div>;
  }
  return (
    <div className="p-6 gap-6 flex flex-col flex-1 h-full w-full">
      <div className="flex flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <Button asChild>
          <Link href={"products/add"}>
            <PlusIcon />
            Add Product
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Card className="row-span-2">
          <CardHeader>
            <CardTitle>Lowest Product in stock</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 grid grid-cols-3 gap-4">
            {data?.lowestInStock.map((product) => (
              <Card key={product.id} className="pt-0">
                <CardHeader
                  className="flex-1 w-full bg-muted bg-cover bg-center bg-no-repeat h-full"
                  style={{ backgroundImage: `url(${product.image})` }}
                ></CardHeader>
                <CardFooter>
                  <CardTitle className="text-sm line-clamp-1">
                    {product.title}
                  </CardTitle>
                </CardFooter>
              </Card>
            ))}
          </CardContent>
        </Card>
        <div className="w-full grid grid-cols-2 gap-6">
          <Card className="">
            <CardHeader>
              <CardTitle>Total in stock (including variants)</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {data?.stats.totalInStock.toLocaleString()}
            </CardContent>
          </Card>
          <Card className="">
            <CardHeader>
              <CardTitle>Total out of stock</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {data?.stats.totalOutOfStock.toLocaleString()}
            </CardContent>
          </Card>
        </div>
        <div className="w-full grid grid-cols-2 gap-6">
          <Card className="">
            <CardHeader>
              <CardTitle>Average Pricing</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              ${data?.stats.averagePrice.toFixed(2)}
            </CardContent>
          </Card>
          <Card className="">
            <CardHeader>
              <CardTitle>Last Updated</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">
              {data?.stats.lastUpdated
                ? (() => {
                    const days = Math.floor(
                      (new Date().getTime() -
                        new Date(data.stats.lastUpdated).getTime()) /
                        (1000 * 60 * 60 * 24),
                    );

                    return days === 0 ? "Today" : `${days} days ago`;
                  })()
                : "N/A"}
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardContent className="flex justify-between items-center gap-6">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search Product" />
          </InputGroup>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="high-stock">High Stock</SelectItem>
              <SelectItem value="high-stock">Last Updated</SelectItem>
              <SelectItem value="high-stock">Last Created</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {/* <TableHead>Product ID</TableHead> */}
                <TableHead>Product Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* <ProductTable /> */}
              {data?.data.map((product) => {
                const base = product.variants.find((x) => x.kind === "base");
                return (
                  <TableRow key={product.id}>
                    {/* <TableCell>{product.id}</TableCell> */}
                    <TableCell>
                      <Image
                        height={100}
                        width={100}
                        src={base?.publicImages[0] || "/placeholder.png"}
                        alt={base?.title || "Product Image"}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </TableCell>
                    <TableCell>{base?.title || "N/A"}</TableCell>
                    <TableCell>{product?.category?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product?.status === "active"
                            ? "success"
                            : product?.status === "draft"
                              ? "warning"
                              : product?.status === "archived"
                                ? "outline"
                                : "ghost"
                        }
                      >
                        {product?.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      ${Number(base?.price || 0).toFixed(2) || "N/A"}
                    </TableCell>
                    <TableCell>
                      {Number(base?.stockQuantity || 0).toFixed(0) || "N/A"}
                    </TableCell>
                    <TableCell className="space-x-4">
                      <Button variant="outline" size="icon-lg">
                        <EyeIcon />
                      </Button>
                      <Button variant="outline" size="icon-lg">
                        <PencilLineIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
