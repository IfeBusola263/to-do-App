import { Task } from '../types';

// Define Jest mock function type for better type safety
type MockFn = jest.Mock;

// Mock data generators
export const createMockTask = (overrides: Partial<Task> = {}): Task => ({
    id: Date.now().toString(),
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    ...overrides,
});

export const createMockTasks = (count: number = 3): Task[] => {
    return Array.from({ length: count }, (_, index) =>
        createMockTask({
            id: (index + 1).toString(),
            title: `Task ${index + 1}`,
            description: `Description for task ${index + 1}`,
            completed: index % 2 === 0,
        })
    );
};

// Test data sets
export const testTasks = {
    empty: [] as Task[],
    single: [createMockTask({ id: '1', title: 'Single Task' })],
    multiple: createMockTasks(5),
    allCompleted: createMockTasks(3).map(task => ({ ...task, completed: true })),
    allIncomplete: createMockTasks(3).map(task => ({ ...task, completed: false })),
    mixed: [
        createMockTask({ id: '1', title: 'Completed Task', completed: true }),
        createMockTask({ id: '2', title: 'Incomplete Task', completed: false }),
        createMockTask({ id: '3', title: 'Another Completed Task', completed: true }),
    ],
};

// Mock context factory
export const createMockTaskContext = (overrides: Partial<any> = {}) => ({
    tasks: testTasks.multiple,
    addTask: jest.fn() as MockFn,
    toggleTask: jest.fn() as MockFn,
    deleteTask: jest.fn() as MockFn,
    loadTasks: jest.fn() as MockFn,
    loading: false,
    error: null,
    ...overrides,
});

// Mock router factory
export const createMockRouter = (overrides: Partial<any> = {}) => ({
    push: jest.fn() as MockFn,
    back: jest.fn() as MockFn,
    replace: jest.fn() as MockFn,
    canGoBack: jest.fn(() => true) as MockFn,
    ...overrides,
});

// Common test props
export const commonProps = {
    task: createMockTask(),
    router: createMockRouter(),
    context: createMockTaskContext(),
};

// Test validation helpers
export const validationTestCases = {
    validTitles: [
        'Valid Task',
        'Another Valid Task Title',
        'Task with special chars !@#$',
        'Task with numbers 123',
    ],
    invalidTitles: [
        '', // empty
        '  ', // whitespace only
        'AB', // too short
        'A'.repeat(101), // too long
    ],
    validDescriptions: [
        undefined,
        '',
        'Short description',
        'A'.repeat(500), // max length
    ],
    invalidDescriptions: [
        'A'.repeat(501), // too long
    ],
};

// Async test helpers
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const waitForNextTick = () => new Promise(resolve => setImmediate(resolve));

// Mock AsyncStorage helpers
export const mockAsyncStorage = {
    clear: jest.fn(() => Promise.resolve()) as MockFn,
    getItem: jest.fn((key: string) => {
        if (key === 'tasks') {
            return Promise.resolve(JSON.stringify(testTasks.multiple));
        }
        return Promise.resolve(null);
    }) as MockFn,
    setItem: jest.fn(() => Promise.resolve()) as MockFn,
    removeItem: jest.fn(() => Promise.resolve()) as MockFn,
};

// Error simulation helpers
export const simulateStorageError = () => {
    mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
    mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
};

// Component testing utilities
export const expectTaskToBeRendered = (getByText: (text: string) => any, task: Task) => {
    expect(getByText(task.title)).toBeTruthy();
    if (task.description) {
        expect(getByText(task.description)).toBeTruthy();
    }
};

export const expectTasksToBeRendered = (getByText: (text: string) => any, tasks: Task[]) => {
    tasks.forEach(task => expectTaskToBeRendered(getByText, task));
};