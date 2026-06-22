import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { CategoryType } from "@/types/schemas";
import Image from "next/image";

export default function View({ data }: { data: CategoryType[number] }) {
  const createdAt = new Date(data.createdAt).toLocaleString();
  const updatedAt = new Date(data.updatedAt).toLocaleString();

  return (
    <>
      <DialogHeader>
        <DialogTitle>{data.name}</DialogTitle>
        <DialogDescription>
          Complete category dataset overview
        </DialogDescription>
      </DialogHeader>

      <div className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="ID" value={data.id} />
                <Field label="Parent ID" value={data.parentId ?? "-"} />
                <Field label="Name" value={data.name} />
                <Field label="Slug" value={data.slug} />
              </div>
              <Separator />
              <Field label="Description" value={data.description ?? "-"} />
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={data.isActive ? "default" : "destructive"}>
                  {data.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">Icon</p>
                {data.image ? (
                  <Image
                    src={data.image}
                    alt={data.name}
                    width={200}
                    height={200}
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No Image</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">Banner</p>
                {data.banner ? (
                  <Image
                    src={data.banner}
                    alt={data.name}
                    width={600}
                    height={200}
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No Banner</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Field label="Meta Title" value={data.metaTitle ?? "-"} />
              <Field
                label="Meta Description"
                value={data.metaDescription ?? "-"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Created At" value={createdAt} />
              <Field label="Updated At" value={updatedAt} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="wrap-break-word text-sm font-medium">{value}</p>
    </div>
  );
}
