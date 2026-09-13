export type Variant = "solid" | "outline" | "ghost" | "link" | "soft";
export type Color = "neutral" | "primary" | "destructive";

export const DEFAULT_VARIANT: Variant = "solid";
export const DEFAULT_COLOR: Color = "neutral";

/**
 * Base classes shared by Button and IconButton.
 * Ring width/offset live here; ring *color* lives per variant×color cell below
 * so tailwind-merge resolves to a single ring color.
 */
export const CONTROL_BASE =
  "inline-flex items-center justify-center whitespace-nowrap font-medium cursor-pointer " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed " +
  "[&_svg]:pointer-events-none [&_svg]:shrink-0";

/**
 * variant (style treatment) × color (intent) → Tailwind classes.
 * `solid` + `neutral` is the default black button.
 * Uses the default Tailwind palette — edit freely per project.
 */
export const VARIANT_COLOR: Record<Variant, Record<Color, string>> = {
  solid: {
    neutral:
      "bg-ink text-paper shadow hover:bg-ink/85 active:bg-ink/75 focus-visible:ring-ink/40",
    primary:
      "bg-accent text-accent-contrast shadow hover:bg-accent-dark active:bg-accent-dark focus-visible:ring-accent/50",
    destructive:
      "bg-danger text-accent-contrast shadow-sm hover:bg-danger/85 active:bg-danger/75 focus-visible:ring-danger/40",
  },
  outline: {
    neutral:
      "border border-line bg-surface text-ink shadow-sm hover:bg-paper-dim active:bg-paper-dim focus-visible:ring-ink/30",
    primary:
      "border border-accent/40 bg-surface text-accent-dark shadow-sm hover:bg-accent-soft/60 active:bg-accent-soft focus-visible:ring-accent/40",
    destructive:
      "border border-danger/30 bg-surface text-danger shadow-sm hover:bg-danger-soft active:bg-danger-soft focus-visible:ring-danger/40",
  },
  ghost: {
    neutral:
      "text-ink hover:bg-paper-dim active:bg-line-soft focus-visible:ring-ink/30",
    primary:
      "text-accent-dark hover:bg-accent-soft/50 active:bg-accent-soft focus-visible:ring-accent/40",
    destructive:
      "text-danger hover:bg-danger-soft active:bg-danger-soft focus-visible:ring-danger/40",
  },
  link: {
    neutral:
      "text-ink underline-offset-4 hover:underline focus-visible:ring-ink/30",
    primary:
      "text-accent-dark underline-offset-4 hover:underline focus-visible:ring-accent/40",
    destructive:
      "text-danger underline-offset-4 hover:underline focus-visible:ring-danger/40",
  },
  soft: {
    neutral:
      "bg-paper-dim text-ink shadow-sm hover:bg-line-soft active:bg-line focus-visible:ring-ink/30",
    primary:
      "bg-accent-soft text-accent-dark shadow-sm hover:bg-accent-soft/70 active:bg-accent-soft focus-visible:ring-accent/40",
    destructive:
      "bg-danger-soft text-danger shadow-sm hover:bg-danger-soft/70 active:bg-danger-soft focus-visible:ring-danger/40",
  },
};

export function variantColorClasses(variant: Variant, color: Color): string {
  return VARIANT_COLOR[variant][color];
}
