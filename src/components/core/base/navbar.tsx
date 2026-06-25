"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CircleQuestionMarkIcon,
  DoorOpenIcon,
  EditIcon,
  GlobeIcon,
  HatGlassesIcon,
  LogOut,
  MapPinHouse,
  MenuIcon,
  ScrollTextIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";
import NotificationBell from "./notification-bell";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { sileo } from "sileo";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "@/components/kibo-ui/spinner";
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
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Cart from "./cart";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import SavedLocation from "./saved-location";

export default function Navbar() {
  const { isPending, data } = authClient.useSession();
  const path = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      sileo.success({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      router.push("/");
    } catch (error) {
      sileo.error({
        title: "Logout failed",
        description: "An error occurred while logging out.",
      });
    }
  };
  const handleStopImpersonating = async () => {
    try {
      authClient.admin.stopImpersonating(
        {},
        {
          onError: (err: any) => {
            sileo.error({
              title: "Failed to stop impersonation",
              description:
                err.error.message ?? "Failed to complete this request",
            });
          },
          onSuccess: () => {
            router.push("/admin/dashboard/users");
          },
        },
      );
    } catch (error) {
      sileo.error({
        title: "Failed to stop impersonation",
        description: "An error occurred while trying to stop impersonation.",
      });
    }
  };

  return (
    <>
      <div className="h-16 md:h-26 border-b fixed z-50 top-0 left-0 w-full bg-background">
        <div className="h-16! w-full border-b flex flex-row items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 md:gap-6">
            <Link href={"/"} className="hover:opacity-70">
              <Image
                src={"/img/icon.svg"}
                height={124}
                width={124}
                alt="icon"
                className="size-10"
              />
            </Link>
            <InputGroup className="hidden md:flex w-[30dvw] border border-muted-foreground/20 bg-background">
              <InputGroupAddon>
                <InputGroupButton>
                  <SearchIcon />
                </InputGroupButton>
              </InputGroupAddon>
              <InputGroupInput
                className="text-sm"
                placeholder="What are you looking for? Ask AI"
              />
            </InputGroup>
          </div>
          <div className="flex gap-2 md:gap-6 items-center">
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"ghost"}>
                    <GlobeIcon />
                    English
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Bangla</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {path === "/" && (
              <div className="hidden md:block">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant={"ghost"}>Filter by</Button>
                  </SheetTrigger>
                  <SheetContent side="bottom">
                    <SheetHeader>
                      <SheetTitle>Filter by</SheetTitle>
                    </SheetHeader>
                    <div className="h-[40dvh]"></div>
                  </SheetContent>
                </Sheet>
              </div>
            )}
            <Suspense fallback={<Skeleton className="size-8" />}>
              <Cart />
            </Suspense>
            {isPending ? (
              <div className="flex items-center gap-2">
                <Spinner variant="infinite" />
              </div>
            ) : data?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"ghost"} className="gap-2" size={"lg"}>
                    <Avatar className="size-8">
                      <AvatarImage
                        src={
                          data.user.image ??
                          "https://api.dicebear.com/9.x/lorelei-neutral/svg?seed=Felix"
                        }
                        alt={data.user.name}
                      />
                      <AvatarFallback>
                        {data.user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm">
                      {data.user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {data?.user?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href={"/admin/dashboard"}>Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {data?.user?.role === "manager" && (
                    <DropdownMenuItem asChild>
                      <Link href={"/manager/dashboard"}>Dashboard</Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/me">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/me/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex gap-2">
                <Button variant={"outline"} asChild>
                  <Link href={"/auth/register"}>Sign up</Link>
                </Button>
                <Button asChild>
                  <Link href={"/auth/login"}>
                    Sign in <DoorOpenIcon />
                  </Link>
                </Button>
              </div>
            )}
            {/* Mobile hamburger menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant={"ghost"} size={"icon"} className="md:hidden">
                  <MenuIcon className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-70 overflow-y-auto p-4">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col gap-6">
                  <InputGroup className="w-full border border-muted-foreground/20 bg-background">
                    <InputGroupAddon>
                      <InputGroupButton>
                        <SearchIcon />
                      </InputGroupButton>
                    </InputGroupAddon>
                    <InputGroupInput
                      className="text-sm"
                      placeholder="Search…"
                    />
                  </InputGroup>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-1">
                      Explore
                    </p>
                    <Button variant={"ghost"} className="justify-start" asChild>
                      <Link href="/products?preference=best_selling">
                        Best sellers
                      </Link>
                    </Button>
                    <Button variant={"ghost"} className="justify-start" asChild>
                      <Link href="/products?preference=trending">Trending</Link>
                    </Button>
                    <Button variant={"ghost"} className="justify-start" asChild>
                      <Link href="/products?preference=most_favorites">
                        Most favourites
                      </Link>
                    </Button>
                  </div>
                  {!isPending && !data?.user && (
                    <div className="flex flex-col gap-2">
                      <Button variant={"outline"} asChild>
                        <Link href={"/auth/register"}>Sign up</Link>
                      </Button>
                      <Button asChild>
                        <Link href={"/auth/login"}>
                          Sign in <DoorOpenIcon className="ml-2 size-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                  {data?.session?.token && (
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-1">
                        Account
                      </p>
                      <Button
                        variant={"ghost"}
                        className="justify-start gap-2"
                        asChild
                      >
                        <Link href="/me/orders">
                          <ScrollTextIcon className="size-4" />
                          Orders
                        </Link>
                      </Button>
                      <Button
                        variant={"ghost"}
                        className="justify-start gap-2"
                        asChild
                      >
                        <Link href="/people">
                          <UsersIcon className="size-4" />
                          People
                        </Link>
                      </Button>
                      <Button
                        variant={"ghost"}
                        className="justify-start gap-2"
                        asChild
                      >
                        <Link href="/faq">
                          <CircleQuestionMarkIcon className="size-4" />
                          Help
                        </Link>
                      </Button>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-1">
                      Language
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant={"ghost"}
                          className="justify-start w-full gap-2"
                        >
                          <GlobeIcon className="size-4" />
                          English
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Bangla</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {/* Bottom nav row — desktop only */}
        <div className="hidden md:flex h-10 w-full items-center justify-between px-6">
          <div className="flex gap-2 items-center h-full ">
            <Button variant={"link"} className="text-xs px-0! mr-4" asChild>
              <Link href="/products?preference=best_selling">Best sellers</Link>
            </Button>
            <Button variant={"link"} className="text-xs px-0! mr-4" asChild>
              <Link href="/products?preference=trending">Trending</Link>
            </Button>
            <Button variant={"link"} className="text-xs px-0! mr-4" asChild>
              <Link href="/products?preference=most_favorites">
                Most favourites
              </Link>
            </Button>
          </div>
          <div className="flex gap-2 items-center h-full">
            {data?.session.token && <NotificationBell />}

            {data?.session?.token && (
              <>
                <Button variant={"ghost"} size={"icon-sm"} asChild>
                  <Link href="/me/orders">
                    <ScrollTextIcon />
                  </Link>
                </Button>
                <Button variant={"ghost"} size={"icon-sm"} asChild>
                  <Link href="/people">
                    <UsersIcon />
                  </Link>
                </Button>
              </>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"ghost"} size={"icon-sm"}>
                  <MapPinHouse />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end">
                <PopoverHeader className="flex flex-row justify-between items-center">
                  <PopoverTitle>Saved Locations</PopoverTitle>
                  <Button size="icon-sm" variant="ghost" asChild>
                    <Link href="/me/settings">
                      <EditIcon />
                    </Link>
                  </Button>
                </PopoverHeader>
                <div className="">
                  <Suspense fallback={<Skeleton className="h-20 w-full" />}>
                    <SavedLocation />
                  </Suspense>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant={"ghost"} size={"icon-sm"} asChild>
              <Link href="/faq">
                <CircleQuestionMarkIcon />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="h-16 md:h-26 w-full bg-background" />
      {data?.session?.impersonatedBy && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="bg-primary rounded-full p-4 fixed bottom-6 right-6 transform  shadow-lg hover:bg-primary/80 transition-colors z-40"
            >
              <HatGlassesIcon className="text-background size-6" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Stop Impersonating?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to stop impersonating this user and return
                to your Dashboard?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleStopImpersonating}>
                Return to Admin Panel
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
