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
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SearchIcon } from "lucide-react";

import ProductTable from "./table";
import { products } from "./products-data";

export default function Page() {
  return (
    <div className="p-6 gap-6 flex flex-col flex-1 h-full w-full">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Manage Products</h1>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Card className="row-span-2">
          <CardHeader>
            <CardTitle>Lowest Product in stock</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 grid grid-cols-3 gap-4">
            {products.slice(0, 3).map((product) => (
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
              <CardTitle>Total in stock</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">1,234</CardContent>
          </Card>
          <Card className="">
            <CardHeader>
              <CardTitle>Total out of stock</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">14</CardContent>
          </Card>
        </div>
        <div className="w-full grid grid-cols-2 gap-6">
          <Card className="">
            <CardHeader>
              <CardTitle>Products updated this month</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">1,234</CardContent>
          </Card>
          <Card className="">
            <CardHeader>
              <CardTitle>Last Updated</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">2 days ago</CardContent>
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
                <TableHead>Product ID</TableHead>
                <TableHead>Product Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <ProductTable />
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
