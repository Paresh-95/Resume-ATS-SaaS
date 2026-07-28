import Image from "next/image";
import { cn } from "@/lib/utils";

// Intrinsic pixel dimensions of each cropped mascot pose, so next/image can
// size them without distortion at any target height.
const MASCOT_SIZES = {
  "ats-score": { w: 434, h: 453 },
  "resume-checked": { w: 411, h: 453 },
  "celebrate-jump": { w: 407, h: 453 },
  "wave-laptop": { w: 416, h: 411 },
  "review-magnify": { w: 395, h: 394 },
  "idea-lightbulb": { w: 392, h: 411 },
  "report-generated": { w: 312, h: 326 },
  "stars-laptop": { w: 329, h: 326 },
  "generation-complete": { w: 306, h: 326 },
  "love-hearts": { w: 301, h: 326 },
  "subscription-proplan": { w: 303, h: 343 },
  "relax-current-plan": { w: 320, h: 307 },
  "pro-plan-popular": { w: 268, h: 343 },
  "payment-successful": { w: 330, h: 340 },
  "next-renewal": { w: 325, h: 261 },
  "gift-unlock": { w: 274, h: 261 },
  "upgrade-to-pro": { w: 300, h: 261 },
  "meditating-zen": { w: 321, h: 261 },
} as const;

export type MascotPose = keyof typeof MASCOT_SIZES;

export function Mascot({
  pose,
  height = 96,
  className,
  priority,
}: {
  pose: MascotPose;
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  const { w, h } = MASCOT_SIZES[pose];
  return (
    <Image
      src={`/brand/mascot/mascot-${pose}.png`}
      alt=""
      width={Math.round(height * (w / h))}
      height={height}
      className={cn("shrink-0", className)}
      priority={priority}
    />
  );
}
