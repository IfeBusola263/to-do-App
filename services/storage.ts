import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types';

const TASKS_STORAGE_KEY = 'tasks';

export const getTasks = async (): Promise<Task[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    const tasks = jsonValue != null ? JSON.parse(jsonValue) : [];

    // Convert date strings back to Date objects
    return tasks.map((task: any) => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    }));
  } catch (e) {
    console.error('Error getting tasks from AsyncStorage', e);
    return [];
  }
};

export const saveTasks = async (tasks: Task[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving tasks to AsyncStorage', e);
  }
};