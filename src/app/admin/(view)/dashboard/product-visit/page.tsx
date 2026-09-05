"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { howl } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function Page() {
  const { data, isPending } = useQuery({
    queryKey: ["search-history"],
    queryFn: async (): Promise<{
      message: string;
      ok: boolean;
      data: Array<{
        search_history: {
          id: string;
          query: string;
          searchType?: string;
          authorId?: string;
          createdAt: string;
        };
        user?: {
          id: string;
          name: string;
          email: string;
          emailVerified: boolean;
          image: string;
          createdAt: string;
          updatedAt: string;
          role: string;
          banned: boolean;
          banReason: any;
          banExpires: any;
        };
      }>;
    }> => {
      return await howl("/api/admin/product-visit");
    },
    refetchInterval: 1000 * 60 * 0.33, // Refetch every 20 seconds
  });

  return (
    <pre className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-amber-400 rounded-xl p-6 shadow-lg overflow-x-auto text-sm leading-relaxed border border-zinc-700">
      <code className="whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </code>
    </pre>
  );

  // return (
  //   <div className="p-3 sm:p-6 gap-6 flex flex-col flex-1 h-full w-full">
  //     <div className="flex flex-col gap-4">
  //       <h1 className="text-xl sm:text-2xl font-bold">
  //         Last 250 Product Visits
  //       </h1>
  //     </div>

  //     <Card className="w-full">
  //       <CardContent className="overflow-x-auto">
  //         <Table className="min-w-150">
  //           <TableHeader>
  //             <TableRow>
  //               <TableHead>Query</TableHead>
  //               <TableHead>User</TableHead>
  //               <TableHead>Search Type</TableHead>
  //               <TableHead>Search time</TableHead>
  //             </TableRow>
  //           </TableHeader>
  //           <TableBody>
  //             {data?.data.map((history) => (
  //               <TableRow key={history.search_history.id}>
  //                 <TableCell>{history.search_history.query}</TableCell>
  //                 <TableCell>
  //                   {history.user ? (
  //                     <Link
  //                       href={`/admin/users/${history.user.id}`}
  //                       className="text-primary underline"
  //                     >
  //                       <div className="flex items-center gap-2">
  //                         <Avatar>
  //                           <AvatarImage
  //                             src={history.user.image}
  //                             alt={history.user.name}
  //                           />
  //                           <AvatarFallback>
  //                             {history.user.name?.charAt(0) || "U"}
  //                           </AvatarFallback>
  //                         </Avatar>
  //                         <span>{history.user.name || "Unknown"}</span>
  //                       </div>
  //                     </Link>
  //                   ) : (
  //                     <span className="text-muted-foreground">N/A</span>
  //                   )}
  //                 </TableCell>
  //                 <TableCell>
  //                   {history.search_history.searchType || "N/A"}
  //                 </TableCell>
  //                 <TableCell>
  //                   {new Date(
  //                     history.search_history.createdAt,
  //                   ).toLocaleString()}
  //                 </TableCell>
  //               </TableRow>
  //             ))}
  //           </TableBody>
  //         </Table>
  //       </CardContent>
  //     </Card>
  //   </div>
  // );
}
