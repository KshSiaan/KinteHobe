import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function UnAuth() {
  return (
    <main className="flex-1 mx-auto py-12 container flex flex-col items-center justify-center gap-6">
      <Image src="/illust/unauth.png" alt="UnAuth" width={400} height={400} />

      <div className=""></div>
      <h1 className="text-2xl font-bold">
        It looks like you’re not logged in yet.
      </h1>
      <p className="text-muted-foreground">
        Please{" "}
        <Link
          href="/auth/login"
          className="text-primary hover:underline font-bold"
        >
          log in
        </Link>{" "}
        to continue. or go back to{" "}
        <Link href="/" className="text-primary hover:underline font-bold">
          home
        </Link>
        .
      </p>
    </main>
  );
}
