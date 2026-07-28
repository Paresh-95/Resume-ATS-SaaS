"use client";

import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { MobileNav } from "@/components/dashboard/mobile-nav";

function initials(name?: string | null, email?: string | null) {
  const source = name || email || "?";
  return source
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardTopbar() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/60 px-4 sm:px-6">
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <MobileNav />
        </SheetContent>
      </Sheet>

      <div className="hidden md:block" />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">
              {initials(session?.user?.name, session?.user?.email)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {session?.user?.name || "Account"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {session?.user?.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
