import { v4 as uuidv4 } from 'uuid';

let mockTodos = [
  {
    id: '1',
    text: 'Learn React 16',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    text: 'Set up Redux with Saga',
    completed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    text: 'Build TODO app',
    completed: false,
    createdAt: new Date().toISOString()
  }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const simulateNetworkDelay = () => delay(500 + Math.random() * 1000);

const shouldSimulateError = () => Math.random() < 0.1;

export const todoApi = {
  fetchTodos: async () => {
    await simulateNetworkDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to fetch todos');
    }
    
    return [...mockTodos];
  },

  addTodo: async (todoData) => {
    await simulateNetworkDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to add todo');
    }
    
    const newTodo = {
      id: uuidv4(),
      text: todoData.text,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    mockTodos.push(newTodo);
    return newTodo;
  },

  updateTodo: async (id, updates) => {
    await simulateNetworkDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to update todo');
    }
    
    const todoIndex = mockTodos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      throw new Error('Todo not found');
    }
    
    const updatedTodo = {
      ...mockTodos[todoIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    mockTodos[todoIndex] = updatedTodo;
    return updatedTodo;
  },

  deleteTodo: async (id) => {
    await simulateNetworkDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to delete todo');
    }
    
    const todoIndex = mockTodos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      throw new Error('Todo not found');
    }
    
    mockTodos.splice(todoIndex, 1);
    return id;
  },

  toggleTodo: async (id) => {
    await simulateNetworkDelay();
    
    if (shouldSimulateError()) {
      throw new Error('Failed to toggle todo');
    }
    
    const todoIndex = mockTodos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      throw new Error('Todo not found');
    }
    
    const updatedTodo = {
      ...mockTodos[todoIndex],
      completed: !mockTodos[todoIndex].completed,
      updatedAt: new Date().toISOString()
    };
    
    mockTodos[todoIndex] = updatedTodo;
    return updatedTodo;
  }
};