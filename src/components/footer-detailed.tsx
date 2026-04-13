"use client";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const footerLinks = [
  {
    title: "Product",
    links: ["Overview", "Pricing", "Integrations", "Documentation"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Brand", "Press"],
  },
  {
    title: "Resources",
    links: ["Blog", "Newsletter", "Support", "Guides"],
  },
  {
    title: "Social",
    links: ["Twitter", "GitHub", "LinkedIn", "YouTube"],
  },
];

export const DetailedFooter = () => {
  return (
    <footer className="w-full bg-background text-muted-foreground border-t ">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="size-8 rounded bg-foreground flex items-center justify-center">
                <span className="text-background font-bold text-xs">P</span>
              </div>
              <span className="text-foreground font-semibold tracking-tight">
                Platform
              </span>
            </div>
            <p className="text-sm text-pretty leading-relaxed mb-6">
              Building the next generation of creative tools for digital
              artisans.
            </p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex gap-4">
            <span className="text-xs">© 2026 Platform Inc.</span>
            <Link
              href="#"
              className="text-xs hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-xs hover:text-foreground transition-colors"
            >
              Privacy
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
            <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-foreground text-background size-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
              <ArrowRight />
            </Button>
          </form>
        </div>
      </div>
    </footer>
  );
};
