import React from 'react';
import { useFeatureFlag } from '../utils/featureFlags';
import LegacyTodoForm from './LegacyTodoForm';
import ModernTodoForm from './TodoForm.tsx';

/**
 * TodoForm Component Switcher
 * 
 * This component uses feature flags to switch between legacy (class-based) 
 * and modern (hooks-based) implementations of TodoForm.
 * 
 * Both implementations have identical APIs and behavior, allowing for
 * safe A/B testing and gradual rollout of modern components.
 */
const TodoForm = (props) => {
  const useModernTodoForm = useFeatureFlag('USE_MODERN_TODO_FORM');
  
  // Feature flag determines which implementation to render
  if (useModernTodoForm) {
    return <ModernTodoForm {...props} />;
  }
  
  return <LegacyTodoForm {...props} />;
};

export default TodoForm;