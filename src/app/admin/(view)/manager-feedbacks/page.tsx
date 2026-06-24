"use client";

import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { EyeIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "use-debounce";

type FeedbackPriority = "low" | "medium" | "high" | "urgent";

type Feedback = {
	id: string;
	title: string;
	subject: string;
	description: string;
	priority: FeedbackPriority;
	createdAt: string;
	manager: {
		id: string;
		name: string;
		email: string;
		image: string | null;
	} | null;
};

const PRIORITY_BADGE: Record<
	FeedbackPriority,
	"default" | "secondary" | "warning" | "destructive"
> = {
	low: "secondary",
	medium: "default",
	high: "warning",
	urgent: "destructive",
};

export default function Page() {
	const [search, setSearch] = useState("");
	const [debouncedSearch] = useDebounce(search, 400);
	const [priority, setPriority] = useState("all");
	const [sort, setSort] = useState("newest");
	const [selected, setSelected] = useState<Feedback | null>(null);

	const { data, isPending, isFetching, isError } = useQuery<{
		feedbacks: Feedback[];
	}>({
		queryKey: ["admin-manager-feedbacks", debouncedSearch, priority, sort],
		queryFn: () =>
			fetch(
				`/api/admin/manager-feedbacks?search=${debouncedSearch}&priority=${priority}&sort=${sort}`,
			).then((r) => r.json()),
		placeholderData: (prev) => prev,
	});

	const feedbacks = data?.feedbacks ?? [];

	return (
		<div className="p-6 gap-6 flex flex-col flex-1 h-full w-full">
			<div>
				<h1 className="text-2xl font-bold">Manager Feedbacks</h1>
				<p className="text-muted-foreground text-sm mt-1">
					Review feedback submitted by managers.
				</p>
			</div>

			{/* STATS */}
			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				{(["urgent", "high", "medium", "low"] as FeedbackPriority[]).map(
					(p) => {
						const count = feedbacks.filter((f) => f.priority === p).length;
						return (
							<Card key={p}>
								<CardHeader className="gap-1 pb-2">
									<CardDescription className="capitalize">{p}</CardDescription>
									<CardTitle>
										{isPending ? (
											<Skeleton className="h-6 w-12" />
										) : (
											count
										)}
									</CardTitle>
								</CardHeader>
							</Card>
						);
					},
				)}
			</div>

			{/* FILTERS */}
			<Card>
				<CardContent className="flex flex-wrap items-center gap-4">
					<InputGroup className="flex-1 min-w-48">
						<InputGroupAddon>
							<SearchIcon className="h-4 w-4" />
						</InputGroupAddon>
						<InputGroupInput
							placeholder="Search by title, manager name or email..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</InputGroup>

					<Select value={sort} onValueChange={setSort}>
						<SelectTrigger className="w-44">
							<SelectValue placeholder="Sort" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="newest">Newest First</SelectItem>
							<SelectItem value="oldest">Oldest First</SelectItem>
							<SelectItem value="priority-desc">Priority: High → Low</SelectItem>
							<SelectItem value="priority-asc">Priority: Low → High</SelectItem>
						</SelectContent>
					</Select>

					<Tabs value={priority} onValueChange={setPriority}>
						<TabsList>
							<TabsTrigger value="all">All</TabsTrigger>
							<TabsTrigger value="urgent">Urgent</TabsTrigger>
							<TabsTrigger value="high">High</TabsTrigger>
							<TabsTrigger value="medium">Medium</TabsTrigger>
							<TabsTrigger value="low">Low</TabsTrigger>
						</TabsList>
					</Tabs>
				</CardContent>
			</Card>

			{/* TABLE */}
			<Card>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead>Subject</TableHead>
								<TableHead>Priority</TableHead>
								<TableHead>Manager</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Action</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isPending
								? Array.from({ length: 5 }).map((_, i) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
										<TableRow key={i}>
											<TableCell colSpan={7}>
												<Skeleton className="h-5 w-full" />
											</TableCell>
										</TableRow>
									))
								: feedbacks.map((f) => (
										<TableRow key={f.id}>
											<TableCell className="font-medium max-w-48 truncate">
												{f.title}
											</TableCell>
											<TableCell className="text-muted-foreground">
												{f.subject}
											</TableCell>
											<TableCell>
												<Badge variant={PRIORITY_BADGE[f.priority]}>
													{f.priority.charAt(0).toUpperCase() +
														f.priority.slice(1)}
												</Badge>
											</TableCell>
											<TableCell>{f.manager?.name ?? "—"}</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{f.manager?.email ?? "—"}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{new Date(f.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell>
												<Dialog>
													<DialogTrigger asChild>
														<Button
															size="sm"
															variant="ghost"
															className="h-8 w-8 p-0"
															onClick={() => setSelected(f)}
														>
															<EyeIcon className="h-4 w-4" />
														</Button>
													</DialogTrigger>
													<DialogContent className="sm:max-w-lg">
														<DialogHeader>
															<DialogTitle>{f.title}</DialogTitle>
															<DialogDescription>
																{f.subject} ·{" "}
																<Badge
																	variant={PRIORITY_BADGE[f.priority]}
																	className="ml-1"
																>
																	{f.priority}
																</Badge>
															</DialogDescription>
														</DialogHeader>
														<div className="flex flex-col gap-3 text-sm">
															<div className="flex gap-2 text-muted-foreground">
																<span className="font-medium text-foreground">
																	Manager:
																</span>
																{f.manager?.name ?? "Unknown"} (
																{f.manager?.email ?? "—"})
															</div>
															<div className="flex gap-2 text-muted-foreground">
																<span className="font-medium text-foreground">
																	Submitted:
																</span>
																{new Date(f.createdAt).toLocaleString()}
															</div>
															<div className="border rounded-md p-3 bg-muted/40 whitespace-pre-wrap leading-relaxed">
																{f.description}
															</div>
														</div>
													</DialogContent>
												</Dialog>
											</TableCell>
										</TableRow>
									))}
						</TableBody>
						<TableCaption>
							{isFetching
								? "Loading..."
								: isError
									? "Error loading feedbacks"
									: feedbacks.length === 0
										? "No feedbacks found"
										: `${feedbacks.length} feedback${feedbacks.length !== 1 ? "s" : ""}`}
						</TableCaption>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
