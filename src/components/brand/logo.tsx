import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Icon-only brand mark: a soft "L" ribbon fold crossed by a light ray —
 * Light (ray) Textiles (fold). Kept as hand-authored SVG so it stays crisp
 * at every size, from a 16px favicon to print packaging.
 */
export function LogoMark({ className }: { className?: string }) {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Light Textiles"
      className={cn("h-9 w-9", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="6" y1="6" x2="40" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7cc4ff" />
          <stop offset="1" stopColor="#2f8ded" />
        </linearGradient>
      </defs>
      <path
        d="M15 9 V26 Q15 33 22 33 H35"
        stroke={`url(#${gradientId})`}
        strokeWidth={6.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M23.5 19 L32 10.5" stroke="#bfe3ff" strokeWidth={4.5} strokeLinecap="round" fill="none" />
    </svg>
  );
}
