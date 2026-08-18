import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
};

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-45 active:translate-y-px",
        variant === "default" && "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]",
        variant === "outline" && "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)]",
        variant === "ghost" && "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
        size === "default" && "h-10 px-4",
        size === "sm" && "h-8 px-3 text-xs",
        size === "icon" && "size-10",
        className,
      )}
      {...props}
    />
  );
}
