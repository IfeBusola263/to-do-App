import { Task } from '../types';

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

// Simple mock function type
type MockFunction = (...args: any[]) => any;

// Mock context factory (without Jest dependencies)
export const createMockTaskContext = (overrides: any = {}) => ({
    tasks: testTasks.multiple,
    loading: false,
    error: null,
    addTask: (() => Promise.resolve()) as MockFunction,
    updateTask: (() => Promise.resolve()) as MockFunction,
    toggleTask: (() => Promise.resolve()) as MockFunction,
    deleteTask: (() => Promise.resolve()) as MockFunction,
    loadTasks: (() => Promise.resolve()) as MockFunction,
    clearError: (() => { }) as MockFunction,
    ...overrides,
});

// Mock router factory (without Jest dependencies)
export const createMockRouter = (overrides: any = {}) => ({
    push: (() => { }) as MockFunction,
    back: (() => { }) as MockFunction,
    replace: (() => { }) as MockFunction,
    canGoBack: () => true,
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

// Mock AsyncStorage helpers (without Jest dependencies)
export const mockAsyncStorage = {
    clear: () => Promise.resolve(),
    getItem: (key: string) => {
        if (key === 'tasks') {
            return Promise.resolve(JSON.stringify(testTasks.multiple));
        }
        return Promise.resolve(null);
    },
    setItem: () => Promise.resolve(),
    removeItem: () => Promise.resolve(),
};

// Error simulation helpers
export const simulateStorageError = () => {
    console.log('Storage error simulation - implement based on your testing framework');
};

// Component testing utilities (generic versions without Jest/expect dependencies)
export const checkTaskRendered = (task: Task) => {
    console.log(`Checking if task "${task.title}" is rendered`);
    // Implementation depends on your testing framework
    return true;
};

export const checkTasksRendered = (tasks: Task[]) => {
    console.log(`Checking if ${tasks.length} tasks are rendered`);
    tasks.forEach(task => checkTaskRendered(task));
    return true;
};