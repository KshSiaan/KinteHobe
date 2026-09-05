"use client";
import { Card, CardContent } from "@/components/ui/card";

import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { howl } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function Page() {
  const { data, isPending } = useQuery({
    queryKey: ["search-history"],
    queryFn: async () => {
      return await howl("/api/admin/search-history");
    },
    refetchInterval: 1000 * 60 * 0.33, // Refetch every 20 seconds
  });
  return (
    <div className="p-3 sm:p-6 gap-6 flex flex-col flex-1 h-full w-full">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">
          Last 250 Search Histories
        </h1>
      </div>

      <Card className="w-full">
        <CardContent className="overflow-x-auto">
          <Table className="min-w-150">
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Search time</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </CardContent>
        {/* <CardFooter className="flex items-center justify-between gap-3">
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
        </CardFooter> */}
      </Card>
    </div>
  );
}
