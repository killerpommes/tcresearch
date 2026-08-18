import { aspectImage, aspectName } from "../lib/research";
import { cn } from "../lib/utils";

type AspectTokenProps = {
  aspect: string;
  active?: boolean;
  compact?: boolean;
  onClick?: () => void;
  onFocus?: () => void;
  onMouseEnter?: () => void;
};

export function AspectToken({
  aspect,
  active = true,
  compact = false,
  onClick,
  onFocus,
  onMouseEnter,
}: AspectTokenProps) {
  const content = (
    <>
      <img
        className={cn("shrink-0 object-contain", compact ? "size-8" : "size-10")}
        src={aspectImage(aspect, active)}
        alt=""
      />
      <span className="min-w-0 text-left">
        <span className="block truncate text-sm font-medium text-[var(--foreground)]">{aspectName(aspect)}</span>
        <span className="block truncate text-xs text-[var(--muted-foreground)]">{aspect}</span>
      </span>
    </>
  );

  if (!onClick) {
    return <div className={cn("flex items-center gap-2", !active && "opacity-45")}>{content}</div>;
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "flex w-full items-center gap-2 rounded-md border px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:translate-y-px",
        active
          ? "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
          : "border-transparent bg-[var(--muted)] opacity-50 hover:opacity-70",
      )}
      onClick={onClick}
      onFocus={onFocus}
      onMouseEnter={onMouseEnter}
    >
      {content}
    </button>
  );
}
