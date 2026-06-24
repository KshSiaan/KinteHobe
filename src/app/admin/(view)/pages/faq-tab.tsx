"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { ExternalLinkIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";

type Faq = {
	id: string;
	question: string;
	answer: string;
	category: string | null;
	order: number;
	isPublished: boolean;
	createdAt: string;
	updatedAt: string;
};

type FaqForm = {
	question: string;
	answer: string;
	category: string;
	order: number;
	isPublished: boolean;
};

const EMPTY_FORM: FaqForm = {
	question: "",
	answer: "",
	category: "",
	order: 0,
	isPublished: true,
};

export function FaqTab() {
	const queryClient = useQueryClient();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<Faq | null>(null);
	const [form, setForm] = useState<FaqForm>(EMPTY_FORM);
	const [formError, setFormError] = useState("");

	const { data, isPending, isError } = useQuery<{ faqs: Faq[] }>({
		queryKey: ["admin-faqs"],
		queryFn: () => fetch("/api/admin/faq").then((r) => r.json()),
	});

	const faqs = data?.faqs ?? [];

	useEffect(() => {
		if (editing) {
			setForm({
				question: editing.question,
				answer: editing.answer,
				category: editing.category ?? "",
				order: editing.order,
				isPublished: editing.isPublished,
			});
		} else {
			setForm(EMPTY_FORM);
		}
		setFormError("");
	}, [editing]);

	const { mutate: save, isPending: isSaving } = useMutation({
		mutationFn: async () => {
			const payload = {
				...form,
				category: form.category.trim() || null,
			};
			const url = editing ? `/api/admin/faq/${editing.id}` : "/api/admin/faq";
			const method = editing ? "PUT" : "POST";
			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				const j = await res.json();
				throw new Error(j.message ?? "Failed to save");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
			setDialogOpen(false);
			setEditing(null);
		},
		onError: (e: Error) => setFormError(e.message),
	});

	const { mutate: deleteFaq } = useMutation({
		mutationFn: (id: string) =>
			fetch(`/api/admin/faq/${id}`, { method: "DELETE" }).then((r) => r.json()),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
		},
	});

	function openCreate() {
		setEditing(null);
		setDialogOpen(true);
	}

	function openEdit(f: Faq) {
		setEditing(f);
		setDialogOpen(true);
	}

	const canSubmit =
		form.question.trim().length > 0 && form.answer.trim().length > 0;

	return (
		<>
			<Dialog
				open={dialogOpen}
				onOpenChange={(v) => {
					setDialogOpen(v);
					if (!v) setEditing(null);
				}}
			>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
						<DialogDescription>
							{editing ? "Update this FAQ entry." : "Create a new FAQ entry."}
						</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col gap-4 py-1">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="faq-question">Question</Label>
							<Input
								id="faq-question"
								placeholder="What is...?"
								value={form.question}
								onChange={(e) =>
									setForm((f) => ({ ...f, question: e.target.value }))
								}
								disabled={isSaving}
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="faq-answer">Answer</Label>
							<Textarea
								id="faq-answer"
								placeholder="Provide a clear, concise answer..."
								rows={5}
								value={form.answer}
								onChange={(e) =>
									setForm((f) => ({ ...f, answer: e.target.value }))
								}
								disabled={isSaving}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="faq-category">
									Category
									<span className="ml-1 text-xs text-muted-foreground font-normal">
										(optional)
									</span>
								</Label>
								<Input
									id="faq-category"
									placeholder="e.g. Orders, Shipping"
									value={form.category}
									onChange={(e) =>
										setForm((f) => ({ ...f, category: e.target.value }))
									}
									disabled={isSaving}
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="faq-order">Sort Order</Label>
								<Input
									id="faq-order"
									type="number"
									value={form.order}
									onChange={(e) =>
										setForm((f) => ({
											...f,
											order: Number.parseInt(e.target.value) || 0,
										}))
									}
									disabled={isSaving}
								/>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<Switch
								id="faq-published"
								checked={form.isPublished}
								onCheckedChange={(v) =>
									setForm((f) => ({ ...f, isPublished: v }))
								}
								disabled={isSaving}
							/>
							<Label htmlFor="faq-published">
								{form.isPublished ? "Published" : "Draft"}
							</Label>
						</div>
						{formError && (
							<p className="text-sm text-destructive">{formError}</p>
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDialogOpen(false)}
							disabled={isSaving}
						>
							Cancel
						</Button>
						<Button
							onClick={() => save()}
							disabled={isSaving || !canSubmit}
						>
							{isSaving ? "Saving..." : editing ? "Update" : "Create"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<div className="flex flex-col gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between gap-4">
						<div>
							<CardTitle className="text-base">FAQ Management</CardTitle>
							<CardDescription className="mt-1">
								Manage frequently asked questions displayed at{" "}
								<a
									href="/faq"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground transition-colors"
								>
									/faq <ExternalLinkIcon className="size-3" />
								</a>
							</CardDescription>
						</div>
						<Button size="sm" onClick={openCreate}>
							<PlusIcon className="size-4 mr-2" />
							Add FAQ
						</Button>
					</CardHeader>
					<CardContent>
						{isPending ? (
							<p className="text-sm text-muted-foreground py-6 text-center">
								Loading...
							</p>
						) : isError ? (
							<p className="text-sm text-destructive py-6 text-center">
								Failed to load FAQs.
							</p>
						) : faqs.length === 0 ? (
							<div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
								<p className="text-sm">No FAQs yet. Add your first one.</p>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-8">#</TableHead>
										<TableHead>Question</TableHead>
										<TableHead>Category</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{faqs.map((f) => (
										<TableRow key={f.id}>
											<TableCell className="text-muted-foreground text-sm">
												{f.order}
											</TableCell>
											<TableCell className="font-medium max-w-72 truncate">
												{f.question}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{f.category ?? <span className="opacity-40">—</span>}
											</TableCell>
											<TableCell>
												{f.isPublished ? (
													<Badge>Published</Badge>
												) : (
													<Badge variant="secondary">Draft</Badge>
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1">
													<Button
														size="icon"
														variant="ghost"
														onClick={() => openEdit(f)}
													>
														<PencilIcon className="size-4" />
													</Button>
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button
																size="icon"
																variant="ghost"
																className="text-destructive hover:text-destructive"
															>
																<Trash2Icon className="size-4" />
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
																<AlertDialogDescription>
																	<strong>{f.question}</strong> will be
																	permanently deleted.
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>Cancel</AlertDialogCancel>
																<AlertDialogAction
																	className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
																	onClick={() => deleteFaq(f.id)}
																>
																	Delete
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
								<TableCaption>
									{faqs.length} FAQ{faqs.length !== 1 ? "s" : ""}
								</TableCaption>
							</Table>
						)}
					</CardContent>
				</Card>
			</div>
		</>
	);
}
