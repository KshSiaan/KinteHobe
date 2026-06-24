"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import {
	BellIcon,
	ChevronsUpDownIcon,
	LogOutIcon,
	MessageSquareIcon,
	UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function initials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

export function NavUser({
	user,
}: {
	user: {
		name: string;
		email: string;
		avatar: string;
	};
}) {
	const { isMobile } = useSidebar();
	const { data } = authClient.useSession();
	const router = useRouter();

	const role = data?.user?.role ?? "manager";
	const userId = data?.user?.id ?? "";

	const roleLabel = role === "admin" ? "Admin" : "Manager";

	async function handleSignOut() {
		await authClient.signOut();
		router.push("/");
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={user.avatar} alt={user.name} />
								<AvatarFallback className="rounded-lg text-xs">
									{initials(user.name || "U")}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user.name}</span>
								<span className="truncate text-xs text-muted-foreground">
									{user.email}
								</span>
							</div>
							<ChevronsUpDownIcon className="ml-auto size-4 shrink-0" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={user.avatar} alt={user.name} />
									<AvatarFallback className="rounded-lg text-xs">
										{initials(user.name || "U")}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<div className="flex items-center gap-1.5">
										<span className="truncate font-medium">{user.name}</span>
										<Badge
											variant="secondary"
											className="text-[10px] px-1 py-0 h-4 shrink-0"
										>
											{roleLabel}
										</Badge>
									</div>
									<span className="truncate text-xs text-muted-foreground">
										{user.email}
									</span>
								</div>
							</div>
						</DropdownMenuLabel>

						<DropdownMenuSeparator />

						<DropdownMenuGroup>
							{role === "admin" && userId && (
								<DropdownMenuItem asChild>
									<Link href={`/admin/dashboard/users/${userId}`}>
										<UserIcon className="size-4" />
										View Profile
									</Link>
								</DropdownMenuItem>
							)}
							{role === "manager" && (
								<DropdownMenuItem asChild>
									<Link href="/manager/dashboard/feedbacks">
										<MessageSquareIcon className="size-4" />
										My Feedbacks
									</Link>
								</DropdownMenuItem>
							)}
							<DropdownMenuItem asChild>
								<Link href="/me/notifications">
									<BellIcon className="size-4" />
									Notifications
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							className="text-destructive focus:text-destructive"
							onClick={handleSignOut}
						>
							<LogOutIcon className="size-4" />
							Sign Out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
