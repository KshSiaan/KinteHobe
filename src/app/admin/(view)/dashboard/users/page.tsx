import { Card, CardContent } from "@/components/ui/card";
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
  LogIn,
  PauseCircle,
  CheckCircle,
  Ban,
  Shield,
} from "lucide-react";
import React from "react";

// Fake user data
const users = [
  {
    id: "USR001",
    name: "Kingston Park",
    email: "kingston@example.com",
    role: "Customer",
    status: "active",
  },
  {
    id: "USR002",
    name: "Sophia Rivera",
    email: "sophia.rivera@example.com",
    role: "Customer",
    status: "active",
  },
  {
    id: "USR003",
    name: "Marcus Chen",
    email: "marcus.chen@example.com",
    role: "Product Manager",
    status: "active",
  },
  {
    id: "USR004",
    name: "Elena Rodriguez",
    email: "elena.rodriguez@example.com",
    role: "Customer",
    status: "suspended",
  },
  {
    id: "USR005",
    name: "James Wilson",
    email: "james.wilson@example.com",
    role: "Customer",
    status: "active",
  },
  {
    id: "USR006",
    name: "Avery Chen",
    email: "avery.chen@example.com",
    role: "Product Manager",
    status: "active",
  },
  {
    id: "USR007",
    name: "Lucas Torres",
    email: "lucas.torres@example.com",
    role: "Customer",
    status: "banned",
  },
  {
    id: "USR008",
    name: "Maya Patel",
    email: "maya.patel@example.com",
    role: "Customer",
    status: "active",
  },
];

export default function Page() {
  return (
    <div className="p-6 gap-6 flex flex-col flex-1 h-full w-full">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Manage Users</h1>
      </div>
      <Card>
        <CardContent className="flex justify-between items-center gap-6">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search User" />
          </InputGroup>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
          </Select>
          <Tabs>
            <TabsList>
              <TabsTrigger value="0">All</TabsTrigger>
              <TabsTrigger value="1">Customers</TabsTrigger>
              <TabsTrigger value="2">Product Managers</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>UID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm">{user.id}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active"
                          ? "default"
                          : user.status === "suspended"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="View user"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Impersonate user"
                        className="h-8 w-8 p-0"
                      >
                        <LogIn className="h-4 w-4" />
                      </Button>
                      {user.status === "suspended" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Unsuspend user"
                          className="h-8 w-8 p-0 text-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Suspend user"
                          className="h-8 w-8 p-0 text-yellow-600"
                        >
                          <PauseCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {user.status === "banned" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled
                          title="User is banned"
                          className="h-8 w-8 p-0 text-red-600"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Ban user"
                          className="h-8 w-8 p-0 text-red-600"
                        >
                          <Ban className="h-4 w-4" />
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
