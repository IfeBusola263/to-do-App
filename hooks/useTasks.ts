import { useTaskContext } from '../context/TaskContext';

export const useTasks = () => {
  const context = useTaskContext();
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};