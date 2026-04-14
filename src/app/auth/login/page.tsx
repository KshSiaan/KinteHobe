import React from "react";
import { LoginForm } from "./login-form";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  return (
    <main className="h-dvh w-full grid grid-cols-2">
      <div
        className="h-full bg-secondary relative p-2 bg-cover bg-bottom"
        style={{
          backgroundImage: `url('/img/login.jpg')`,
        }}
      >
        <Button variant={"outline"} asChild>
          <Link href={"/"}>
            <ArrowLeft /> Go Home
          </Link>
        </Button>
      </div>
      <section className="h-full flex justify-center items-center">
        <div className="w-full px-12">
          <Image
            src={"/img/icon.svg"}
            height={64}
            width={64}
            alt="icon"
            className="size-12 mx-auto"
          />
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
