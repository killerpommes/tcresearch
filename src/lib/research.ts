import { addonDictionary } from "../data/addon-dictionary";
import { translations } from "../data/translations";
import { versionDictionary } from "../data/version-dictionary";
import type { AddonData, Combination, VersionData } from "./research-types";

export type ResearchData = {
  allAspects: string[];
  coreAspects: string[];
  addonAspects: string[];
  combinations: Record<string, Combination>;
};

export const versions: Record<string, VersionData> = versionDictionary;
export const addons: Record<string, AddonData> = addonDictionary;

export const defaultVersion = versions["4.2.2.0"] ? "4.2.2.0" : Object.keys(versions)[0];

export function aspectName(aspect: string) {
  const name = translations[aspect] ?? aspect;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function aspectImage(aspect: string, colored = true) {
  const style = colored ? "color" : "mono";
  return `./${style}/${translations[aspect] ?? aspect}.png`;
}

export function createResearchData(version: string): ResearchData {
  const versionData = versions[version];
  const combinations: Record<string, Combination> = { ...versionData.combinations };
  const addonAspects: string[] = [];

  Object.values(addons).forEach((addon) => {
    addonAspects.push(...addon.aspects);
    Object.assign(combinations, addon.combinations);
  });

  const coreAspects = [...new Set([...versionData.base_aspects, ...Object.keys(versionData.combinations)])];
  const allAspects = [...new Set([...coreAspects, ...addonAspects])].sort((a, b) =>
    aspectName(a).localeCompare(aspectName(b)),
  );

  return {
    allAspects,
    coreAspects,
    addonAspects: [...new Set(addonAspects)],
    combinations,
  };
}

type SearchState = {
  path: string[];
  cost: number;
};

class MinHeap {
  private values: SearchState[] = [];

  get size() {
    return this.values.length;
  }

  push(value: SearchState) {
    this.values.push(value);
    let index = this.values.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.values[parent].cost <= value.cost) break;
      this.values[index] = this.values[parent];
      index = parent;
    }
    this.values[index] = value;
  }

  pop() {
    const first = this.values[0];
    const last = this.values.pop();
    if (!first || !last || this.values.length === 0) return first;

    let index = 0;
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      if (left >= this.values.length) break;
      const child = right < this.values.length && this.values[right].cost < this.values[left].cost ? right : left;
      if (this.values[child].cost >= last.cost) break;
      this.values[index] = this.values[child];
      index = child;
    }
    this.values[index] = last;
    return first;
  }
}

export function findConnection(
  from: string,
  to: string,
  minimumSteps: number,
  combinations: Record<string, Combination>,
  available: Set<string>,
) {
  const graph = new Map<string, Set<string>>();
  const connect = (left: string, right: string) => {
    if (!graph.has(left)) graph.set(left, new Set());
    graph.get(left)?.add(right);
  };

  Object.entries(combinations).forEach(([compound, [left, right]]) => {
    connect(compound, left);
    connect(left, compound);
    connect(compound, right);
    connect(right, compound);
  });

  const queue = new MinHeap();
  const bestCost = new Map<string, number>();
  const maxDepth = Math.min(minimumSteps + graph.size + 2, 240);
  queue.push({ path: [from], cost: 0 });

  while (queue.size > 0) {
    const current = queue.pop();
    if (!current) break;
    const node = current.path[current.path.length - 1];
    const depth = current.path.length;
    const stateKey = `${node}:${depth}`;
    if ((bestCost.get(stateKey) ?? Number.POSITIVE_INFINITY) <= current.cost) continue;
    bestCost.set(stateKey, current.cost);

    if (node === to && depth > minimumSteps + 1) return current.path;
    if (depth >= maxDepth) continue;

    graph.get(node)?.forEach((next) => {
      queue.push({
        path: [...current.path, next],
        cost: current.cost + (available.has(next) ? 1 : 100),
      });
    });
  }

  return null;
}
