import BoxyLoader from "@/components/core/extra/boxy-loader";
import React from "react";

export default function Loading() {
  return (
    <div className="h-full w-full flex justify-center items-center">
      <BoxyLoader />
    </div>
  );
}
