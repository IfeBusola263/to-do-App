import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import '@testing-library/react-native/extend-expect';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

// Don't mock TaskContext globally - let individual tests mock it as needed
// jest.mock('../context/TaskContext', () => ({
//   useTaskContext: () => ({
//     toggleTask: jest.fn(),
//     deleteTask: jest.fn(),
//     addTask: jest.fn(),
//     tasks: [],
//     loadTasks: jest.fn(),
//   }),
// }));