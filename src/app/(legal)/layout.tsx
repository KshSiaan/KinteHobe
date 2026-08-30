import { Button } from "@/components/ui/button";
import { ChevronLeft } from "@animateicons/react/lucide";
import Link from "next/link";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Button
        className="fixed top-6 left-6 rounded-full"
        variant="outline"
        asChild
      >
        <Link href="/">
          <ChevronLeft /> Go Home
        </Link>
      </Button>{" "}
      {children}
    </>
  );
}
