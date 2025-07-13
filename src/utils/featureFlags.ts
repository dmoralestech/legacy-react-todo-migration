import { FeatureFlagKey, FeatureFlagConfig, FeatureFlags } from '../types/featureFlags';

// Feature flag configuration - start with everything disabled for safety
const FEATURE_FLAG_CONFIG: FeatureFlags = {
  USE_MODERN_COMPONENTS: {
    enabled: false,
    rolloutPercentage: 0,
    description: 'Enable modern React functional components'
  },
  USE_JOTAI: {
    enabled: false,
    rolloutPercentage: 0,
    description: 'Enable Jotai atomic state management'
  },
  USE_TANSTACK_QUERY: {
    enabled: false,
    rolloutPercentage: 0,
    description: 'Enable TanStack Query for server state'
  },
  USE_TYPESCRIPT: {
    enabled: true, // We can enable this since we're adding it safely
    rolloutPercentage: 100,
    description: 'Enable TypeScript support'
  },
  USE_MODERN_TODO_ITEM: {
    enabled: false,
    rolloutPercentage: 0,
    description: 'Use modern TodoItem component'
  },
  USE_MODERN_TODO_FORM: {
    enabled: false,
    rolloutPercentage: 0,
    description: 'Use modern TodoForm component'
  },
  USE_MODERN_TODO_LIST: {
    enabled: false,
    rolloutPercentage: 0,
    description: 'Use modern TodoList component'
  },
  USE_MODERN_TODO_FILTERS: {
    enabled: false,
    rolloutPercentage: 0,
    description: 'Use modern TodoFilters component'
  }
};

// Environment variable overrides (for development)
const getEnvOverride = (key: FeatureFlagKey): boolean | undefined => {
  const envKey = `REACT_APP_${key}`;
  const envValue = process.env[envKey];
  if (envValue === 'true') return true;
  if (envValue === 'false') return false;
  return undefined;
};

// Main feature flag checker
export const useFeatureFlag = (flagKey: FeatureFlagKey): boolean => {
  // Check environment override first
  const envOverride = getEnvOverride(flagKey);
  if (envOverride !== undefined) {
    return envOverride;
  }

  // Use configuration
  const config = FEATURE_FLAG_CONFIG[flagKey];
  if (!config || !config.enabled) {
    return false;
  }

  // Simple rollout percentage check
  if (config.rolloutPercentage >= 100) {
    return true;
  }

  if (config.rolloutPercentage <= 0) {
    return false;
  }

  // For demo purposes, use a simple hash-based rollout
  // In production, you'd want user-based consistent rollouts
  const hash = Math.abs(flagKey.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0));
  
  return (hash % 100) < config.rolloutPercentage;
};

// Helper to get all feature flag states (for debugging)
export const getAllFeatureFlags = (): Record<FeatureFlagKey, boolean> => {
  const result = {} as Record<FeatureFlagKey, boolean>;
  Object.keys(FEATURE_FLAG_CONFIG).forEach(key => {
    result[key as FeatureFlagKey] = useFeatureFlag(key as FeatureFlagKey);
  });
  return result;
};

// Helper to toggle a feature flag (for development)
export const toggleFeatureFlag = (flagKey: FeatureFlagKey): void => {
  FEATURE_FLAG_CONFIG[flagKey].enabled = !FEATURE_FLAG_CONFIG[flagKey].enabled;
  console.log(`Feature flag ${flagKey} toggled to:`, FEATURE_FLAG_CONFIG[flagKey].enabled);
};

// Helper to enable a feature flag programmatically
export const enableFeatureFlag = (flagKey: FeatureFlagKey, rolloutPercentage: number = 100): void => {
  FEATURE_FLAG_CONFIG[flagKey].enabled = true;
  FEATURE_FLAG_CONFIG[flagKey].rolloutPercentage = rolloutPercentage;
  console.log(`Feature flag ${flagKey} enabled with ${rolloutPercentage}% rollout`);
};

// Helper to disable a feature flag programmatically
export const disableFeatureFlag = (flagKey: FeatureFlagKey): void => {
  FEATURE_FLAG_CONFIG[flagKey].enabled = false;
  FEATURE_FLAG_CONFIG[flagKey].rolloutPercentage = 0;
  console.log(`Feature flag ${flagKey} disabled`);
};