"use client";

import { Gauge } from "@/components/gauge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GoalIcon, PencilIcon } from "lucide-react";
import { useState } from "react";

type GoalData = {
	goal: {
		id: string;
		targetCents: number;
		month: number;
		year: number;
	} | null;
	actualCents: number;
	month: number;
	year: number;
};

const MONTH_NAMES = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatUSD(cents: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(cents / 100);
}

interface RevenueGoalCardProps {
	canEdit: boolean;
}

export function RevenueGoalCard({ canEdit }: RevenueGoalCardProps) {
	const queryClient = useQueryClient();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const [inputError, setInputError] = useState("");

	const { data, isPending } = useQuery<GoalData>({
		queryKey: ["revenue-goal"],
		queryFn: () => fetch("/api/admin/revenue-goal").then((r) => r.json()),
	});

	const { mutate: saveGoal, isPending: isSaving } = useMutation({
		mutationFn: async (targetCents: number) => {
			const res = await fetch("/api/admin/revenue-goal", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ targetCents }),
			});
			if (!res.ok) {
				const j = await res.json();
				throw new Error(j.message ?? "Failed to save goal");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["revenue-goal"] });
			setDialogOpen(false);
			setInputValue("");
			setInputError("");
		},
		onError: (e: Error) => setInputError(e.message),
	});

	function openDialog() {
		setInputValue(data?.goal ? String(data.goal.targetCents / 100) : "");
		setInputError("");
		setDialogOpen(true);
	}

	function handleSave() {
		const dollars = Number.parseFloat(inputValue);
		if (Number.isNaN(dollars) || dollars <= 0) {
			setInputError("Enter a valid positive amount.");
			return;
		}
		saveGoal(Math.round(dollars * 100));
	}

	const monthLabel = data
		? `${MONTH_NAMES[data.month - 1]} ${data.year}`
		: "";
	const hasGoal = Boolean(data?.goal);
	const gaugeValue = data?.goal
		? Math.min(Math.round((data.actualCents / data.goal.targetCents) * 100), 100)
		: 0;

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
					<div>
						<CardTitle className="text-base">Total Revenue this month</CardTitle>
						{!isPending && (
							<p className="text-xs text-muted-foreground mt-0.5">{monthLabel}</p>
						)}
					</div>
					{canEdit && !isPending && hasGoal && (
						<Button
							size="icon"
							variant="ghost"
							className="h-7 w-7 shrink-0"
							onClick={openDialog}
							aria-label="Edit revenue goal"
						>
							<PencilIcon className="h-3.5 w-3.5" />
						</Button>
					)}
				</CardHeader>

				<CardContent>
					{isPending ? (
						<div className="flex flex-col items-center gap-3 py-4">
							<Skeleton className="h-48 w-48 rounded-full" />
						</div>
					) : hasGoal ? (
						<div className="flex h-full w-full items-center justify-center">
							<Gauge
								value={gaugeValue}
								size={200}
								gaugeType="full"
								tickMarks
								accumulate="sum"
								primary={{
									0: "danger",
									30: "warning",
									70: "success",
								}}
								label="of goal"
								unit="%"
								max={100}
							/>
						</div>
					) : canEdit ? (
						<div className="flex flex-col items-center gap-4 py-6 text-center">
							<GoalIcon className="h-12 w-12 text-muted-foreground" />
							<div className="space-y-1">
								<p className="font-medium text-sm">No goal set for {monthLabel}</p>
								<p className="text-xs text-muted-foreground">
									Set a monthly revenue target to track progress
								</p>
							</div>
							<Button size="sm" onClick={openDialog}>
								Set Goal
							</Button>
						</div>
					) : (
						<div className="flex flex-col items-center gap-3 py-6 text-center">
							<GoalIcon className="h-10 w-10 text-muted-foreground" />
							<p className="text-sm text-muted-foreground">
								No revenue goal set for {monthLabel}.
							</p>
						</div>
					)}
				</CardContent>

				{hasGoal && data?.goal && (
					<CardFooter className="grid grid-cols-2 gap-2">
						<div className="flex flex-col items-center">
							<p className="text-sm text-muted-foreground">Target</p>
							<p className="text-2xl font-bold">
								{formatUSD(data.goal.targetCents)}
							</p>
						</div>
						<div className="flex flex-col items-center">
							<p className="text-sm text-muted-foreground">Current</p>
							<p className="text-2xl font-bold">{formatUSD(data.actualCents)}</p>
						</div>
					</CardFooter>
				)}
			</Card>

			{canEdit && (
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogContent className="sm:max-w-sm">
						<DialogHeader>
							<DialogTitle>
								{hasGoal ? "Edit Revenue Goal" : "Set Revenue Goal"}
							</DialogTitle>
							<DialogDescription>
								Monthly target for {monthLabel}. Visible to all managers.
							</DialogDescription>
						</DialogHeader>

						<div className="flex flex-col gap-3 py-2">
							<Label htmlFor="revenue-goal-input">Target Amount (USD)</Label>
							<div className="relative">
								<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground select-none">
									$
								</span>
								<Input
									id="revenue-goal-input"
									type="number"
									min="1"
									step="1"
									className="pl-7"
									placeholder="10000"
									value={inputValue}
									onChange={(e) => {
										setInputValue(e.target.value);
										setInputError("");
									}}
									onKeyDown={(e) => e.key === "Enter" && handleSave()}
									autoFocus
								/>
							</div>
							{inputError && (
								<p className="text-sm text-destructive">{inputError}</p>
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
								onClick={handleSave}
								disabled={isSaving || !inputValue.trim()}
							>
								{isSaving ? "Saving..." : "Save Goal"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
