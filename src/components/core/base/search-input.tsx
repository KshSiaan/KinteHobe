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

export default function SearchInput() {
  const [open, setOpen] = useState(false);

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
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Quick Search
              </p>

              <div className="space-y-2">
                {[
                  "Macbook Pro M4",
                  "Gaming Mouse",
                  "Wireless Earbuds",
                  "Ask AI for recommendations",
                  "Find people with similar interests",
                ].map((item, i) => (
                  <motion.button
                    key={item}
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
                    <SearchIcon className="h-4 w-4 text-muted-foreground" />
                    {item}
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
