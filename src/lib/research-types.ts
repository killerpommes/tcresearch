export type Combination = readonly [string, string];

export type VersionData = {
  base_aspects: string[];
  combinations: Record<string, Combination>;
};

export type AddonData = {
  name: string;
  aspects: string[];
  combinations: Record<string, Combination>;
};
