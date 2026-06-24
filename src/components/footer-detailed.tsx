"use client";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const AppName = process.env.NEXT_PUBLIC_APP_NAME || "KinteHobe";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Integrations", href: "#" },
      { label: "Documentation", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Careers", href: "#" },
      { label: "Brand", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Newsletter", href: "#" },
      { label: "Support", href: "/me/support" },
      { label: "Guides", href: "#" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "Twitter", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "YouTube", href: "#" },
    ],
  },
];

export const DetailedFooter = () => {
  return (
    <footer className="w-full bg-background text-muted-foreground border-t">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="size-8 rounded bg-foreground flex items-center justify-center">
                <span className="text-background font-bold text-xs">
                  {AppName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-foreground font-semibold tracking-tight">
                {AppName}
              </span>
            </div>
            <p className="text-sm text-pretty leading-relaxed mb-6">
              Your all-in-one e-commerce platform for a seamless shopping
              experience.
            </p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex gap-4 flex-wrap">
            <span className="text-xs">
              © {new Date().getFullYear()} {AppName}. All rights reserved.
            </span>
            <Link
              href="/terms-of-service"
              className="text-xs hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy-policy"
              className="text-xs hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/cookie-policy"
              className="text-xs hover:text-foreground transition-colors"
            >
              Cookie Policy
            </Link>
          </div>

          <form
            className="w-full max-w-sm relative"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-muted border rounded-full px-4 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-foreground text-background size-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <ArrowRight className="size-4" />
              <span className="sr-only">Subscribe</span>
            </Button>
          </form>
        </div>
      </div>
    </footer>
  );
};
