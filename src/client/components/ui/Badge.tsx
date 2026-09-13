import * as React from "react";

import { cn } from "@/client/lib/utils";
import type { Color } from "./_shared/variants";

export type BadgeVariant = "solid" | "soft" | "outline";

/** Static (non-interactive) variant×color classes for badges. */
const BADGE_CLASSES: Record<BadgeVariant, Record<Color, string>> = {
  solid: {
    neutral: "bg-ink text-paper",
    primary: "bg-accent text-accent-contrast",
    destructive: "bg-danger text-accent-contrast",
  },
  soft: {
    neutral: "bg-paper-dim text-ink-soft",
    primary: "bg-accent-soft text-accent-dark",
    destructive: "bg-danger-soft text-danger",
  },
  outline: {
    neutral: "border border-line text-ink",
    primary: "border border-accent/40 text-accent-dark",
    destructive: "border border-danger/30 text-danger",
  },
};

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** @default "soft" */
  variant?: BadgeVariant;
  /** @default "neutral" */
  color?: Color;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "soft", color = "neutral", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        BADGE_CLASSES[variant][color],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge };
