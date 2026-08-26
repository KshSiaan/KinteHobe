import { Button } from "@/components/ui/button";
import React from "react";
import { ArrowRightIcon } from "@animateicons/react/lucide";
import Link from "next/link";
export default function Page() {
  return (
    <section className="w-full h-full">
      <div className="p-4 bg-accent flex justify-center items-center text-sm w-full text-center">
        <Link href="/admin/emails" className="flex items-center">
          ✨Introducing transactional and marketing emails{" "}
          <ArrowRightIcon className="size-4 ml-2" />
        </Link>
      </div>
    </section>
  );
}
