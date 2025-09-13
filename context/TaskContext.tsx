import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Task } from '../types';
import { getTasks, saveTasks } from '../services/storage';

interface TaskContextType {
  tasks: Task[];
  addTask: (title: string, description?: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  loadTasks: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasksFromStorage = async () => {
    const storedTasks = await getTasks();
    if (storedTasks.length === 0) {
      const mockTasks: Task[] = [
        { id: '1', title: 'Buy groceries', description: 'Milk, eggs, bread', completed: false },
        { id: '2', title: 'Walk the dog', description: 'Take Fido to the park', completed: true },
        { id: '3', title: 'Finish project report', description: 'Due by Friday', completed: false },
      ];
      setTasks(mockTasks);
      saveTasks(mockTasks);
    } else {
      setTasks(storedTasks);
    }
  };

  useEffect(() => {
    loadTasksFromStorage();
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = (title: string, description?: string) => {
    const newTask: Task = {
      id: Date.now().toString(), // Simple unique ID
      title,
      description,
      completed: false,
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const contextValue: TaskContextType = {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    loadTasks: loadTasksFromStorage,
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