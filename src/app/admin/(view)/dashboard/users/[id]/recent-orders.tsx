import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, GalleryVerticalEndIcon } from "lucide-react";
import React from "react";
import OrderAction from "../../orders/order-action";

type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "awaiting_cod";
const STATUS_BADGE: Record<
  OrderStatus,
  "default" | "secondary" | "success" | "destructive" | "warning"
> = {
  pending_payment: "secondary",
  paid: "default",
  processing: "warning",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
  refunded: "destructive",
  awaiting_cod: "warning",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  awaiting_cod: "Cash on Delivery",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};
export default function RecentOrders({
  data,
}: {
  data: {
    id: string;
    userId: string;
    email: string;
    status: OrderStatus;
    shippingName: string;
    shippingPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingState: string;
    shippingZip: string;
    shippingCountry: string;
    subtotalCents: number;
    taxCents: number;
    shippingCents: number;
    totalCents: number;
    paymentMethod: string;
    stripeSessionId: string | null;
    createdAt: string;
    updatedAt: string;
    items: {
      id: string;
      orderId: string;
      productId: string;
      variantId: string;
      productTitle: string;
      variantTitle: string;
      sku: string;
      quantity: number;
      unitPriceCents: number;
      lineTotalCents: number;
      imageUrl: string;
    }[];
  }[];
}) {
  return (
    <Card className="w-full">
      <CardContent className="overflow-x-auto">
        <Table className="min-w-150">
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-sm">{o.id}</TableCell>
                <TableCell>{o.shippingName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {o.email}
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(o.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="font-semibold">
                  ${(o.totalCents / 100).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE[o.status]}>
                    {STATUS_LABEL[o.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <GalleryVerticalEndIcon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Order Confirmation</DialogTitle>
                        <DialogDescription>
                          Change order status or contact the customer.
                        </DialogDescription>
                      </DialogHeader>
                      <OrderAction id={o.id} status={o.status} />
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
