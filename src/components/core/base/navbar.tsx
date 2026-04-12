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
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import {
  BellIcon,
  CircleQuestionMarkIcon,
  GlobeIcon,
  MapPinHouse,
  ScrollTextIcon,
  SearchIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Navbar() {
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
                <Button variant={"ghost"}>Find by Category</Button>
              </SheetTrigger>
            </Sheet>
            <Button variant={"ghost"} size={"icon"}>
              <ShoppingCartIcon />
            </Button>
            <Avatar>
              <AvatarImage
                src={
                  "https://api.dicebear.com/9.x/lorelei-neutral/svg?seed=Felix"
                }
              />
              <AvatarFallback>UI</AvatarFallback>
            </Avatar>
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
            <Button variant={"ghost"} size={"icon-sm"}>
              <BellIcon />
            </Button>
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
