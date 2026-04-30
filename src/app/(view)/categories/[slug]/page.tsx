import React, { Suspense } from "react";
import Category from "./category";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div>
      <main className="mb-24">
        <Suspense fallback={<div>Loading...</div>}>
          <Category slug={slug} />
        </Suspense>
      </main>
    </div>
  );
}
