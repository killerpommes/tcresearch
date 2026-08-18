import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowsLeftRight,
  Check,
  MagnifyingGlass,
  MagicWand,
  X,
} from "@phosphor-icons/react";
import { AspectSelect } from "./components/aspect-select";
import { AspectToken } from "./components/aspect-token";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import {
  addons,
  aspectImage,
  aspectName,
  createResearchData,
  defaultVersion,
  findConnection,
  versions,
} from "./lib/research";

type Result = {
  path: string[] | null;
  message?: string;
};

function App() {
  const [version, setVersion] = useState(defaultVersion);
  const data = useMemo(() => createResearchData(version), [version]);
  const [from, setFrom] = useState("air");
  const [to, setTo] = useState("air");
  const [minimumSteps, setMinimumSteps] = useState(1);
  const [available, setAvailable] = useState<Set<string>>(() => new Set(data.coreAspects));
  const [query, setQuery] = useState("");
  const [previewAspect, setPreviewAspect] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const visibleAspects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return data.allAspects;
    return data.allAspects.filter(
      (aspect) =>
        aspect.includes(normalizedQuery) || aspectName(aspect).toLowerCase().includes(normalizedQuery),
    );
  }, [data.allAspects, query]);

  const usedAspects = useMemo(() => {
    const counts = new Map<string, number>();
    result?.path?.slice(1, -1).forEach((aspect) => counts.set(aspect, (counts.get(aspect) ?? 0) + 1));
    return [...counts.entries()];
  }, [result]);

  const updateVersion = (nextVersion: string) => {
    const nextData = createResearchData(nextVersion);
    setVersion(nextVersion);
    setAvailable(new Set(nextData.coreAspects));
    setFrom(nextData.allAspects.includes("air") ? "air" : nextData.allAspects[0]);
    setTo(nextData.allAspects.includes("air") ? "air" : nextData.allAspects[0]);
    setPreviewAspect(null);
    setResult(null);
  };

  const updateAvailability = (next: Set<string>) => {
    setAvailable(next);
    setResult(null);
  };

  const toggleAspect = (aspect: string) => {
    const next = new Set(available);
    if (next.has(aspect)) next.delete(aspect);
    else next.add(aspect);
    updateAvailability(next);
  };

  const toggleAddon = (addonId: string, enabled: boolean) => {
    const next = new Set(available);
    addons[addonId].aspects.forEach((aspect) => {
      if (enabled) next.add(aspect);
      else next.delete(aspect);
    });
    updateAvailability(next);
  };

  const runSearch = () => {
    const path = findConnection(from, to, minimumSteps, data.combinations, available);
    setResult(
      path
        ? { path }
        : {
            path: null,
            message: "No connection could be found with this version and step count.",
          },
    );
  };

  const previewRecipe = previewAspect ? data.combinations[previewAspect] : undefined;

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid size-10 place-items-center rounded-md border border-[var(--border)] bg-[var(--surface)]">
            <img className="size-7 object-contain" src={aspectImage("magic")} alt="" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight sm:text-lg">Thaumcraft Research Helper</h1>
            <p className="text-xs text-[var(--muted-foreground)]">Aspect pathfinder for Thaumcraft 4.x and 5.x</p>
          </div>
          <Badge className="ml-auto hidden sm:inline-flex">Community tool</Badge>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-8 lg:py-8">
        <aside className="h-fit rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 lg:sticky lg:top-6">
          <div className="mb-5">
            <h2 className="text-sm font-semibold">Connection setup</h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">
              Choose two aspects and the blank spaces between them.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block" htmlFor="version">
              <span className="mb-2 block text-xs font-medium text-[var(--muted-foreground)]">Version</span>
              <span className="relative block">
                <select
                  id="version"
                  className="h-10 w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--input)] px-3 pr-8 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]"
                  value={version}
                  onChange={(event) => updateVersion(event.target.value)}
                >
                  {Object.keys(versions).map((versionNumber) => (
                    <option key={versionNumber} value={versionNumber}>
                      Thaumcraft {versionNumber}
                    </option>
                  ))}
                </select>
                <ArrowDown
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                  size={14}
                />
              </span>
            </label>

            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 lg:grid-cols-1">
              <AspectSelect id="from" label="From" value={from} aspects={data.allAspects} onChange={setFrom} />
              <Button
                className="mb-1 lg:mx-auto lg:-my-1"
                variant="ghost"
                size="icon"
                aria-label="Swap from and to aspects"
                title="Swap aspects"
                onClick={() => {
                  setFrom(to);
                  setTo(from);
                  setResult(null);
                }}
              >
                <ArrowsLeftRight className="lg:rotate-90" size={18} />
              </Button>
              <AspectSelect id="to" label="To" value={to} aspects={data.allAspects} onChange={setTo} />
            </div>

            <label className="block" htmlFor="steps">
              <span className="mb-2 block text-xs font-medium text-[var(--muted-foreground)]">Minimum steps</span>
              <Input
                id="steps"
                type="number"
                min={1}
                max={99}
                value={minimumSteps}
                onChange={(event) => {
                  const value = Math.min(99, Math.max(1, Number(event.target.value) || 1));
                  setMinimumSteps(value);
                  setResult(null);
                }}
              />
            </label>

            <Button className="w-full" onClick={runSearch}>
              <MagicWand size={17} weight="bold" />
              Find connection
            </Button>
          </div>

          <div className="my-5 h-px bg-[var(--border)]" />

          <fieldset>
            <legend className="text-xs font-medium text-[var(--muted-foreground)]">Addon aspects</legend>
            <div className="mt-3 space-y-2.5">
              {Object.entries(addons).map(([addonId, addon]) => {
                const enabled = addon.aspects.every((aspect) => available.has(aspect));
                return (
                  <label key={addonId} className="flex cursor-pointer items-center gap-2.5 text-sm">
                    <span className="relative grid size-4 place-items-center">
                      <input
                        className="peer size-4 appearance-none rounded border border-[var(--border-strong)] bg-[var(--input)] checked:border-[var(--primary)] checked:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                        type="checkbox"
                        checked={enabled}
                        onChange={(event) => toggleAddon(addonId, event.target.checked)}
                      />
                      <Check
                        className="pointer-events-none absolute hidden text-[var(--primary-foreground)] peer-checked:block"
                        size={11}
                        weight="bold"
                      />
                    </span>
                    <span>{addon.name}</span>
                    <span className="ml-auto text-xs tabular-nums text-[var(--muted-foreground)]">
                      {addon.aspects.length}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </aside>

        <div className="min-w-0 space-y-8">
          <section aria-labelledby="result-heading">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <h2 id="result-heading" className="text-lg font-semibold tracking-tight">
                  Connection
                </h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  The shortest route prioritizing your available aspects.
                </p>
              </div>
              {result && (
                <Button variant="ghost" size="sm" onClick={() => setResult(null)}>
                  <X size={14} />
                  Clear
                </Button>
              )}
            </div>

            {!result && (
              <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-[var(--border-strong)] px-6 text-center">
                <div>
                  <MagicWand className="mx-auto mb-3 text-[var(--primary)]" size={24} />
                  <p className="text-sm font-medium">Ready to trace a path</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">Set your aspects, then find a connection.</p>
                </div>
              </div>
            )}

            {result?.message && (
              <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-muted)] px-4 py-5 text-sm text-[var(--danger)]">
                {result.message}
              </div>
            )}

            {result?.path && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
                <div className="flex items-center gap-2 overflow-x-auto pb-3">
                  {result.path.map((aspect, index) => (
                    <div className="flex shrink-0 items-center gap-2" key={`${aspect}-${index}`}>
                      <div className="min-w-32 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5">
                        <AspectToken aspect={aspect} active={available.has(aspect)} compact />
                      </div>
                      {index < result.path!.length - 1 && (
                        <ArrowRight className="text-[var(--muted-foreground)]" size={16} aria-hidden="true" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
                  <span className="mr-1 text-xs font-medium text-[var(--muted-foreground)]">
                    {result.path.length - 2} steps
                  </span>
                  {usedAspects.map(([aspect, count]) => (
                    <Badge key={aspect} className="gap-1.5">
                      <img className="size-4" src={aspectImage(aspect)} alt="" />
                      {aspectName(aspect)}{count > 1 ? ` ×${count}` : ""}
                    </Badge>
                  ))}
                  {result.path.some((aspect) => !available.has(aspect)) && (
                    <Badge className="border-[var(--warning-border)] text-[var(--warning)]">Uses unavailable aspects</Badge>
                  )}
                </div>
              </div>
            )}
          </section>

          <section aria-labelledby="aspects-heading">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="aspects-heading" className="text-lg font-semibold tracking-tight">
                    Available aspects
                  </h2>
                  <Badge>{available.size} / {data.allAspects.length}</Badge>
                </div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Disable rare aspects to make the pathfinder avoid them.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => updateAvailability(new Set(data.allAspects))}>
                  Select all
                </Button>
                <Button variant="outline" size="sm" onClick={() => updateAvailability(new Set(data.coreAspects))}>
                  Core only
                </Button>
                <Button variant="ghost" size="sm" onClick={() => updateAvailability(new Set())}>
                  Clear
                </Button>
              </div>
            </div>

            <div className="relative mb-3 max-w-sm">
              <MagnifyingGlass
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                size={16}
              />
              <Input
                className="pl-9"
                type="search"
                placeholder="Search aspects"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="mb-3 min-h-14 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              {previewAspect && previewRecipe ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <AspectToken aspect={previewRecipe[0]} compact />
                  <span className="text-[var(--muted-foreground)]">+</span>
                  <AspectToken aspect={previewRecipe[1]} compact />
                  <span className="text-[var(--muted-foreground)]">=</span>
                  <AspectToken aspect={previewAspect} compact />
                </div>
              ) : (
                <p className="py-2 text-xs text-[var(--muted-foreground)]">
                  Focus or hover over a compound aspect to preview its recipe.
                </p>
              )}
            </div>

            {visibleAspects.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                {visibleAspects.map((aspect) => (
                  <AspectToken
                    key={aspect}
                    aspect={aspect}
                    active={available.has(aspect)}
                    onClick={() => toggleAspect(aspect)}
                    onFocus={() => setPreviewAspect(aspect)}
                    onMouseEnter={() => setPreviewAspect(aspect)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border-strong)] px-4 py-12 text-center">
                <p className="text-sm font-medium">No matching aspects</p>
                <Button className="mt-3" variant="ghost" size="sm" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              </div>
            )}
          </section>

          <section className="border-t border-[var(--border)] pt-6 text-sm text-[var(--muted-foreground)]">
            <details>
              <summary className="cursor-pointer font-medium text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                How to use this helper
              </summary>
              <div className="mt-3 max-w-3xl space-y-3 leading-relaxed">
                <p>
                  Match the From and To fields to the fixed aspects on your research note. Set Minimum steps to the
                  number of blank spaces between them, then select Find connection.
                </p>
                <p>
                  If a result uses an aspect you cannot craft, disable it in the library and search again. When no fully
                  available route exists, the helper returns the route using the fewest unavailable aspects.
                </p>
              </div>
            </details>
          </section>
        </div>
      </main>

      <footer className="border-t border-[var(--border)] px-4 py-5 text-center text-xs text-[var(--muted-foreground)]">
        <p>
          Licensed under{" "}
          <a className="underline underline-offset-4 hover:text-[var(--foreground)]" href="https://creativecommons.org/licenses/by/4.0/">
            CC BY 4.0
          </a>
          . Source on{" "}
          <a className="underline underline-offset-4 hover:text-[var(--foreground)]" href="https://github.com/killerpommes/tcresearch">
            GitHub
          </a>
          . Original project by ythri.
        </p>
      </footer>
    </div>
  );
}

export default App;
