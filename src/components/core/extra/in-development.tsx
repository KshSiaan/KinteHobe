import React from "react";

export default function InDev() {
  return (
    <div className="absolute inset-0 bg-background/10 backdrop-blur-sm h-full w-full z-30 flex items-center justify-center">
      <div className="bg-card border shadow-lg p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-2">In Development</h2>
        <p className="text-muted-foreground">
          This feature is currently under development or will be available soon.
        </p>
      </div>
    </div>
  );
}
