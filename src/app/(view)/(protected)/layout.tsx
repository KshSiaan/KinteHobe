import UnAuth from "@/components/core/extra/unauth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import React from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const header = await headers();
  const user = await auth.api.getSession({
    headers: header,
  });

  if (!user?.session.token) {
    return <UnAuth />;
  }
  return children;
}
