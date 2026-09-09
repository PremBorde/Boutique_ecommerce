import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 select-none relative overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold",
  {
    variants: {
      variant: {
        oxblood:
          "bg-oxblood text-ivory border border-oxblood hover:bg-oxblood-light hover:border-gold hover:shadow-[0_4px_20px_rgba(74,14,23,0.35)]",
        gold:
          "bg-gold text-noir font-semibold border border-gold hover:bg-gold-light hover:shadow-[0_4px_20px_rgba(201,160,80,0.35)]",
        outline:
          "border border-gold/40 text-noir bg-transparent hover:bg-gold/10 hover:border-gold",
        ghost:
          "text-noir hover:bg-gold/10 hover:text-oxblood",
        noir:
          "bg-noir text-ivory hover:bg-noir-charcoal border border-noir",
        link:
          "text-oxblood underline-offset-4 hover:underline normal-case tracking-normal p-0",
      },
      size: {
        default: "h-11 px-7 py-2.5",
        sm: "h-9 px-4 text-[10px]",
        lg: "h-13 px-10 py-3.5 text-sm tracking-[0.25em]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "oxblood",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
