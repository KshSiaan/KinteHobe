"use client";

import AreaChart, { Area } from "@/components/charts/area-chart";
import Grid from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";
import XAxis from "@/components/charts/x-axis";
import { RevenueGoalCard } from "@/components/dashboard/revenue-goal-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
	AlertTriangleIcon,
	ArrowRightIcon,
	ClockIcon,
	DollarSignIcon,
	PackageIcon,
	ShoppingBagIcon,
	UsersIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

// ── types ────────────────────────────────────────────────────────────────────

type OrderStatus =
	| "pending_payment"
	| "paid"
	| "processing"
	| "shipped"
	| "delivered"
	| "cancelled"
	| "refunded";

type MonthlySalesPoint = {
	date: string;
	label: string;
	revenue: number;
	orderCount: number;
};

type DashboardData = {
	kpis: {
		totalCustomers: number;
		ordersToday: number;
		revenueThisMonthCents: number;
		pendingOrders: number;
	};
	recentOrders: Array<{
		id: string;
		shippingName: string;
		totalCents: number;
		status: OrderStatus;
		createdAt: string;
	}>;
	orderPipeline: Partial<Record<OrderStatus, number>>;
	lowStock: Array<{
		id: string;
		title: string;
		sku: string;
		stockQuantity: number;
	}>;
	monthlySales: MonthlySalesPoint[];
};

// ── constants ────────────────────────────────────────────────────────────────

const PIPELINE_ORDER: OrderStatus[] = [
	"pending_payment",
	"paid",
	"processing",
	"shipped",
	"delivered",
	"cancelled",
	"refunded",
];

const STATUS_LABEL: Record<OrderStatus, string> = {
	pending_payment: "Awaiting Payment",
	paid: "Paid",
	processing: "Processing",
	shipped: "Shipped",
	delivered: "Delivered",
	cancelled: "Cancelled",
	refunded: "Refunded",
};

const STATUS_BADGE: Record<
	OrderStatus,
	"default" | "secondary" | "success" | "destructive" | "warning"
> = {
	pending_payment: "secondary",
	paid: "default",
	processing: "warning",
	shipped: "default",
	delivered: "success",
	cancelled: "destructive",
	refunded: "destructive",
};

// ── helpers ──────────────────────────────────────────────────────────────────

function formatUSD(cents: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(cents / 100);
}

function timeAgo(dateStr: string): string {
	const diff = Date.now() - new Date(dateStr).getTime();
	const mins = Math.floor(diff / 60_000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h ago`;
	return `${Math.floor(hrs / 24)}d ago`;
}

function stockVariant(qty: number): "destructive" | "warning" | "secondary" {
	if (qty < 5) return "destructive";
	if (qty < 10) return "warning";
	return "secondary";
}

// ── sub-components ───────────────────────────────────────────────────────────

function KpiCard({
	title,
	value,
	icon,
	loading,
	highlight,
	sub,
}: {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	loading: boolean;
	highlight?: "warning" | "success";
	sub?: string;
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{title}
				</CardTitle>
				<span
					className={
						highlight === "warning"
							? "text-orange-500"
							: highlight === "success"
								? "text-green-500"
								: "text-muted-foreground"
					}
				>
					{icon}
				</span>
			</CardHeader>
			<CardContent>
				{loading ? (
					<Skeleton className="h-8 w-24" />
				) : (
					<>
						<p
							className={`text-2xl sm:text-3xl font-bold ${
								highlight === "warning"
									? "text-orange-500"
									: highlight === "success"
										? "text-green-600"
										: ""
							}`}
						>
							{value}
						</p>
						{sub && (
							<p className="text-xs text-muted-foreground mt-1">{sub}</p>
						)}
					</>
				)}
			</CardContent>
		</Card>
	);
}

function RecentOrdersCard({
	orders,
	loading,
}: {
	orders: DashboardData["recentOrders"] | undefined;
	loading: boolean;
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-3">
				<CardTitle className="text-base">Recent Orders</CardTitle>
				<Button variant="ghost" size="sm" asChild className="text-xs h-7 px-2">
					<Link href="/manager/dashboard/orders">
						View all <ArrowRightIcon className="ml-1 h-3 w-3" />
					</Link>
				</Button>
			</CardHeader>
			<CardContent className="p-0">
				{loading ? (
					<div className="flex flex-col gap-3 px-6 pb-6">
						{Array.from({ length: 4 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
							<Skeleton key={i} className="h-10 w-full" />
						))}
					</div>
				) : !orders?.length ? (
					<p className="text-sm text-muted-foreground px-6 pb-6">
						No orders yet.
					</p>
				) : (
					<div className="divide-y">
						{orders.map((o) => (
							<div
								key={o.id}
								className="flex items-center justify-between px-6 py-3 hover:bg-muted/40 transition-colors"
							>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium truncate">{o.shippingName}</p>
									<p className="text-xs text-muted-foreground font-mono">
										#{o.id.slice(0, 8)}…
									</p>
								</div>
								<div className="flex items-center gap-3 shrink-0 ml-3">
									<Badge variant={STATUS_BADGE[o.status]} className="text-xs">
										{STATUS_LABEL[o.status]}
									</Badge>
									<div className="text-right">
										<p className="text-sm font-semibold">
											{formatUSD(o.totalCents)}
										</p>
										<p className="text-xs text-muted-foreground">
											{timeAgo(o.createdAt)}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function OrderPipelineCard({
	pipeline,
	loading,
}: {
	pipeline: DashboardData["orderPipeline"] | undefined;
	loading: boolean;
}) {
	const total = pipeline
		? Object.values(pipeline).reduce((s, n) => s + (n ?? 0), 0)
		: 0;

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base">Order Pipeline</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-2.5">
				{loading
					? Array.from({ length: 5 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
							<Skeleton key={i} className="h-7 w-full" />
						))
					: PIPELINE_ORDER.map((status) => {
							const count = pipeline?.[status] ?? 0;
							if (count === 0) return null;
							const pct = total > 0 ? Math.round((count / total) * 100) : 0;
							return (
								<div key={status} className="flex items-center gap-3">
									<div className="w-28 shrink-0">
										<Badge
											variant={STATUS_BADGE[status]}
											className="text-xs w-full justify-center"
										>
											{STATUS_LABEL[status]}
										</Badge>
									</div>
									<div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
										<div
											className="h-full bg-primary rounded-full transition-all"
											style={{ width: `${pct}%` }}
										/>
									</div>
									<span className="text-sm font-semibold w-6 text-right shrink-0">
										{count}
									</span>
								</div>
							);
						})}
				{!loading && total === 0 && (
					<p className="text-sm text-muted-foreground">No orders found.</p>
				)}
			</CardContent>
		</Card>
	);
}

function LowStockCard({
	items,
	loading,
}: {
	items: DashboardData["lowStock"] | undefined;
	loading: boolean;
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-3">
				<CardTitle className="text-base flex items-center gap-2">
					<AlertTriangleIcon className="h-4 w-4 text-orange-500" />
					Low Stock Alerts
				</CardTitle>
				<Button variant="ghost" size="sm" asChild className="text-xs h-7 px-2">
					<Link href="/manager/dashboard/products">
						Manage <ArrowRightIcon className="ml-1 h-3 w-3" />
					</Link>
				</Button>
			</CardHeader>
			<CardContent className="p-0">
				{loading ? (
					<div className="flex flex-col gap-2 px-6 pb-6">
						{Array.from({ length: 4 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
							<Skeleton key={i} className="h-8 w-full" />
						))}
					</div>
				) : !items?.length ? (
					<div className="flex flex-col items-center gap-2 py-5 text-center px-6">
						<PackageIcon className="h-8 w-8 text-green-500" />
						<p className="text-sm text-muted-foreground">
							All products well stocked.
						</p>
					</div>
				) : (
					<div className="divide-y">
						{items.map((item) => (
							<div
								key={item.id}
								className="flex items-center justify-between px-6 py-2.5 hover:bg-muted/40 transition-colors"
							>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium truncate">
										{item.title || "—"}
									</p>
									<p className="text-xs text-muted-foreground">
										SKU: {item.sku || "—"}
									</p>
								</div>
								<Badge
									variant={stockVariant(item.stockQuantity)}
									className="ml-3 shrink-0 text-xs"
								>
									{item.stockQuantity} left
								</Badge>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function Page() {
	const { data, isPending } = useQuery<DashboardData>({
		queryKey: ["manager-dashboard"],
		queryFn: () =>
			fetch("/api/manager/dashboard").then((r) => r.json()),
		refetchInterval: 60_000,
	});

	const [chartMonths, setChartMonths] = useState<number>(12);

	const chartData = useMemo(() => {
		const raw = data?.monthlySales ?? [];
		return raw
			.slice(-chartMonths)
			.map((p) => ({ ...p, date: new Date(p.date) }));
	}, [data?.monthlySales, chartMonths]);

	const kpis = data?.kpis;

	return (
		<div className="p-4 sm:p-6 flex flex-col flex-1 h-full w-full gap-6">
			<h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>

			{/* ── KPI strip ─────────────────────────────────────────────────── */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
				<KpiCard
					title="Total Customers"
					value={kpis?.totalCustomers.toLocaleString() ?? 0}
					icon={<UsersIcon className="h-4 w-4" />}
					loading={isPending}
				/>
				<KpiCard
					title="Orders Today"
					value={kpis?.ordersToday.toLocaleString() ?? 0}
					icon={<ShoppingBagIcon className="h-4 w-4" />}
					loading={isPending}
					sub="Confirmed (excl. unpaid)"
				/>
				<KpiCard
					title="Revenue This Month"
					value={kpis !== undefined ? formatUSD(kpis.revenueThisMonthCents) : "—"}
					icon={<DollarSignIcon className="h-4 w-4" />}
					loading={isPending}
					highlight={kpis && kpis.revenueThisMonthCents > 0 ? "success" : undefined}
				/>
				<KpiCard
					title="Pending Fulfillment"
					value={kpis?.pendingOrders.toLocaleString() ?? 0}
					icon={<ClockIcon className="h-4 w-4" />}
					loading={isPending}
					highlight={kpis?.pendingOrders && kpis.pendingOrders > 0 ? "warning" : "success"}
					sub={
						kpis?.pendingOrders
							? `${kpis.pendingOrders} order${kpis.pendingOrders > 1 ? "s" : ""} need action`
							: "All caught up"
					}
				/>
			</div>

			{/* ── main two-column layout (single grid, both cols stack internally) ── */}
			<div className="grid grid-cols-1 lg:grid-cols-7 gap-6 items-start">
				{/* left col: chart → recent orders */}
				<div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
					<Card>
						<CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
							<CardTitle className="text-sm sm:text-base">
								Sale Performance
							</CardTitle>
							<Select
								value={String(chartMonths)}
								onValueChange={(v) => setChartMonths(Number(v))}
							>
								<SelectTrigger className="w-full sm:w-44">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="12">Last 12 Months</SelectItem>
									<SelectItem value="6">Last 6 Months</SelectItem>
									<SelectItem value="3">Last 3 Months</SelectItem>
								</SelectContent>
							</Select>
						</CardHeader>
						<CardContent className="h-56 w-full">
							{isPending || chartData.length === 0 ? (
								<Skeleton className="h-full w-full rounded-lg" />
							) : (
								<AreaChart
									className="h-full w-full"
									data={chartData}
									xDataKey="date"
								>
									<Grid horizontal />
									<Area
										dataKey="revenue"
										fill="var(--chart-2)"
										fillOpacity={0.4}
									/>
									<XAxis />
									<ChartTooltip />
								</AreaChart>
							)}
						</CardContent>
					</Card>

					<RecentOrdersCard orders={data?.recentOrders} loading={isPending} />
				</div>

				{/* right col: revenue goal → pipeline → low stock */}
				<div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
					<RevenueGoalCard canEdit={false} />
					<OrderPipelineCard pipeline={data?.orderPipeline} loading={isPending} />
					<LowStockCard items={data?.lowStock} loading={isPending} />
				</div>
			</div>
		</div>
	);
}
