import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { getTasks, saveTasks } from '../services/storage';
import { Task } from '../types';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (title: string, description?: string) => Promise<void>;
  updateTask: (id: string, title: string, description?: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  loadTasks: () => Promise<void>;
  clearError: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: unknown, defaultMessage: string) => {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    setError(errorMessage);
    console.error(errorMessage, error);
    Alert.alert('Error', errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadTasksFromStorage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const storedTasks = await getTasks();
      if (storedTasks.length === 0) {
        const mockTasks: Task[] = [
          { id: '1', title: 'Buy groceries', description: 'Milk, eggs, bread', completed: false },
          { id: '2', title: 'Walk the dog', description: 'Take Fido to the park', completed: true },
          { id: '3', title: 'Finish project report', description: 'Due by Friday', completed: false },
        ];
        setTasks(mockTasks);
        await saveTasks(mockTasks);
      } else {
        setTasks(storedTasks);
      }
    } catch (error) {
      handleError(error, 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    loadTasksFromStorage();
  }, [loadTasksFromStorage]);

  const saveTasksToStorage = useCallback(async (updatedTasks: Task[]) => {
    try {
      await saveTasks(updatedTasks);
    } catch (error) {
      handleError(error, 'Failed to save tasks');
      throw error; // Re-throw to allow component to handle
    }
  }, [handleError]);

  const addTask = useCallback(async (title: string, description?: string) => {
    try {
      setError(null);
      const newTask: Task = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description?.trim() || undefined,
        completed: false,
      };

      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      await saveTasksToStorage(updatedTasks);
    } catch (error) {
      // Revert optimistic update
      setTasks(tasks);
      handleError(error, 'Failed to add task');
      throw error;
    }
  }, [tasks, saveTasksToStorage, handleError]);

  const updateTask = useCallback(async (id: string, title: string, description?: string) => {
    try {
      setError(null);
      const updatedTasks = tasks.map((task) =>
        task.id === id
          ? { ...task, title: title.trim(), description: description?.trim() || undefined }
          : task
      );

      // Optimistic update
      setTasks(updatedTasks);
      await saveTasksToStorage(updatedTasks);
    } catch (error) {
      // Revert optimistic update
      setTasks(tasks);
      handleError(error, 'Failed to update task');
      throw error;
    }
  }, [tasks, saveTasksToStorage, handleError]);

  const toggleTask = useCallback(async (id: string) => {
    try {
      setError(null);
      const updatedTasks = tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );

      // Optimistic update
      setTasks(updatedTasks);
      await saveTasksToStorage(updatedTasks);
    } catch (error) {
      // Revert optimistic update
      setTasks(tasks);
      handleError(error, 'Failed to update task');
    }
  }, [tasks, saveTasksToStorage, handleError]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      setError(null);
      const taskToDelete = tasks.find(task => task.id === id);
      const updatedTasks = tasks.filter((task) => task.id !== id);

      // Optimistic update
      setTasks(updatedTasks);
      await saveTasksToStorage(updatedTasks);
    } catch (error) {
      // Revert optimistic update
      setTasks(tasks);
      handleError(error, 'Failed to delete task');
    }
  }, [tasks, saveTasksToStorage, handleError]);

  const contextValue: TaskContextType = {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    loadTasks: loadTasksFromStorage,
    clearError,
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};