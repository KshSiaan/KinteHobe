import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sileo";
import { TooltipProvider } from "@/components/ui/tooltip";
import GodProvider from "@/provider/god-provider";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
const inter = Onest({
  weight: ["300", "400", "700", "100", "200", "500", "600", "800", "900"],
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
});

export const metadata: Metadata = {
  title: "KinteHobe",
  description: "Your all in One E commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.className)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<div>loading..</div>}>
            <GodProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </GodProvider>
          </Suspense>
        </ThemeProvider>
        <Toaster
          position="top-left"
          options={{
            fill: "#c2ff33",
          }}
        />
      </body>
    </html>
  );
}
