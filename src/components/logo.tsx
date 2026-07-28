import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Source mark is 581x464 (~1.252:1) — keep that ratio so Next/Image doesn't stretch it.
const MARK_ASPECT = 581 / 464;

export function Logo({
  href = "/",
  size = 32,
  className,
  wordmarkClassName,
}: {
  href?: string;
  size?: number;
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 font-heading font-semibold tracking-tight", className)}
    >
      <Image
        src="/brand/logo-mark.png"
        alt="SignalCV"
        width={Math.round(size * MARK_ASPECT)}
        height={size}
        className="shrink-0"
        priority
      />
      <span className={cn("text-lg", wordmarkClassName)}>SignalCV</span>
    </Link>
  );
}
