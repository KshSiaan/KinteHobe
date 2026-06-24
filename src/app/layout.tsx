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

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "KinteHobe";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kintehobe.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: `%s — ${APP_NAME}`,
  },
  description:
    "Your all-in-one e-commerce platform for a seamless shopping experience.",
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description:
      "Your all-in-one e-commerce platform for a seamless shopping experience.",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description:
      "Your all-in-one e-commerce platform for a seamless shopping experience.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
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
