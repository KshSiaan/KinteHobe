import { Suspense } from "react";
import Add from "./add";
import { Spinner } from "@/components/kibo-ui/spinner";
import { howl } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PencilLineIcon, Trash2Icon } from "lucide-react";
import DeletePromotionButton from "./delete-promotion-button";

export const dynamic = "force-dynamic";

export default async function Page() {
  const promotions: {
    message: string;
    ok: boolean;
    data: {
      id: string;
      promotionTitle: string;
      promotionUrl: string;
      appearance: string;
      variant: string;
      createdAt: string;
    }[];
  } = await howl(`${process.env.NEXT_PUBLIC_API_URL}/api/client/promotions`);
  return (
    <div className="w-full h-full flex flex-col gap-4 justify-start">
      <Suspense
        fallback={
          <div className="w-full flex items-center justify-center">
            <Spinner variant="bars" />
          </div>
        }
      >
        <Add />
      </Suspense>
      <section className="p-6 pt-2">
        <Card>
          <CardContent>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Appearance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.data.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell>{promotion.promotionTitle}</TableCell>
                    <TableCell>{promotion.promotionUrl}</TableCell>
                    <TableCell className="capitalize">
                      {promotion.variant}
                    </TableCell>
                    <TableCell className="capitalize">
                      Type {promotion.appearance}
                    </TableCell>
                    <TableCell className="flex gap-2 items-center">
                      <DeletePromotionButton promotionId={promotion.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
