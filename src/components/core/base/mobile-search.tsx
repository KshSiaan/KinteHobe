import React from "react";
import {
  ExpandableScreen,
  ExpandableScreenContent,
  ExpandableScreenTrigger,
} from "./expandable-card";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchInput from "./search-input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";

export default function MobileSearch({
  aiSearch,
  setSearchType,
}: {
  aiSearch: boolean;
  setSearchType: (value: boolean) => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost">
          <SearchIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader className="p-4">
          <SheetTitle>
            <Image
              src={"/img/icon.svg"}
              height={124}
              width={124}
              alt="icon"
              className="size-10"
            />
          </SheetTitle>
        </SheetHeader>
        <div className="flex items-center gap-2">
          <InputGroup className="bg-background has-[[data-slot=input-group-control]:focus-visible]:border-0 ring-0!">
            <InputGroupInput placeholder="Search Here.." />
            <InputGroupAddon align="block-end">
              <Toggle
                aria-checked={aiSearch}
                onClick={() => setSearchType(!aiSearch)}
                variant="outline"
                size="sm"
                className="data-[state=on]:border-primary data-[state=on]:text-primary border bg-background"
              >
                AI Search
              </Toggle>
              <Button className="ml-auto" size="sm">
                <SearchIcon /> Search
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="h-[50dvh] border-t"></div>
      </SheetContent>
    </Sheet>
  );
}
