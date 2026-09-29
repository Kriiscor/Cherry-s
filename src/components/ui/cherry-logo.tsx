import { cn } from "@/lib/utils";

type CherryLogoSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<CherryLogoSize, string> = {
  sm: "size-5",
  md: "size-7",
  lg: "size-10",
};

type CherryLogoProps = {
  size?: CherryLogoSize;
  className?: string;
};

/**
 * Cherry's application logo (TICK-024). Reusable SVG cherry icon with size
 * variants. Uses `currentColor` for the stem so it adapts to the parent
 * text-color in both light and dark modes, while the fruit uses fixed brand
 * colours (cherry-red + deep-green).
 */
export function CherryLogo({ size = "md", className }: CherryLogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn(SIZE_CLASSES[size], className)}
    >
      {/* Stem */}
      <path
        d="M16 6 C16 6 18 2 22 2"
        stroke="#2D6A2D"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left cherry stem */}
      <path
        d="M16 6 C14 8 10 8 9 13"
        stroke="#2D6A2D"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right cherry stem */}
      <path
        d="M16 6 C18 8 22 8 23 13"
        stroke="#2D6A2D"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left cherry */}
      <circle cx="9" cy="19" r="6" fill="#D72638" />
      <circle cx="7.5" cy="17" r="1.8" fill="#FF6B6B" opacity="0.5" />
      {/* Right cherry */}
      <circle cx="23" cy="19" r="6" fill="#C0392B" />
      <circle cx="21.5" cy="17" r="1.8" fill="#FF6B6B" opacity="0.4" />
      {/* Leaf */}
      <ellipse
        cx="19"
        cy="5"
        rx="3.5"
        ry="2"
        fill="#2D8A2D"
        transform="rotate(-30 19 5)"
      />
    </svg>
  );
}
