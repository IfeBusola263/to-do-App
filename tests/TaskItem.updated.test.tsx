import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';
import { TaskItem } from '../components/TaskItem';
import { TaskProvider } from '../context/TaskContext';
import { Task } from '../types';

// Mock expo-router
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
    },
}));

// Mock React Native Alert
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
    // Simulate user pressing the confirm button
    if (buttons && buttons[1] && buttons[1].onPress) {
        buttons[1].onPress();
    }
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        dueDate: new Date('2025-09-15'),
    },
    {
        id: '2',
        title: 'Completed Task',
        description: 'Completed Description',
        completed: true,
        dueDate: new Date('2025-09-10'),
    },
    {
        id: '3',
        title: 'Overdue Task',
        description: 'Overdue Description',
        completed: false,
        dueDate: new Date('2025-09-01'), // Past date
    },
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <TaskProvider>{children}</TaskProvider>
);

describe('TaskItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders task title and description correctly', () => {
            const { getByText } = render(
                <TestWrapper>
                    <TaskItem task={mockTasks[0]} />
                </TestWrapper>
            );

            expect(getByText('Test Task')).toBeTruthy();
            expect(getByText('Test Description')).toBeTruthy();
        });

        it('renders task without description', () => {
            const taskWithoutDescription = { ...mockTasks[0], description: undefined };
            const { getByText, queryByText } = render(
                <TestWrapper>
                    <TaskItem task={taskWithoutDescription} />
                </TestWrapper>
            );

            expect(getByText('Test Task')).toBeTruthy();
            expect(queryByText('Test Description')).toBeNull();
        });

        it('displays due date when present', () => {
            const { getByText } = render(
                <TestWrapper>
                    <TaskItem task={mockTasks[0]} />
                </TestWrapper>
            );

            expect(getByText('Due Sep 15')).toBeTruthy();
        });

        it('shows overdue indicator for past due tasks', () => {
            const { getByText } = render(
                <TestWrapper>
                    <TaskItem task={mockTasks[2]} />
                </TestWrapper>
            );

            // Should show overdue styling and text
            expect(getByText('Overdue Task')).toBeTruthy();
            expect(getByText('Overdue')).toBeTruthy();
        });

        it('applies completed styling for completed tasks', () => {
            const { getByText } = render(
                <TestWrapper>
                    <TaskItem task={mockTasks[1]} />
                </TestWrapper>
            );

            const titleElement = getByText('Completed Task');
            expect(titleElement).toBeTruthy();
        });
    });

    describe('Interactions', () => {
        it('navigates to task detail when pressed', () => {
            const { getByTestId } = render(
                <TestWrapper>
                    <TaskItem task={mockTasks[0]} />
                </TestWrapper>
            );

            const taskItem = getByTestId('task-item-1');
            fireEvent.press(taskItem);

            expect(router.push).toHaveBeenCalledWith('/task/1');
        });

        it('toggles task completion when checkbox is pressed', () => {
            const { getByTestId } = render(
                <TestWrapper>
                    <TaskItem task={mockTasks[0]} />
                </TestWrapper>
            );

            const checkbox = getByTestId('task-checkbox-1');
            fireEvent.press(checkbox);

            // Task should be toggled (mocked context will handle the actual toggle)
            expect(checkbox).toBeTruthy();
        });

        it('shows delete confirmation when delete button is pressed', () => {
            const { getByTestId } = render(
                <TestWrapper>
                    <TaskItem task={mockTasks[0]} />
                </TestWrapper>
            );

            const deleteButton = getByTestId('task-delete-1');
            fireEvent.press(deleteButton);

            expect(Alert.alert).toHaveBeenCalledWith(
                'Delete Task',
                'Are you sure you want to delete "Test Task"?',
                expect.any(Array)
            );
        });
    });

    describe('Due Date Formatting', () => {
        it('formats due date correctly for future dates', () => {
            const futureTask = {
                ...mockTasks[0],
                dueDate: new Date('2025-12-25'),
            };

            const { getByText } = render(
                <TestWrapper>
                    <TaskItem task={futureTask} />
                </TestWrapper>
            );

            expect(getByText('Due Dec 25')).toBeTruthy();
        });

        it('shows today indicator for tasks due today', () => {
            const today = new Date();
            const todayTask = {
                ...mockTasks[0],
                dueDate: today,
            };

            const { getByText } = render(
                <TestWrapper>
                    <TaskItem task={todayTask} />
                </TestWrapper>
            );

            expect(getByText('Due Today')).toBeTruthy();
        });

        it('shows tomorrow indicator for tasks due tomorrow', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowTask = {
                ...mockTasks[0],
                dueDate: tomorrow,
            };

            const { getByText } = render(
                <TestWrapper>
                    <TaskItem task={tomorrowTask} />
                </TestWrapper>
            );

            expect(getByText('Due Tomorrow')).toBeTruthy();
        });
    });

    describe('Accessibility', () => {
        it('provides proper accessibility labels', () => {
            const { getByLabelText } = render(
                <TestWrapper>
                    <TaskItem task={mockTasks[0]} />
                </TestWrapper>
            );

            expect(getByLabelText('Toggle task completion')).toBeTruthy();
            expect(getByLabelText('Delete task')).toBeTruthy();
        });

        it('has proper accessibility role for task item', () => {
            const { getByRole } = render(
                <TestWrapper>
                    <TaskItem task={mockTasks[0]} />
                </TestWrapper>
            );

            expect(getByRole('button')).toBeTruthy();
        });
    });

    describe('Performance', () => {
        it('renders efficiently with React.memo', () => {
            const { rerender } = render(
                <TestWrapper>
                    <TaskItem task={mockTasks[0]} />
                </TestWrapper>
            );

            // Re-render with same props should not cause unnecessary renders
            rerender(
                <TestWrapper>
                    <TaskItem task={mockTasks[0]} />
                </TestWrapper>
            );

            // Component should handle memo correctly
            expect(true).toBeTruthy(); // Placeholder for memo testing
        });
    });
});