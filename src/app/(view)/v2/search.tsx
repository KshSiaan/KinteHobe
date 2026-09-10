"use client";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { MessageCircleIcon, StarsIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function SearchAI() {
  const [query, setQuery] = React.useState("");
  return (
    <>
      <InputGroup className="bg-background/20!">
        <InputGroupInput
          placeholder="Ask Khuki anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <InputGroupAddon>
          <MessageCircleIcon />
        </InputGroupAddon>
      </InputGroup>
      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        asChild
      >
        <Link href={`/khuki?q=${encodeURIComponent(query)}`}>
          <StarsIcon />
          Ask Khuki
        </Link>
      </Button>
    </>
  );
}
