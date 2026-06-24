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
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

type FeedbackPriority = "low" | "medium" | "high" | "urgent";

type Feedback = {
	id: string;
	title: string;
	subject: string;
	description: string;
	priority: FeedbackPriority;
	createdAt: string;
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
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({
		title: "",
		subject: "",
		description: "",
		priority: "medium" as FeedbackPriority,
	});
	const [error, setError] = useState("");

	const { data, isPending, isFetching, isError } = useQuery<{
		feedbacks: Feedback[];
	}>({
		queryKey: ["manager-feedbacks"],
		queryFn: () => fetch("/api/manager/feedback").then((r) => r.json()),
	});

	const { mutate: deleteFeedback, isPending: isDeleting } = useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/manager/feedback?id=${id}`, {
				method: "DELETE",
			});
			if (!res.ok) {
				const j = await res.json();
				throw new Error(j.message ?? "Failed to delete");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["manager-feedbacks"] });
		},
	});

	const { mutate, isPending: isSubmitting } = useMutation({
		mutationFn: async () => {
			const res = await fetch("/api/manager/feedback", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			if (!res.ok) {
				const j = await res.json();
				throw new Error(j.message ?? "Failed to submit");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["manager-feedbacks"] });
			setOpen(false);
			setForm({ title: "", subject: "", description: "", priority: "medium" });
			setError("");
		},
		onError: (e: Error) => setError(e.message),
	});

	const feedbacks = data?.feedbacks ?? [];

	return (
		<div className="p-6 gap-6 flex flex-col flex-1 h-full w-full">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">My Feedbacks</h1>
					<p className="text-muted-foreground text-sm mt-1">
						Submit and track your feedbacks to the admin.
					</p>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>
							<PlusIcon className="mr-2 h-4 w-4" />
							New Feedback
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>Submit Feedback</DialogTitle>
							<DialogDescription>
								Send a feedback to the admin team.
							</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-4 py-2">
							<div className="flex flex-col gap-2">
								<Label htmlFor="title">Title</Label>
								<Input
									id="title"
									placeholder="Short summary"
									value={form.title}
									onChange={(e) =>
										setForm((f) => ({ ...f, title: e.target.value }))
									}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="subject">Subject</Label>
								<Input
									id="subject"
									placeholder="Topic or category"
									value={form.subject}
									onChange={(e) =>
										setForm((f) => ({ ...f, subject: e.target.value }))
									}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="priority">Priority</Label>
								<Select
									value={form.priority}
									onValueChange={(v) =>
										setForm((f) => ({
											...f,
											priority: v as FeedbackPriority,
										}))
									}
								>
									<SelectTrigger id="priority">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="high">High</SelectItem>
										<SelectItem value="urgent">Urgent</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									placeholder="Describe your feedback in detail..."
									rows={5}
									value={form.description}
									onChange={(e) =>
										setForm((f) => ({ ...f, description: e.target.value }))
									}
								/>
							</div>
							{error && <p className="text-destructive text-sm">{error}</p>}
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button
								onClick={() => mutate()}
								disabled={
									isSubmitting ||
									!form.title ||
									!form.subject ||
									!form.description
								}
							>
								{isSubmitting ? "Submitting..." : "Submit"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<Card>
				<CardContent className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead>Subject</TableHead>
								<TableHead>Priority</TableHead>
								<TableHead>Date</TableHead>
								<TableHead className="w-12" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{isPending
								? Array.from({ length: 4 }).map((_, i) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
										<TableRow key={i}>
											<TableCell colSpan={5}>
												<Skeleton className="h-5 w-full" />
											</TableCell>
										</TableRow>
									))
								: feedbacks.map((f) => (
										<TableRow key={f.id}>
											<TableCell className="font-medium">{f.title}</TableCell>
											<TableCell className="text-muted-foreground">
												{f.subject}
											</TableCell>
											<TableCell>
												<Badge variant={PRIORITY_BADGE[f.priority]}>
													{f.priority.charAt(0).toUpperCase() +
														f.priority.slice(1)}
												</Badge>
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{new Date(f.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell>
												<Button
													variant="ghost"
													size="icon"
													className="text-destructive hover:text-destructive"
													disabled={isDeleting}
													onClick={() => deleteFeedback(f.id)}
												>
													<Trash2Icon className="h-4 w-4" />
												</Button>
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
										? "No feedbacks yet"
										: `${feedbacks.length} feedback${feedbacks.length !== 1 ? "s" : ""}`}
						</TableCaption>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
