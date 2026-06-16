"use client";

import {
  Card,
  CardContent,
  CardDescription,
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
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchIcon, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebounce } from "use-debounce";

type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

type Order = {
  id: string;
  userId: string | null;
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
  stripeSessionId: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  data: Order[];
  stats: {
    totalOrders: string;
    pendingPaymentCount: string;
    processingCount: string;
    deliveredCount: string;
    cancelledCount: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

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
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default function Page() {
  const [selectedFilter, setSelectedFilter] = useState("newest");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isPending, isFetching, isRefetching, isError } =
    useQuery<ApiResponse>({
      queryKey: ["orders", debouncedSearch, selectedStatus, selectedFilter],
      queryFn: async () => {
        return fetch(
          `/api/admin/orders?search=${debouncedSearch}&status=${selectedStatus}&filter=${selectedFilter}`,
        ).then((res) => res.json());
      },
      placeholderData: (previousData) => previousData,
    });

  const orders = data?.data ?? [];
  const stats = data?.stats;

  return (
    <div className="p-6 gap-6 flex flex-col flex-1 h-full w-full">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Total Orders</CardDescription>
            <CardTitle>
              {isPending ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                (stats?.totalOrders ?? 0)
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Pending Payment</CardDescription>
            <CardTitle>
              {isPending ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                (stats?.pendingPaymentCount ?? 0)
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Processing</CardDescription>
            <CardTitle>
              {isPending ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                (stats?.processingCount ?? 0)
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Delivered</CardDescription>
            <CardTitle>
              {isPending ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                (stats?.deliveredCount ?? 0)
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Cancelled / Refunded</CardDescription>
            <CardTitle>
              {isPending ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                (stats?.cancelledCount ?? 0)
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* FILTERS */}
      <Card>
        <CardContent className="flex justify-between items-center gap-6">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by order ID, customer, or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          <Select
            onValueChange={(value) => setSelectedFilter(value)}
            defaultValue="newest"
            value={selectedFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="low-to-high">Low to High</SelectItem>
              <SelectItem value="high-to-low">High to Low</SelectItem>
            </SelectContent>
          </Select>

          <Tabs
            defaultValue="all"
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value)}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending_payment">Pending</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              <TabsTrigger value="refunded">Refunded</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card className="w-full">
        <CardContent>
          <Table>
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
              {isPending
                ? Array.from({ length: 5 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-sm">
                        {o.id}
                      </TableCell>
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
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
            <TableCaption>
              Data status:{" "}
              {isFetching
                ? "Loading Data"
                : isPending
                  ? "Pending"
                  : isRefetching
                    ? "Refetching"
                    : isError
                      ? "Error fetching data"
                      : "Fresh"}
            </TableCaption>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
