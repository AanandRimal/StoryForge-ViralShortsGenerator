import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[5px] px-[0.45rem] py-[0.18rem] text-[0.68rem] font-bold uppercase tracking-[0.04em] transition-colors",
  {
    variants: {
      variant: {
        default:    "bg-[var(--accent-purple-deep)] text-[var(--accent-purple-mid)] border border-[rgba(124,90,246,0.2)]",
        secondary:  "bg-white/6 text-[var(--text-muted)] border border-white/8",
        success:    "bg-[var(--color-success-bg)] text-[var(--color-success)]",
        warning:    "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
        danger:     "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
        info:       "bg-[var(--color-info-bg)] text-[var(--color-info)]",
        outline:    "border border-white/10 text-[var(--text-muted)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
