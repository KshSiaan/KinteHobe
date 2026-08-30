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

  const { data } = useQuery({
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

  console.log("search data", data);

  return (
    <div
      ref={containerRef}
      className="relative hidden w-[30dvw] md:flex gap-2 "
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
              w-[40dvw]
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
                  <Link href="/search">Explore More</Link>
                </Button>
              </div>

              <div className="space-y-2">
                {data?.data?.map((item, i) => (
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
                        src={item?.publicImages[0] || "/images/placeholder.png"}
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
