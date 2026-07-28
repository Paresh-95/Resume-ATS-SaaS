"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteNavbar() {
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {status === "authenticated" ? (
            <Link href="/dashboard" className={buttonVariants()}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                Log in
              </Link>
              <Link href="/register" className={buttonVariants()}>
                Get started free
              </Link>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="md:hidden" />}
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="mt-10 flex flex-col gap-6 px-4">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="text-base font-medium">
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                {status === "authenticated" ? (
                  <Link href="/dashboard" className={buttonVariants()}>
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className={buttonVariants({ variant: "outline" })}>
                      Log in
                    </Link>
                    <Link href="/register" className={buttonVariants()}>
                      Get started free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
