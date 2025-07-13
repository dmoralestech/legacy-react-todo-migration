import React from 'react';
import { useFeatureFlag } from '../utils/featureFlags';
import LegacyTodoItem from './LegacyTodoItem';
import ModernTodoItem from './TodoItem.tsx';

/**
 * TodoItem Component Switcher
 * 
 * This component uses feature flags to switch between legacy (class-based) 
 * and modern (hooks-based) implementations of TodoItem.
 * 
 * Both implementations have identical APIs and behavior, allowing for
 * safe A/B testing and gradual rollout of modern components.
 */
const TodoItem = (props) => {
  const useModernTodoItem = useFeatureFlag('USE_MODERN_TODO_ITEM');
  
  // Feature flag determines which implementation to render
  if (useModernTodoItem) {
    return <ModernTodoItem {...props} />;
  }
  
  return <LegacyTodoItem {...props} />;
};

export default TodoItem;