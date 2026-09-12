import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium tracking-wide transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-blood text-ink hover:bg-blood-bright border border-blood-bright/40 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]",
        secondary:
          "bg-panel-2 text-ink border border-hairline-strong hover:border-gold/50 hover:text-gold-soft",
        ghost: "text-ink-dim hover:text-ink hover:bg-panel-2",
        gold: "bg-gold text-void hover:bg-gold-soft font-semibold",
        outline: "border border-hairline-strong text-ink hover:border-ink-dim bg-transparent",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
