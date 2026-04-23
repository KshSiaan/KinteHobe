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
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
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

// Fake transaction data
const transactions = [
  {
    id: "TXN001",
    date: "2025-04-20",
    time: "14:32",
    amount: 299.99,
    customer: "Kingston Park",
    paymentMethod: "Credit Card",
    type: "Purchase",
    status: "completed",
  },
  {
    id: "TXN002",
    date: "2025-04-20",
    time: "13:15",
    amount: 149.5,
    customer: "Sophia Rivera",
    paymentMethod: "PayPal",
    type: "Purchase",
    status: "completed",
  },
  {
    id: "TXN003",
    date: "2025-04-20",
    time: "12:45",
    amount: 75.0,
    customer: "Marcus Chen",
    paymentMethod: "Debit Card",
    type: "Refund",
    status: "completed",
  },
  {
    id: "TXN004",
    date: "2025-04-19",
    time: "16:20",
    amount: 599.99,
    customer: "Elena Rodriguez",
    paymentMethod: "Credit Card",
    type: "Purchase",
    status: "pending",
  },
  {
    id: "TXN005",
    date: "2025-04-19",
    time: "15:10",
    amount: 199.99,
    customer: "James Wilson",
    paymentMethod: "Apple Pay",
    type: "Purchase",
    status: "completed",
  },
  {
    id: "TXN006",
    date: "2025-04-19",
    time: "14:05",
    amount: 89.99,
    customer: "Avery Chen",
    paymentMethod: "Credit Card",
    type: "Purchase",
    status: "failed",
  },
  {
    id: "TXN007",
    date: "2025-04-18",
    time: "11:30",
    amount: 450.0,
    customer: "Lucas Torres",
    paymentMethod: "Bank Transfer",
    type: "Purchase",
    status: "completed",
  },
  {
    id: "TXN008",
    date: "2025-04-18",
    time: "10:15",
    amount: 120.0,
    customer: "Maya Patel",
    paymentMethod: "Credit Card",
    type: "Refund",
    status: "completed",
  },
];

export default function Page() {
  const totalVolume = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  const completedCount = transactions.filter(
    (txn) => txn.status === "completed",
  ).length;
  const pendingCount = transactions.filter(
    (txn) => txn.status === "pending",
  ).length;
  const failedCount = transactions.filter(
    (txn) => txn.status === "failed",
  ).length;

  return (
    <div className="p-6 gap-6 flex flex-col flex-1 h-full w-full">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Total Volume</CardDescription>
            <CardTitle>${totalVolume.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All listed transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Completed</CardDescription>
            <CardTitle>{completedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Pending</CardDescription>
            <CardTitle>{pendingCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Failed</CardDescription>
            <CardTitle>{failedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Need manual attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex justify-between items-center gap-6">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search Transaction ID" />
          </InputGroup>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
          </Select>
          <Tabs>
            <TabsList>
              <TabsTrigger value="0">All</TabsTrigger>
              <TabsTrigger value="1">Completed</TabsTrigger>
              <TabsTrigger value="2">Pending</TabsTrigger>
              <TabsTrigger value="3">Failed</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {txn.id}
                  </TableCell>
                  <TableCell className="text-sm">
                    {txn.date} {txn.time}
                  </TableCell>
                  <TableCell className="font-medium">{txn.customer}</TableCell>
                  <TableCell className="font-semibold">
                    ${txn.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm">{txn.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{txn.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        txn.status === "completed"
                          ? "default"
                          : txn.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {txn.status === "completed" && (
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
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="View transaction details"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {txn.status === "completed" &&
                        txn.type === "Purchase" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Process refund"
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
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
