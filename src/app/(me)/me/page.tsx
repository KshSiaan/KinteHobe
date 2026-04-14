import { auth } from "@/lib/auth";

import { headers } from "next/headers";
import Image from "next/image";

export default async function Page() {
  const data = await auth?.api?.getSession({
    headers: await headers(),
  });
  const user = data?.user;
  return (
    <div className="h-fit w-full p-12 ">
      <section className="flex items-center">
        <div className="aspect-square size-[300px] bg-background rounded-lg p-6">
          <Image
            src={"https://api.dicebear.com/9.x/lorelei-neutral/svg?seed=Felix"}
            alt="User Avatar"
            fill
          />
        </div>
      </section>
    </div>
  );
}
