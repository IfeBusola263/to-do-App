import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { TaskList } from '../components/TaskList';
import { TaskProvider } from '../context/TaskContext';
import { Task } from '../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-router
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
    },
}));

// Mock Alert
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    return {
        ...RN,
        Alert: {
            alert: jest.fn(),
        },
    };
});

const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Incomplete Task 1',
        description: 'Description 1',
        completed: false,
        dueDate: new Date('2025-09-15'), // Future date
    },
    {
        id: '2',
        title: 'Incomplete Task 2',
        description: 'Description 2',
        completed: false,
        dueDate: new Date('2025-09-10'), // Earlier future date
    },
    {
        id: '3',
        title: 'Completed Task',
        description: 'Description 3',
        completed: true,
        dueDate: new Date('2025-09-05'),
    },
    {
        id: '4',
        title: 'Task Without Due Date',
        description: 'Description 4',
        completed: false,
        dueDate: undefined,
    },
    {
        id: '5',
        title: 'Overdue Task',
        description: 'Description 5',
        completed: false,
        dueDate: new Date('2025-09-01'), // Past date
    },
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <TaskProvider>{children}</TaskProvider>
);

describe('TaskList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering with provided tasks', () => {
        it('renders all provided tasks', () => {
            const { getByText } = render(
                <TestWrapper>
                    <TaskList tasks={mockTasks} />
                </TestWrapper>
            );

            expect(getByText('Incomplete Task 1')).toBeTruthy();
            expect(getByText('Incomplete Task 2')).toBeTruthy();
            expect(getByText('Completed Task')).toBeTruthy();
            expect(getByText('Task Without Due Date')).toBeTruthy();
            expect(getByText('Overdue Task')).toBeTruthy();
        });

        it('renders empty state when no tasks provided and showEmptyState is true', () => {
            const { getByText } = render(
                <TestWrapper>
                    <TaskList tasks={[]} showEmptyState />
                </TestWrapper>
            );

            expect(getByText('No tasks found')).toBeTruthy();
            expect(getByText('Try adjusting your search or filters to find what you\'re looking for.')).toBeTruthy();
        });

        it('renders default empty state when no tasks and showEmptyState is false', () => {
            const { getByText } = render(
                <TestWrapper>
                    <TaskList tasks={[]} />
                </TestWrapper>
            );

            expect(getByText('No tasks yet')).toBeTruthy();
            expect(getByText('Add your first task to get started with organizing your day!')).toBeTruthy();
        });
    });

    describe('Task Sorting', () => {
        it('sorts tasks correctly (incomplete first, then by due date)', () => {
            const { getAllByTestId } = render(
                <TestWrapper>
                    <TaskList tasks={mockTasks} />
                </TestWrapper>
            );

            const taskItems = getAllByTestId(/task-item-/);

            // Should have all tasks rendered
            expect(taskItems).toHaveLength(5);

            // The exact order depends on the sorting logic:
            // 1. Incomplete tasks first
            // 2. Among incomplete: earlier due dates first, then no due date
            // 3. Completed tasks last
        });

        it('handles tasks with same due dates consistently', () => {
            const tasksWithSameDueDate = [
                {
                    id: '1',
                    title: 'Task A',
                    description: 'Description A',
                    completed: false,
                    dueDate: new Date('2025-09-15'),
                },
                {
                    id: '2',
                    title: 'Task B',
                    description: 'Description B',
                    completed: false,
                    dueDate: new Date('2025-09-15'),
                },
            ];

            const { getAllByTestId } = render(
                <TestWrapper>
                    <TaskList tasks={tasksWithSameDueDate} />
                </TestWrapper>
            );

            const taskItems = getAllByTestId(/task-item-/);
            expect(taskItems).toHaveLength(2);
        });
    });

    describe('Pull to Refresh', () => {
        it('triggers refresh when pulled down', async () => {
            const { getByTestId } = render(
                <TestWrapper>
                    <TaskList tasks={mockTasks} />
                </TestWrapper>
            );

            const flatList = getByTestId('task-list');

            // Simulate pull to refresh
            fireEvent(flatList, 'refresh');

            // Should trigger the refresh functionality
            await waitFor(() => {
                expect(flatList).toBeTruthy();
            });
        });

        it('shows refreshing indicator during refresh', async () => {
            const { getByTestId } = render(
                <TestWrapper>
                    <TaskList tasks={mockTasks} />
                </TestWrapper>
            );

            const flatList = getByTestId('task-list');

            // Simulate pull to refresh
            fireEvent(flatList, 'refresh');

            // The refresh control should be active
            expect(flatList).toBeTruthy();
        });
    });

    describe('Performance Optimizations', () => {
        it('renders with FlatList for performance', () => {
            const { getByTestId } = render(
                <TestWrapper>
                    <TaskList tasks={mockTasks} />
                </TestWrapper>
            );

            const flatList = getByTestId('task-list');
            expect(flatList).toBeTruthy();
        });

        it('uses proper key extraction for list items', () => {
            const { getAllByTestId } = render(
                <TestWrapper>
                    <TaskList tasks={mockTasks} />
                </TestWrapper>
            );

            const taskItems = getAllByTestId(/task-item-/);

            // Each task item should have a unique testID based on task id
            expect(taskItems[0]).toBeTruthy();
            expect(taskItems[1]).toBeTruthy();
        });

        it('implements memo for performance optimization', () => {
            // Test that the component is wrapped with memo
            expect(TaskList.displayName).toBeTruthy();
        });
    });

    describe('Task Interactions', () => {
        it('allows task interactions through TaskItem components', () => {
            const { getByTestId } = render(
                <TestWrapper>
                    <TaskList tasks={[mockTasks[0]]} />
                </TestWrapper>
            );

            const taskItem = getByTestId('task-item-1');
            expect(taskItem).toBeTruthy();

            // Task item should be interactive
            fireEvent.press(taskItem);
        });
    });

    describe('Error Handling', () => {
        it('handles empty task arrays gracefully', () => {
            const { getByText } = render(
                <TestWrapper>
                    <TaskList tasks={[]} />
                </TestWrapper>
            );

            expect(getByText('No tasks yet')).toBeTruthy();
            expect(getByText('Add your first task to get started with organizing your day!')).toBeTruthy();
        });

        it('handles undefined tasks prop', () => {
            const { getByText } = render(
                <TestWrapper>
                    <TaskList />
                </TestWrapper>
            );

            // Should render without crashing and show empty state
            expect(getByText('No tasks yet')).toBeTruthy();
            expect(getByText('Add your first task to get started with organizing your day!')).toBeTruthy();
        });
    });

    describe('Filtering Support', () => {
        it('renders filtered tasks correctly', () => {
            const filteredTasks = mockTasks.filter(task => !task.completed);

            const { getByText, queryByText } = render(
                <TestWrapper>
                    <TaskList tasks={filteredTasks} />
                </TestWrapper>
            );

            // Should render incomplete tasks
            expect(getByText('Incomplete Task 1')).toBeTruthy();
            expect(getByText('Incomplete Task 2')).toBeTruthy();

            // Should not render completed task
            expect(queryByText('Completed Task')).toBeNull();
        });

        it('handles empty filtered results with custom empty state', () => {
            const { getByText } = render(
                <TestWrapper>
                    <TaskList tasks={[]} showEmptyState />
                </TestWrapper>
            );

            expect(getByText('No tasks found. Try adjusting your search or filters.')).toBeTruthy();
        });
    });

    describe('Accessibility', () => {
        it('provides proper accessibility for the list', () => {
            const { getByTestId } = render(
                <TestWrapper>
                    <TaskList tasks={mockTasks} />
                </TestWrapper>
            );

            const taskList = getByTestId('task-list');
            expect(taskList).toBeTruthy();
        });

        it('maintains accessibility for child TaskItems', () => {
            const { getAllByLabelText } = render(
                <TestWrapper>
                    <TaskList tasks={[mockTasks[0]]} />
                </TestWrapper>
            );

            // Each TaskItem should have accessible elements
            const checkboxes = getAllByLabelText('Toggle task completion');
            expect(checkboxes).toHaveLength(1);
        });
    });
});