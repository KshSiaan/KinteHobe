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
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchIcon,
  Eye,
  RotateCcw,
  CheckCircle,
  Clock,
  XCircle,
  GalleryVerticalEndIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { User } from "better-auth";
import FraudAction from "./fraud-action";

export type FraudDataset = {
  id: string;
  orderId: string;
  transactionId: string;
  current_status: string;
  resolvedBy: null;
  createdAt: string;
  updatedAt: string;
  transaction: {
    id: string;
    orderId: string;
    stripeSessionId: null;
    stripePaymentIntentId: null;
    onlinePaymentId: string;
    paymentProvider: string;
    amountCents: number;
    currency: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  order: {
    id: string;
    userId: string;
    email: string;
    status: string;
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
    stripeSessionId: null;
    createdAt: string;
    updatedAt: string;
  };
  user: User;
};

type ApiResponse = {
  data: FraudDataset[];
  stats: {
    total_records: string;
    reviewedCount: string;
    resolvedCount: string;
    rejectedCount: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export default function Page() {
  const [selectedFilter, setSelectedFilter] = useState("newest");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const { data, isPending, isFetching, isRefetching, isError } =
    useQuery<ApiResponse>({
      queryKey: ["fraud", debouncedSearch, selectedStatus, selectedFilter],
      queryFn: async () => {
        return fetch(
          `/api/admin/fraud?search=${debouncedSearch}&status=${selectedStatus}&filter=${selectedFilter === "all" ? "" : selectedFilter}`,
        ).then((res) => res.json());
      },
      placeholderData: (previousData) => previousData,
    });

  const transactions = data?.data ?? [];
  const stats = data?.stats;

  // return (
  //   <pre className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-amber-400 rounded-xl p-6 shadow-lg overflow-x-auto text-sm leading-relaxed border border-zinc-700">
  //     <code className="whitespace-pre-wrap">
  //       {JSON.stringify(data, null, 2)}
  //     </code>
  //   </pre>
  // );
  return (
    <div className="p-3 sm:p-6 gap-6 flex flex-col flex-1 h-full w-full">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Fraud Reports</h1>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Current Total Records</CardDescription>
            <CardTitle>
              {isPending ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                stats?.total_records
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Resolved</CardDescription>
            <CardTitle>
              {isPending ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                stats?.resolvedCount
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Pending</CardDescription>
            <CardTitle>
              {isPending ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                stats?.reviewedCount
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Rejected</CardDescription>
            <CardTitle>
              {isPending ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                stats?.rejectedCount
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* FILTERS */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-6">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search here"
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
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>

          <Tabs
            defaultValue="all"
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value)}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card className="w-full">
        <CardContent className="overflow-x-auto">
          <Table className="min-w-150">
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isPending
                ? Array.from({ length: 5 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-sm">
                        {txn.id}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {txn.id}
                      </TableCell>

                      <TableCell className="text-sm">
                        {new Date(txn.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {txn.user?.name}
                      </TableCell>

                      <TableCell className="font-semibold">
                        ${txn?.transaction?.amountCents / 100}{" "}
                        {txn?.transaction?.currency?.toUpperCase()}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            txn.current_status === "resolved"
                              ? "success"
                              : txn.current_status === "reviewed" ||
                                  txn.current_status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {txn.current_status === "resolved" && (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          )}

                          {txn.current_status === "reviewed" ||
                            (txn.current_status === "pending" && (
                              <Clock className="mr-1 h-3 w-3" />
                            ))}
                          {txn.current_status === "rejected" && (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {txn.current_status}
                        </Badge>
                      </TableCell>

                      {/* ACTION ROW KEPT AS REQUESTED */}
                      <TableCell>
                        <div className="flex gap-2">
                          <FraudAction txn={txn} />
                        </div>
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
