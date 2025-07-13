import React from 'react';
import { useFeatureFlag } from '../utils/featureFlags';
import LegacyTodoFilters from './LegacyTodoFilters';
import ModernTodoFilters from './TodoFilters.tsx';

/**
 * TodoFilters Component Switcher
 * 
 * This component uses feature flags to switch between legacy (class-based) 
 * and modern (functional) implementations of TodoFilters.
 * 
 * Both implementations have identical APIs and behavior, allowing for
 * safe A/B testing and gradual rollout of modern components.
 */
const TodoFilters = (props) => {
  const useModernTodoFilters = useFeatureFlag('USE_MODERN_TODO_FILTERS');
  
  // Feature flag determines which implementation to render
  if (useModernTodoFilters) {
    return <ModernTodoFilters {...props} />;
  }
  
  return <LegacyTodoFilters {...props} />;
};

export default TodoFilters;