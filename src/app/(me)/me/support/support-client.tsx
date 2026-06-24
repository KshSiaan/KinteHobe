"use client";

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
import { PlusIcon } from "lucide-react";
import { useState } from "react";

type SupportMessage = {
	id: string;
	subject: string;
	message: string;
	createdAt: string;
};

export default function SupportClient() {
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({ subject: "", message: "" });
	const [error, setError] = useState("");

	const { data, isPending, isFetching, isError } = useQuery<{
		messages: SupportMessage[];
	}>({
		queryKey: ["support-messages"],
		queryFn: () => fetch("/api/support").then((r) => r.json()),
	});

	const { mutate, isPending: isSubmitting } = useMutation({
		mutationFn: async () => {
			const res = await fetch("/api/support", {
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
			queryClient.invalidateQueries({ queryKey: ["support-messages"] });
			setOpen(false);
			setForm({ subject: "", message: "" });
			setError("");
		},
		onError: (e: Error) => setError(e.message),
	});

	const messages = data?.messages ?? [];

	return (
		<div className="p-6 gap-6 flex flex-col max-w-4xl mx-auto">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Support</h1>
					<p className="text-muted-foreground text-sm mt-1">
						Send a message to our support team.
					</p>
				</div>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>
							<PlusIcon className="mr-2 h-4 w-4" />
							New Message
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>Contact Support</DialogTitle>
							<DialogDescription>
								Describe your issue and we&apos;ll get back to you.
							</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-4 py-2">
							<div className="flex flex-col gap-2">
								<Label htmlFor="subject">Subject</Label>
								<Input
									id="subject"
									placeholder="Brief description of your issue"
									value={form.subject}
									onChange={(e) =>
										setForm((f) => ({ ...f, subject: e.target.value }))
									}
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="message">Message</Label>
								<Textarea
									id="message"
									placeholder="Describe your issue in detail..."
									rows={6}
									value={form.message}
									onChange={(e) =>
										setForm((f) => ({ ...f, message: e.target.value }))
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
								disabled={isSubmitting || !form.subject || !form.message}
							>
								{isSubmitting ? "Sending..." : "Send"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Your Messages</CardTitle>
					<CardDescription>Track your support requests.</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Subject</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Preview</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isPending
								? Array.from({ length: 3 }).map((_, i) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
										<TableRow key={i}>
											<TableCell colSpan={3}>
												<Skeleton className="h-5 w-full" />
											</TableCell>
										</TableRow>
									))
								: messages.map((m) => (
										<TableRow key={m.id}>
											<TableCell className="font-medium max-w-48 truncate">
												{m.subject}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground whitespace-nowrap">
												{new Date(m.createdAt).toLocaleDateString()}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground max-w-64 truncate">
												{m.message}
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
										? "No messages yet"
										: `${messages.length} message${messages.length !== 1 ? "s" : ""}`}
						</TableCaption>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
