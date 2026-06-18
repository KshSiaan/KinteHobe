import React from "react";
import fs from "node:fs/promises";
export default async function page() {
  const res = await fs.readFile(`${process.cwd()}/ROUTING.md`, {
    encoding: "utf8",
  });
  return <div>{res}</div>;
}
