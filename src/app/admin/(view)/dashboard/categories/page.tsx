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
import React, { Suspense } from "react";
import Add from "./add";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import View from "./view";
import Image from "next/image";

import Delete from "./delete";
import Edit from "./edit";
import { category } from "@/db/schema";
import { db } from "@/lib/db";
import { createSupabaseStorageClient } from "@/lib/storage/supabase";

export default async function Page() {
  const categories = await db.select().from(category);
  const storage = createSupabaseStorageClient();
  const categoryRows = categories.map((item) => ({
    ...item,
    image: item.image
      ? storage.storage.from("category").getPublicUrl(item.image).data.publicUrl
      : null,
    banner: item.banner
      ? storage.storage.from("category").getPublicUrl(item.banner).data
          .publicUrl
      : null,
  }));
  return (
    <div className="p-3 sm:p-6 flex flex-col flex-1 h-full w-full">
      <div className="flex flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Manage Categories</h1>
        <Suspense
          fallback={
            <Button disabled>
              <PlusIcon className="animate-spin" />
            </Button>
          }
        >
          <Add />
        </Suspense>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-120">
          <TableHeader>
            <TableRow>
              <TableHead>Category Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              {/* <TableHead className="text-center">Products</TableHead> */}
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryRows.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-mono text-sm">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-slate-600">
                  /{category.slug}
                </TableCell>
                {/* <TableCell className="text-center font-semibold">
                {category.productCount}
              </TableCell> */}
                <TableCell>
                  <Badge
                    variant={
                      category.isActive
                        ? "default"
                        : category.isActive
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {new Date(category.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" title="View category">
                          <Eye />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="min-w-[60dvw]">
                        <View data={category} />
                      </DialogContent>
                    </Dialog>
                    <Edit category={category} />
                    <Delete data={category} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
