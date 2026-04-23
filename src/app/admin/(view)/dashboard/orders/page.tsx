import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EyeIcon, PackageCheckIcon, SearchIcon } from "lucide-react";

export default function Page() {
  const statusVariant = {
    Completed: "success",
    Processing: "warning",
    Cancelled: "destructive",
  } as const;

  type OrderStatus = keyof typeof statusVariant;
  type Order = {
    id: string;
    customer: string;
    date: string;
    total: string;
    payment: string;
    fulfillment: string;
    status: OrderStatus;
  };

  const orders: Order[] = [
    {
      id: "ORD-1042",
      customer: "Awa Jammeh",
      date: "2026-04-22",
      total: "$184.00",
      payment: "Paid",
      fulfillment: "Shipped",
      status: "Completed",
    },
    {
      id: "ORD-1041",
      customer: "Mariama Conteh",
      date: "2026-04-22",
      total: "$72.50",
      payment: "Pending",
      fulfillment: "Packing",
      status: "Processing",
    },
    {
      id: "ORD-1039",
      customer: "Lamin Sowe",
      date: "2026-04-21",
      total: "$36.00",
      payment: "Refunded",
      fulfillment: "Returned",
      status: "Cancelled",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">
          Track customer orders, monitor fulfillment, and resolve issues
          quickly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Open Orders</CardDescription>
            <CardTitle className="text-2xl">24</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Awaiting Payment</CardDescription>
            <CardTitle className="text-2xl">7</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="gap-1">
            <CardDescription>Needs Attention</CardDescription>
            <CardTitle className="text-2xl">3</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <InputGroup className="bg-background">
        <InputGroupAddon>
          <SearchIcon
            data-icon="inline-start"
            className="text-muted-foreground"
          />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search by order ID, customer, or email" />
      </InputGroup>

      <div className="rounded-lg border bg-card p-4">
        <FieldGroup className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Field>
            <FieldLabel htmlFor="from-date">From</FieldLabel>
            <Input id="from-date" type="date" className="h-9" />
          </Field>
          <Field>
            <FieldLabel htmlFor="until-date">Until</FieldLabel>
            <Input id="until-date" type="date" className="h-9" />
          </Field>
          <Field>
            <FieldLabel htmlFor="status">Order Status</FieldLabel>
            <Select>
              <SelectTrigger id="status" className="h-9">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="payment">Payment</FieldLabel>
            <Select>
              <SelectTrigger id="payment" className="h-9">
                <SelectValue placeholder="All payments" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              Review incoming orders, update statuses, and keep delivery on
              track.
            </CardDescription>
          </div>
          <Button>
            <PackageCheckIcon data-icon="inline-start" />
            Export Orders as CSV
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <Tabs defaultValue="all" className="flex flex-col gap-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Fulfillment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.total}</TableCell>
                      <TableCell>{order.payment}</TableCell>
                      <TableCell>{order.fulfillment}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[order.status]}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant={"ghost"} size="icon">
                          <EyeIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="processing" className="m-0">
              <p className="text-sm text-muted-foreground">
                Showing orders currently being prepared or packed.
              </p>
            </TabsContent>

            <TabsContent value="completed" className="m-0">
              <p className="text-sm text-muted-foreground">
                Showing orders that are delivered or fully completed.
              </p>
            </TabsContent>

            <TabsContent value="cancelled" className="m-0">
              <p className="text-sm text-muted-foreground">
                Showing cancelled and refunded orders.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
