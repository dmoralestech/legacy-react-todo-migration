import React from 'react';
import { useFeatureFlag } from '../utils/featureFlags';
import LegacyTodoList from './LegacyTodoList';
import ModernTodoList from './TodoList.tsx';

/**
 * TodoList Component Switcher
 * 
 * This component uses feature flags to switch between legacy (class-based) 
 * and modern (functional) implementations of TodoList.
 * 
 * Both implementations have identical APIs and behavior, allowing for
 * safe A/B testing and gradual rollout of modern components.
 */
const TodoList = (props) => {
  const useModernTodoList = useFeatureFlag('USE_MODERN_TODO_LIST');
  
  // Feature flag determines which implementation to render
  if (useModernTodoList) {
    return <ModernTodoList {...props} />;
  }
  
  return <LegacyTodoList {...props} />;
};

export default TodoList;