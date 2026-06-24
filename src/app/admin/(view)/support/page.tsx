"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EyeIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";

type SupportUser = {
	id: string;
	name: string;
	email: string;
	image: string | null;
} | null;

type SupportMessage = {
	id: string;
	subject: string;
	message: string;
	createdAt: string;
	user: SupportUser;
};

export default function Page() {
	const queryClient = useQueryClient();

	const { data, isPending, isFetching, isError } = useQuery<{
		messages: SupportMessage[];
	}>({
		queryKey: ["admin-support-messages"],
		queryFn: () => fetch("/api/admin/support").then((r) => r.json()),
		placeholderData: (prev) => prev,
	});

	const { mutate: deleteMsg } = useMutation({
		mutationFn: (id: string) =>
			fetch(`/api/admin/support?id=${id}`, { method: "DELETE" }).then((r) =>
				r.json(),
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-support-messages"] });
		},
	});

	const messages = data?.messages ?? [];

	return (
		<div className="p-6 gap-6 flex flex-col flex-1 h-full w-full">
			<div>
				<h1 className="text-2xl font-bold">Support Messages</h1>
				<p className="text-muted-foreground text-sm mt-1">
					Review support requests submitted by users.
				</p>
			</div>

			<div className="grid grid-cols-2 gap-3 md:grid-cols-3">
				<Card>
					<CardHeader className="gap-1 pb-2">
						<CardDescription>Total</CardDescription>
						<CardTitle>
							{isPending ? <Skeleton className="h-6 w-12" /> : messages.length}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="gap-1 pb-2">
						<CardDescription>Today</CardDescription>
						<CardTitle>
							{isPending ? (
								<Skeleton className="h-6 w-12" />
							) : (
								messages.filter(
									(m) =>
										new Date(m.createdAt).toDateString() ===
										new Date().toDateString(),
								).length
							)}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="gap-1 pb-2">
						<CardDescription>Unique Users</CardDescription>
						<CardTitle>
							{isPending ? (
								<Skeleton className="h-6 w-12" />
							) : (
								new Set(messages.map((m) => m.user?.id).filter(Boolean)).size
							)}
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Messages</CardTitle>
					<CardDescription>Click a user to view their profile.</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Subject</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isPending
								? Array.from({ length: 5 }).map((_, i) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
										<TableRow key={i}>
											<TableCell colSpan={5}>
												<Skeleton className="h-5 w-full" />
											</TableCell>
										</TableRow>
									))
								: messages.map((m) => (
										<TableRow key={m.id}>
											<TableCell>
												{m.user ? (
													<Link
														href={`/admin/dashboard/users/${m.user.id}`}
														className="flex items-center gap-2 hover:underline"
													>
														<Avatar className="h-7 w-7">
															<AvatarImage
																src={m.user.image ?? undefined}
																alt={m.user.name}
															/>
															<AvatarFallback className="text-xs">
																{m.user.name?.slice(0, 2).toUpperCase()}
															</AvatarFallback>
														</Avatar>
														<span className="font-medium">{m.user.name}</span>
													</Link>
												) : (
													<span className="text-muted-foreground">—</span>
												)}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{m.user?.email ?? "—"}
											</TableCell>
											<TableCell className="max-w-48 truncate font-medium">
												{m.subject}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground whitespace-nowrap">
												{new Date(m.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<Dialog>
														<DialogTrigger asChild>
															<Button
																size="sm"
																variant="ghost"
																className="h-8 w-8 p-0"
															>
																<EyeIcon className="h-4 w-4" />
															</Button>
														</DialogTrigger>
														<DialogContent className="sm:max-w-lg">
															<DialogHeader>
																<DialogTitle>{m.subject}</DialogTitle>
																<DialogDescription>
																	From {m.user?.name ?? "Unknown"} &middot;{" "}
																	{new Date(m.createdAt).toLocaleString()}
																</DialogDescription>
															</DialogHeader>
															<div className="flex flex-col gap-3 text-sm">
																{m.user && (
																	<Link
																		href={`/admin/dashboard/users/${m.user.id}`}
																		className="flex items-center gap-2 hover:underline w-fit"
																	>
																		<Avatar className="h-8 w-8">
																			<AvatarImage
																				src={m.user.image ?? undefined}
																				alt={m.user.name}
																			/>
																			<AvatarFallback className="text-xs">
																				{m.user.name?.slice(0, 2).toUpperCase()}
																			</AvatarFallback>
																		</Avatar>
																		<div>
																			<p className="font-medium">{m.user.name}</p>
																			<p className="text-muted-foreground text-xs">
																				{m.user.email}
																			</p>
																		</div>
																	</Link>
																)}
																<div className="border rounded-md p-3 bg-muted/40 whitespace-pre-wrap leading-relaxed">
																	{m.message}
																</div>
															</div>
														</DialogContent>
													</Dialog>
													<Button
														size="sm"
														variant="ghost"
														className="h-8 w-8 p-0 text-destructive hover:text-destructive"
														onClick={() => deleteMsg(m.id)}
													>
														<Trash2Icon className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
						</TableBody>
						<TableCaption>
							{isFetching
								? "Loading..."
								: isError
									? "Error loading messages"
									: messages.length === 0
										? "No support messages"
										: `${messages.length} message${messages.length !== 1 ? "s" : ""}`}
						</TableCaption>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
