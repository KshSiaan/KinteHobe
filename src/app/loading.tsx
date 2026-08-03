import BoxyLoader from "@/components/core/extra/boxy-loader";
import React from "react";

export default function Loading() {
  return (
    <div className="m-auto w-full flex justify-center items-center max-h-dvh">
      <BoxyLoader />
    </div>
  );
}
