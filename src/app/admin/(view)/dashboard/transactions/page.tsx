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
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useDebounce } from "use-debounce";
type Transaction = {
  id: string;
  orderId: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  data: Transaction[];
  stats: {
    totalVolume: string;
    completedCount: string;
    pendingCount: string;
    failedCount: string;
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
      queryKey: [
        "transactions",
        debouncedSearch,
        selectedStatus,
        selectedFilter,
      ],
      queryFn: async () => {
        return fetch(
          `/api/admin/transactions?search=${debouncedSearch}&status=${selectedStatus}&filter=${selectedFilter === "all" ? "" : selectedFilter}`,
        ).then((res) => res.json());
      },
      placeholderData: (previousData) => previousData,
    });

  const transactions = data?.data ?? [];
  const stats = data?.stats;

  return (
    <div className="p-3 sm:p-6 gap-6 flex flex-col flex-1 h-full w-full">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Transactions</h1>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Total Volume</CardDescription>
            <CardTitle>
              {isPending ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                `$${stats?.totalVolume ?? 0}`
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All processed transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Completed</CardDescription>
            <CardTitle>
              {isPending ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                stats?.completedCount
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
                stats?.pendingCount
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Failed</CardDescription>
            <CardTitle>
              {isPending ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                stats?.failedCount
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
              placeholder="Search Transaction ID"
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
              {/* "pending" | "refunded" | "succeeded" | "failed" */}
              <TabsTrigger value="succeeded">Succeeded</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
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
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
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

                      <TableCell className="text-sm">
                        {new Date(txn.createdAt).toLocaleString()}
                      </TableCell>

                      <TableCell className="font-semibold">
                        ${txn.amountCents / 100} {txn.currency.toUpperCase()}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            txn.status === "succeeded"
                              ? "success"
                              : txn.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {txn.status === "succeeded" && (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          )}
                          {txn.status === "pending" && (
                            <Clock className="mr-1 h-3 w-3" />
                          )}
                          {txn.status === "failed" && (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {txn.status}
                        </Badge>
                      </TableCell>

                      {/* ACTION ROW KEPT AS REQUESTED */}
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {txn.status === "completed" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-yellow-600"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
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
