import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}
