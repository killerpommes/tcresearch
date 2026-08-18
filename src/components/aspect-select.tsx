import { CaretDown } from "@phosphor-icons/react";
import { aspectImage, aspectName } from "../lib/research";

type AspectSelectProps = {
  id: string;
  label: string;
  value: string;
  aspects: string[];
  onChange: (value: string) => void;
};

export function AspectSelect({ id, label, value, aspects, onChange }: AspectSelectProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
      <span className="relative flex h-12 items-center rounded-md border border-[var(--border)] bg-[var(--input)] focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--ring)]">
        <img className="ml-3 size-8 object-contain" src={aspectImage(value)} alt="" />
        <span className="pointer-events-none ml-2 min-w-0">
          <span className="block truncate text-sm font-medium">{aspectName(value)}</span>
          <span className="block truncate text-xs text-[var(--muted-foreground)]">{value}</span>
        </span>
        <select
          id={id}
          className="absolute inset-0 cursor-pointer appearance-none opacity-0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {aspects.map((aspect) => (
            <option key={aspect} value={aspect}>
              {aspectName(aspect)} ({aspect})
            </option>
          ))}
        </select>
        <CaretDown className="pointer-events-none ml-auto mr-3 text-[var(--muted-foreground)]" size={16} weight="bold" />
      </span>
    </label>
  );
}
