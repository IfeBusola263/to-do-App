import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { TaskProvider, useTaskContext } from '../context/TaskContext';
import { Task } from '../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Type the mocked AsyncStorage
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Test Task 1',
        description: 'Description 1',
        completed: false,
        dueDate: new Date('2025-09-15'),
    },
    {
        id: '2',
        title: 'Test Task 2',
        description: 'Description 2',
        completed: true,
        dueDate: undefined,
    },
];

describe('TaskContext', () => {
    beforeEach(() => {
        mockedAsyncStorage.clear();
        jest.clearAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TaskProvider>{children}</TaskProvider>
    );

    describe('Initial State', () => {
        it('should initialize with empty tasks and loading false', () => {
            const { result } = renderHook(() => useTaskContext(), { wrapper });

            expect(result.current.tasks).toEqual([]);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe(null);
        });
    });

    describe('loadTasks', () => {
        it('should load tasks from AsyncStorage', async () => {
            mockedAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockTasks));

            const { result } = renderHook(() => useTaskContext(), { wrapper });

            await act(async () => {
                await result.current.loadTasks();
            });

            expect(result.current.tasks).toEqual(mockTasks);
            expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith('tasks');
        });

        it('should handle AsyncStorage errors gracefully', async () => {
            mockedAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

            const { result } = renderHook(() => useTaskContext(), { wrapper });

            await act(async () => {
                await result.current.loadTasks();
            });

            expect(result.current.tasks).toEqual([]);
            expect(result.current.error).toBe('Failed to load tasks');
        });

        it('should handle invalid JSON in storage', async () => {
            mockedAsyncStorage.getItem.mockResolvedValueOnce('invalid json');

            const { result } = renderHook(() => useTaskContext(), { wrapper });

            await act(async () => {
                await result.current.loadTasks();
            });

            expect(result.current.tasks).toEqual([]);
            expect(result.current.error).toBe('Failed to load tasks');
        });
    });

    describe('addTask', () => {
        it('should add a new task', async () => {
            const { result } = renderHook(() => useTaskContext(), { wrapper });

            await act(async () => {
                await result.current.addTask('New Task', 'New Description', new Date('2025-09-20'));
            });

            expect(result.current.tasks).toHaveLength(1);
            expect(result.current.tasks[0]).toMatchObject({
                title: 'New Task',
                description: 'New Description',
                completed: false,
                dueDate: new Date('2025-09-20'),
            });
            expect(result.current.tasks[0].id).toBeDefined();
            expect(mockedAsyncStorage.setItem).toHaveBeenCalled();
        });

        it('should handle storage errors with rollback', async () => {
            mockedAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));

            const { result } = renderHook(() => useTaskContext(), { wrapper });

            await act(async () => {
                await result.current.addTask('New Task', 'Description');
            });

            expect(result.current.tasks).toEqual([]);
            expect(result.current.error).toBe('Failed to add task');
        });
    });

    describe('updateTask', () => {
        it('should update an existing task', async () => {
            const { result } = renderHook(() => useTaskContext(), { wrapper });

            // Add initial task
            await act(async () => {
                await result.current.addTask('Initial Task', 'Initial Description');
            });

            const taskId = result.current.tasks[0].id;

            // Update task
            await act(async () => {
                await result.current.updateTask(taskId, 'Updated Task', 'Updated Description', new Date('2025-09-25'));
            });

            expect(result.current.tasks[0]).toMatchObject({
                id: taskId,
                title: 'Updated Task',
                description: 'Updated Description',
                completed: false,
                dueDate: new Date('2025-09-25'),
            });
            expect(mockedAsyncStorage.setItem).toHaveBeenCalled();
        });

        it('should handle updating non-existent task', async () => {
            const { result } = renderHook(() => useTaskContext(), { wrapper });

            await act(async () => {
                await result.current.updateTask('non-existent', 'Updated Task', 'Updated Description');
            });

            expect(result.current.error).toBe('Failed to update task');
        });
    });

    describe('toggleTask', () => {
        it('should toggle task completion status', async () => {
            const { result } = renderHook(() => useTaskContext(), { wrapper });

            // Add initial task
            await act(async () => {
                await result.current.addTask('Toggle Task', 'Description');
            });

            const taskId = result.current.tasks[0].id;
            expect(result.current.tasks[0].completed).toBe(false);

            // Toggle completion
            await act(async () => {
                await result.current.toggleTask(taskId);
            });

            expect(result.current.tasks[0].completed).toBe(true);

            // Toggle again
            await act(async () => {
                await result.current.toggleTask(taskId);
            });

            expect(result.current.tasks[0].completed).toBe(false);
        });
    });

    describe('deleteTask', () => {
        it('should delete a task', async () => {
            const { result } = renderHook(() => useTaskContext(), { wrapper });

            // Add initial task
            await act(async () => {
                await result.current.addTask('Delete Task', 'Description');
            });

            expect(result.current.tasks).toHaveLength(1);
            const taskId = result.current.tasks[0].id;

            // Delete task
            await act(async () => {
                await result.current.deleteTask(taskId);
            });

            expect(result.current.tasks).toHaveLength(0);
            expect(mockedAsyncStorage.setItem).toHaveBeenCalled();
        });

        it('should handle storage errors with rollback', async () => {
            const { result } = renderHook(() => useTaskContext(), { wrapper });

            // Add initial task
            await act(async () => {
                await result.current.addTask('Delete Task', 'Description');
            });

            const taskId = result.current.tasks[0].id;

            // Mock storage error
            mockedAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));

            await act(async () => {
                await result.current.deleteTask(taskId);
            });

            // Task should be restored due to rollback
            expect(result.current.tasks).toHaveLength(1);
            expect(result.current.error).toBe('Failed to delete task');
        });
    });

    describe('Loading States', () => {
        it('should set loading state during operations', async () => {
            const { result } = renderHook(() => useTaskContext(), { wrapper });

            // Mock a slow storage operation
            mockedAsyncStorage.setItem.mockImplementationOnce(
                () => new Promise(resolve => setTimeout(resolve, 100))
            );

            let loadingDuringOperation = false;

            act(() => {
                result.current.addTask('Test Task', 'Description').then(() => {
                    // Operation completed
                });
            });

            // Check loading state immediately after calling addTask
            await waitFor(() => {
                if (result.current.loading) {
                    loadingDuringOperation = true;
                }
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(loadingDuringOperation).toBe(true);
        });
    });
});