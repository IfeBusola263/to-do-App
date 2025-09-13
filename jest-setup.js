import '@testing-library/react-native/extend-expect';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('../context/TaskContext', () => ({
  useTaskContext: () => ({
    toggleTask: jest.fn(),
    deleteTask: jest.fn(),
    addTask: jest.fn(),
    tasks: [],
    loadTasks: jest.fn(),
  }),
}));