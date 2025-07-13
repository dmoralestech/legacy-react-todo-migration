export type FeatureFlagKey =
  | "USE_MODERN_COMPONENTS"
  | "USE_JOTAI"
  | "USE_TANSTACK_QUERY"
  | "USE_TYPESCRIPT"
  | "USE_MODERN_TODO_ITEM"
  | "USE_MODERN_TODO_FORM"
  | "USE_MODERN_TODO_LIST"
  | "USE_MODERN_TODO_FILTERS";

export interface FeatureFlagConfig {
  enabled: boolean;
  rolloutPercentage: number;
  description: string;
}

export type FeatureFlags = {
  [K in FeatureFlagKey]: FeatureFlagConfig;
};
