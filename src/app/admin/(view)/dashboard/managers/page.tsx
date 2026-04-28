"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SearchIcon, EyeIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useEffect, useMemo, useState } from "react";
// import View from "./view";
import Link from "next/link";

type UserStatusFilter = "all" | "active" | "banned";
type UserRoleFilter = "all" | "user" | "admin";

type AdminUser = {
  role?: string;
  banned: boolean | null;
  banReason?: string | null;
  banExpires?: Date | string | null;
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
};

const PAGE_SIZE = 10;

export default function Page() {
  const [input, setInput] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(input);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [input]);

  useEffect(() => {
    let isCancelled = false;

    async function loadUsers() {
      setLoading(true);
      setErrorMessage(null);

      const offset = (currentPage - 1) * PAGE_SIZE;

      const result = await authClient.admin.listUsers({
        query: {
          limit: PAGE_SIZE,
          offset,
          sortBy: "createdAt",
          sortDirection: "desc",
          searchValue: debouncedValue || undefined,
          searchField: "name",
          searchOperator: "contains",
          filterField: "role",
          filterOperator: "eq",
          filterValue: "manager",
        },
      });

      if (isCancelled) {
        return;
      }

      if (result.error) {
        setUsers([]);
        setTotalUsers(0);
        setErrorMessage(result.error.message ?? "Failed to fetch users");
        setLoading(false);
        return;
      }

      const payload = result.data as
        | { users?: AdminUser[]; total?: number }
        | undefined;

      setUsers(Array.isArray(payload?.users) ? payload.users : []);
      setTotalUsers(typeof payload?.total === "number" ? payload.total : 0);
      setLoading(false);
    }

    loadUsers().catch((error) => {
      if (isCancelled) {
        return;
      }

      setUsers([]);
      setTotalUsers(0);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to fetch users",
      );
      setLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [currentPage, debouncedValue]);

  const filteredUsers = useMemo(() => {
    if (statusFilter === "all") {
      return users;
    }

    return users.filter((user) => {
      const status = user.banned ? "banned" : "active";
      return status === statusFilter;
    });
  }, [statusFilter, users]);

  const pageLinks = useMemo(() => {
    const pages = new Set<number>([1, totalPages, currentPage]);

    if (currentPage - 1 > 1) {
      pages.add(currentPage - 1);
    }

    if (currentPage + 1 < totalPages) {
      pages.add(currentPage + 1);
    }

    return Array.from(pages).sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  const startItem = totalUsers === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalUsers);

  return (
    <div className="p-6 gap-6 flex flex-col flex-1 h-full w-full">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Manage Managers</h1>
      </div>

      <Card>
        <CardContent className="flex justify-between items-center gap-6">
          <InputGroup>
            <InputGroupAddon>
              {input !== debouncedValue ? <EyeIcon /> : <SearchIcon />}
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search Managers"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setCurrentPage(1);
              }}
            />
          </InputGroup>
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
              {errorMessage ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-destructive"
                  >
                    {errorMessage}
                  </TableCell>
                </TableRow>
              ) : loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const status = user.banned ? "banned" : "active";

                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-sm">
                        {user.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.name ?? "-"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="uppercase">
                        {user.role ?? "user"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            status === "active" ? "default" : "destructive"
                          }
                        >
                          {status === "active" ? "Active" : "Banned"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {/* <View data={user} /> */}
                          <Button variant={"ghost"} size={"icon"} asChild>
                            <Link href={`/admin/dashboard/users/${user.id}`}>
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {startItem}-{endItem} of {totalUsers}
          </p>

          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage((prev) => prev - 1);
                    }
                  }}
                />
              </PaginationItem>

              {pageLinks.map((page, index) => {
                const previousPage = pageLinks[index - 1];
                const showEllipsis =
                  typeof previousPage === "number" && page - previousPage > 1;

                return (
                  <div key={`page-${page}`} className="flex items-center">
                    {showEllipsis ? (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : null}

                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={(event) => {
                          event.preventDefault();
                          setCurrentPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  </div>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage((prev) => prev + 1);
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </div>
  );
}
