"use client";
import React, { useState } from "react";
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
import { CreateResponseType } from "@/lib/backend/message";
import { useQuery } from "@tanstack/react-query";
import { howl } from "@/lib/utils";
import { useDebounce } from "react-haiku";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { Spinner } from "@/components/kibo-ui/spinner";

export default function MobileSearch({
  aiSearch,
  setSearchType,
}: {
  aiSearch: boolean;
  setSearchType: (value: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const {
    data,
    isEnabled,
    isPending: isSearchPending,
  } = useQuery({
    queryKey: ["search", debouncedSearchQuery],
    enabled: !!debouncedSearchQuery,
    queryFn: async (): Promise<{
      message: string;
      ok: boolean;
      q: string;
      data: Array<{
        id: string;
        groupId: string;
        code: any;
        sku: string;
        price: string;
        compareAtPrice: string;
        stockQuantity: number;
        weight: string;
        details: string;
        metadata: Array<{
          id: string;
          name: string;
          description: string;
        }>;
        position: number;
        kind: string;
        enabled: boolean;
        title: string;
        optionName: any;
        images: Array<string>;
        createdAt: string;
        bodySearch: string;
        updatedAt: string;
        rank: number;
        publicImages: Array<string>;
        lol: string;
      }>;
    }> => {
      return howl(`/api/client/search?q=${debouncedSearchQuery}`);
    },
  });

  const { data: dailyDiscoverData } = useQuery({
    queryKey: ["dailyDiscover", 4],
    queryFn: async (): Promise<
      CreateResponseType<{
        data: {
          id: string;
          slug: string;
          title: string;
          description: string;
          category: {
            id: string;
            name: string;
            slug: string;
            description: string;
            image: string;
            banner: string;
            isActive: boolean;
            metaTitle: string;
            metaDescription: string;
            createdAt: string;
            updatedAt: string;
          };
          categoryId: string;
          status: string;
          variantIds: Array<string>;
          createdAt: string;
          updatedAt: string;
          variants: Array<{
            id: string;
            groupId: string;
            code?: string;
            sku: string;
            price: string;
            compareAtPrice: string;
            stockQuantity: number;
            weight?: string;
            details: string;
            metadata: Array<{
              id: string;
              name: string;
              description: string;
            }>;
            position: number;
            kind: string;
            enabled: boolean;
            title: string;
            optionName: any;
            images: Array<string>;
            createdAt: string;
            updatedAt: string;
            publicImages: Array<string>;
          }>;
        }[];
      }>
    > => {
      const res = await fetch("/api/product?limit=4");
      const data = await res.json();
      return data;
    },
  });
  const { data: cats } = useQuery({
    queryKey: ["fetchCategories"],
    queryFn: async (): Promise<
      CreateResponseType<{
        data: {
          id: string;
          name: string;
          slug: string;
          image: string;
          banner: string;
          description: string;
          isActive: boolean;
          metaTitle: string;
          metaDescription: string;
          createdAt: string;
          updatedAt: string;
        }[];
      }>
    > => {
      const res = await fetch("/api/client/category");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost">
          <SearchIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader className="p-4 ">
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
        <div className="flex items-center gap-2 ">
          <InputGroup className="bg-white! has-[[data-slot=input-group-control]:focus-visible]:border-0 ring-0!">
            <InputGroupInput
              placeholder="Search Here.."
              value={searchQuery}
              className="bg-background! border-0! ring-0! focus-visible:ring-0! focus-visible:border-0!"
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setOpen(true)}
            />
            <InputGroupAddon align="block-end" className="bg-background">
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
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 8,
                scale: 0.98,
              }}
              transition={{
                duration: 0.18,
                ease: "easeOut",
              }}
              className="
                        absolute
                        left-0
                        top-full
                        z-10
                        w-full
                        overflow-hidden
                        border
                        border-t-0
                        bg-muted!
                        backdrop-blur-2xl
                        shadow-[0_25px_80px_rgba(0,0,0,.18)]
                      "
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Quick Search
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs text-muted-foreground"
                  >
                    <Link href="/search">Explore More</Link>
                  </Button>
                </div>

                <div className="space-y-2">
                  {isEnabled &&
                    data?.data.map((item, i) => (
                      <motion.button
                        key={item.id}
                        initial={{
                          opacity: 0,
                          x: -10,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay: i * 0.05,
                        }}
                        className="
                                flex
                                w-full
                                items-center
                                gap-3
                                rounded-xl
                                px-3
                                py-2.5
                                text-left
                                text-sm
                                transition-colors
                                hover:bg-accent
                                
                              "
                      >
                        {item.publicImages?.[0] && (
                          <Image
                            src={
                              item?.publicImages[0] || "/images/placeholder.png"
                            }
                            alt={item.title}
                            className="size-12 rounded-md object-cover"
                            height={48}
                            width={48}
                          />
                        )}
                        <div className="">
                          <h4>{item.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.details}
                          </p>
                        </div>
                      </motion.button>
                    ))}

                  {data?.data?.length === 0 && <div>No results found</div>}
                  {!isEnabled && isSearchPending && (
                    <div className="border-y py-2">
                      <div className="grid grid-cols-4 gap-4">
                        {cats?.data
                          ?.sort(() => Math.random() - 0.5)
                          .slice(0, 4)
                          .map((cat) => (
                            <Button
                              key={cat.id}
                              className="text-xs text-muted-foreground cursor-pointer"
                              variant="link"
                            >
                              {cat.name}
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}

                  {!isEnabled &&
                    dailyDiscoverData?.data?.map((item, i) => (
                      <Link href={`/product/${item.slug}`} key={item.id}>
                        <motion.button
                          initial={{
                            opacity: 0,
                            x: -10,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            delay: i * 0.05,
                          }}
                          className="
                                flex
                                w-full
                                items-center
                                gap-3
                                rounded-xl
                                px-3
                                py-2.5
                                text-left
                                text-sm
                                transition-colors
                                hover:bg-accent
                              "
                        >
                          {item.variants[0].publicImages && (
                            <Image
                              src={
                                item?.variants[0].publicImages[0] ||
                                "/images/placeholder.png"
                              }
                              alt={item.title}
                              className="size-12 rounded-md object-cover"
                              height={124}
                              width={124}
                            />
                          )}
                          <div className="">
                            <h4>{item.variants[0].title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {item.variants[0].details}
                            </p>
                          </div>
                        </motion.button>
                      </Link>
                    ))}
                  {isEnabled && isSearchPending && (
                    <div className="flex justify-center items-center p-4">
                      <Spinner variant="bars" className="text-primary" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
