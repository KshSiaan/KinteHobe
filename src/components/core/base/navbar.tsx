"use client";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
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
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  BellIcon,
  CheckCheckIcon,
  CircleQuestionMarkIcon,
  DoorOpenIcon,
  GlobeIcon,
  LogOut,
  MapPinHouse,
  ScrollTextIcon,
  SearchIcon,
  ShoppingCartIcon,
  UserPlus,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { sileo } from "sileo";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/kibo-ui/spinner";

export default function Navbar() {
  const { isPending, data } = authClient.useSession();
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

  return (
    <>
      <div className="h-26 border-b fixed top-0 left-0 w-full bg-background z-50 ">
        <div className="h-16! w-full border-b flex flex-row items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Image
              src={"/img/icon.svg"}
              height={124}
              width={124}
              alt="icon"
              className="size-10"
            />
            <InputGroup className="w-[30dvw] border border-muted-foreground/20 bg-background">
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
          <div className="flex gap-6 items-center">
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
            <Button variant={"ghost"} size={"icon"}>
              <ShoppingCartIcon />
            </Button>
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
                    <span className="text-sm">{data.user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <span className="text-xs text-muted-foreground">
                      {data.user.email}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/me">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
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
              <div className="flex gap-2">
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
          </div>
        </div>
        <div className="h-10 w-full flex items-center justify-between px-6">
          <div className="flex gap-2 items-center h-full ">
            <Button variant={"link"} className="text-xs" asChild>
              <Link href="#">Best sellers</Link>
            </Button>
            <Button variant={"link"} className="text-xs" asChild>
              <Link href="#">Trending</Link>
            </Button>
            <Button variant={"link"} className="text-xs" asChild>
              <Link href="#">Most favourites</Link>
            </Button>
          </div>
          <div className="flex gap-2 items-center h-full">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"ghost"} size={"icon-sm"}>
                  <BellIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverHeader className="flex! flex-row justify-between items-center">
                  <PopoverTitle>Notifications</PopoverTitle>
                  <Button size={"icon-sm"} variant={"ghost"}>
                    <CheckCheckIcon />
                  </Button>
                </PopoverHeader>
                <div className="">
                  <Alert>
                    <UserPlus />
                    <AlertTitle>Chimichanga followed you</AlertTitle>
                    <AlertDescription className="text-xs line-clamp-2">
                      Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                      Sunt sed consequatur incidunt saepe molestiae placeat
                      error officiis, modi repudiandae perferendis culpa quaerat
                      adipisci maiores similique quod ut facilis officia neque.
                    </AlertDescription>
                  </Alert>
                </div>
                <div className="">
                  <Button variant={"secondary"} size={"sm"} className="w-full">
                    View all notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant={"ghost"} size={"icon-sm"}>
              <ScrollTextIcon />
            </Button>
            <Button variant={"ghost"} size={"icon-sm"}>
              <UsersIcon />
            </Button>
            <Button variant={"ghost"} size={"icon-sm"}>
              <MapPinHouse />
            </Button>
            <Button variant={"ghost"} size={"icon-sm"}>
              <CircleQuestionMarkIcon />
            </Button>
          </div>
        </div>
      </div>
      <div className="h-26 w-full bg-background" />
    </>
  );
}
