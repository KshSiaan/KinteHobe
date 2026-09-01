"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SearchIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useDebounce } from "react-haiku";
import { useQuery } from "@tanstack/react-query";
import { howl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateResponseType } from "@/lib/backend/message";
import { Spinner } from "@/components/kibo-ui/spinner";
export default function SearchInput() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

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

  // console.log("search data", data);

  return (
    <div
      ref={containerRef}
      className="relative w-full md:w-[30dvw] md:flex gap-2 "
    >
      <InputGroup
        className={`
          relative z-20
          border
          bg-background/90
          backdrop-blur-xl
          transition-all
          duration-200
          ${
            open
              ? "rounded-b-none border-primary border-b-0! shadow-lg"
              : "border-muted-foreground/20"
          }
        `}
      >
        <InputGroupAddon>
          <InputGroupButton>
            <SearchIcon
              className={`
                h-4 w-4 transition-colors
                ${open ? "text-primary" : "text-muted-foreground"}
              `}
            />
          </InputGroupButton>
        </InputGroupAddon>

        <InputGroupInput
          placeholder="What are you looking for? Ask AI"
          className="text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setOpen(true)}
        />
      </InputGroup>

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
              md:w-[40dvw]
              overflow-hidden
              rounded-b-2xl
              rounded-tr-2xl
              border
              border-t-0
              bg-background/95
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
                  <Link href="/products?preference=trending">Explore More</Link>
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
                          <Button key={cat.id} variant="ghost" asChild>
                            <Link href={`/categories/${cat.slug}`}>
                              {cat.name}
                            </Link>
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
                            height={48}
                            width={48}
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
    </div>
  );
}
