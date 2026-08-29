import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@animateicons/react/lucide";
import Link from "next/link";

export default function PromotionBanner({
  selectedVariant,
  selectedAppearance,
  promotionTitle,
  promotionUrl,
}: {
  selectedVariant: string;
  selectedAppearance: string;
  promotionTitle: string;
  promotionUrl: string;
}) {
  return (
    <div
      className={cn(
        "p-3 flex items-center text-sm w-full",
        selectedVariant === "primary" && "bg-primary text-primary-foreground",
        selectedVariant === "secondary" &&
          "bg-secondary text-secondary-foreground",
        selectedVariant === "background" && "bg-background text-foreground",
        selectedVariant === "foreground" && "bg-foreground text-background",
        //appearance
        selectedAppearance === "a" && "justify-center",
        selectedAppearance === "b" && "justify-between",
        selectedAppearance === "c" &&
          "bg-linear-to-r from-purple-500 via-indigo-500 to-blue-500 text-background justify-between",
      )}
    >
      {selectedAppearance === "a" && (
        <Link href={promotionUrl ?? "#"} className="flex items-center">
          {promotionTitle || "Promotion Title Here"}
          <ArrowRightIcon className="size-4 ml-2" />
        </Link>
      )}
      {["b", "c"].includes(selectedAppearance) && (
        <>
          <span className="text-xs md:text-sm ">
            {promotionTitle || "Promotion Title Here"}
          </span>
          <Button variant="secondary" className="text-xs" size="xs" asChild>
            <Link href={promotionUrl ?? "#"}>
              Get Now <ArrowRightIcon className="" />
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}
