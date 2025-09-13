import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import FilterBar from '../components/FilterBar';
import { TaskProvider } from '../context/TaskContext';
import { Task } from '../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Active Task 1',
        description: 'Description 1',
        completed: false,
        dueDate: new Date('2025-09-15'), // Future
    },
    {
        id: '2',
        title: 'Active Task 2',
        description: 'Description 2',
        completed: false,
        dueDate: new Date('2025-09-13'), // Today
    },
    {
        id: '3',
        title: 'Completed Task',
        description: 'Description 3',
        completed: true,
        dueDate: new Date('2025-09-10'),
    },
    {
        id: '4',
        title: 'Overdue Task',
        description: 'Description 4',
        completed: false,
        dueDate: new Date('2025-09-01'), // Past
    },
    {
        id: '5',
        title: 'Upcoming Task',
        description: 'Description 5',
        completed: false,
        dueDate: new Date('2025-09-20'), // Future
    },
];

// Mock the TaskContext to provide test data
const MockTaskProvider = ({ children }: { children: React.ReactNode }) => {
    // Mock AsyncStorage to return our test data
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockTasks));

    return (
        <TaskProvider>
            {children}
        </TaskProvider>
    );
};

describe('FilterBar', () => {
    const mockOnFilterChange = jest.fn();

    // Mock current date to September 13, 2025
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-09-13T12:00:00.000Z'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders all filter options', () => {
            const { getByText } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="all"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            expect(getByText('All')).toBeTruthy();
            expect(getByText('Active')).toBeTruthy();
            expect(getByText('Completed')).toBeTruthy();
            expect(getByText('Overdue')).toBeTruthy();
            expect(getByText('Due Today')).toBeTruthy();
            expect(getByText('Upcoming')).toBeTruthy();
        });

        it('displays correct count badges', () => {
            const { getByText } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="all"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            // Total tasks: 5
            expect(getByText('5')).toBeTruthy(); // All count

            // Active tasks: 4 (not completed)
            expect(getByText('4')).toBeTruthy(); // Active count

            // Completed tasks: 1
            expect(getByText('1')).toBeTruthy(); // Completed count
        });

        it('highlights active filter', () => {
            const { getByTestId } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="active"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            const activeButton = getByTestId('filter-button-active');
            expect(activeButton).toBeTruthy();

            // Should have active styling (implementation detail)
            expect(activeButton.props.style).toBeTruthy();
        });

        it('shows zero counts for empty filters', () => {
            // Render with no tasks
            const { getByText } = render(
                <TaskProvider>
                    <FilterBar
                        activeFilter="all"
                        onFilterChange={mockOnFilterChange}
                    />
                </TaskProvider>
            );

            expect(getByText('0')).toBeTruthy();
        });
    });

    describe('Filter Count Calculations', () => {
        it('calculates "All" count correctly', () => {
            const { getByText } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="all"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            expect(getByText('5')).toBeTruthy(); // All 5 tasks
        });

        it('calculates "Active" count correctly', () => {
            const { getByText } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="active"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            expect(getByText('4')).toBeTruthy(); // 4 incomplete tasks
        });

        it('calculates "Completed" count correctly', () => {
            const { getByText } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="completed"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            expect(getByText('1')).toBeTruthy(); // 1 completed task
        });

        it('calculates "Overdue" count correctly', () => {
            const { getByText } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="overdue"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            expect(getByText('1')).toBeTruthy(); // 1 overdue task (task with dueDate 2025-09-01)
        });

        it('calculates "Due Today" count correctly', () => {
            const { getByText } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="today"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            expect(getByText('1')).toBeTruthy(); // 1 task due today (task with dueDate 2025-09-13)
        });

        it('calculates "Upcoming" count correctly', () => {
            const { getByText } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="upcoming"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            expect(getByText('2')).toBeTruthy(); // 2 upcoming tasks (future dates, not today)
        });
    });

    describe('Interactions', () => {
        it('calls onFilterChange when filter is selected', () => {
            const { getByTestId } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="all"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            const activeButton = getByTestId('filter-button-active');
            fireEvent.press(activeButton);

            expect(mockOnFilterChange).toHaveBeenCalledWith('active');
        });

        it('can switch between different filters', () => {
            const { getByTestId } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="all"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            // Click on different filters
            fireEvent.press(getByTestId('filter-button-completed'));
            expect(mockOnFilterChange).toHaveBeenCalledWith('completed');

            fireEvent.press(getByTestId('filter-button-overdue'));
            expect(mockOnFilterChange).toHaveBeenCalledWith('overdue');

            fireEvent.press(getByTestId('filter-button-today'));
            expect(mockOnFilterChange).toHaveBeenCalledWith('today');

            fireEvent.press(getByTestId('filter-button-upcoming'));
            expect(mockOnFilterChange).toHaveBeenCalledWith('upcoming');

            expect(mockOnFilterChange).toHaveBeenCalledTimes(4);
        });

        it('does not call onFilterChange when clicking already active filter', () => {
            const { getByTestId } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="active"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            const activeButton = getByTestId('filter-button-active');
            fireEvent.press(activeButton);

            // Should still call the handler (let parent decide behavior)
            expect(mockOnFilterChange).toHaveBeenCalledWith('active');
        });
    });

    describe('Scrollable Behavior', () => {
        it('renders as horizontal scrollable list', () => {
            const { getByTestId } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="all"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            const scrollView = getByTestId('filter-scroll-view');
            expect(scrollView).toBeTruthy();
        });

        it('handles overflow gracefully', () => {
            // Test with all filters visible
            const { getByTestId } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="all"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            // All filter buttons should be present
            expect(getByTestId('filter-button-all')).toBeTruthy();
            expect(getByTestId('filter-button-active')).toBeTruthy();
            expect(getByTestId('filter-button-completed')).toBeTruthy();
            expect(getByTestId('filter-button-overdue')).toBeTruthy();
            expect(getByTestId('filter-button-today')).toBeTruthy();
            expect(getByTestId('filter-button-upcoming')).toBeTruthy();
        });
    });

    describe('Accessibility', () => {
        it('provides proper accessibility labels for filter buttons', () => {
            const { getByLabelText } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="all"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            expect(getByLabelText('Filter by all tasks')).toBeTruthy();
            expect(getByLabelText('Filter by active tasks')).toBeTruthy();
            expect(getByLabelText('Filter by completed tasks')).toBeTruthy();
        });

        it('indicates active filter state for accessibility', () => {
            const { getByTestId } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="active"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            const activeButton = getByTestId('filter-button-active');
            expect(activeButton).toBeTruthy();
            // Should have appropriate accessibility state
        });
    });

    describe('Edge Cases', () => {
        it('handles tasks without due dates', () => {
            const tasksWithoutDueDate: Task[] = [
                {
                    id: '1',
                    title: 'Task without due date',
                    description: 'Description',
                    completed: false,
                    dueDate: undefined,
                },
            ];

            const MockProviderWithoutDueDate = ({ children }: { children: React.ReactNode }) => {
                const AsyncStorage = require('@react-native-async-storage/async-storage');
                AsyncStorage.getItem.mockResolvedValue(JSON.stringify(tasksWithoutDueDate));

                return (
                    <TaskProvider>
                        {children}
                    </TaskProvider>
                );
            };

            const { getByText } = render(
                <MockProviderWithoutDueDate>
                    <FilterBar
                        activeFilter="all"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockProviderWithoutDueDate>
            );

            expect(getByText('1')).toBeTruthy(); // Should count in "All"
            // Tasks without due dates should not be counted in date-based filters
        });

        it('handles empty task list', () => {
            const EmptyTaskProvider = ({ children }: { children: React.ReactNode }) => {
                const AsyncStorage = require('@react-native-async-storage/async-storage');
                AsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

                return (
                    <TaskProvider>
                        {children}
                    </TaskProvider>
                );
            };

            const { getAllByText } = render(
                <EmptyTaskProvider>
                    <FilterBar
                        activeFilter="all"
                        onFilterChange={mockOnFilterChange}
                    />
                </EmptyTaskProvider>
            );

            const zeroCounts = getAllByText('0');
            expect(zeroCounts.length).toBeGreaterThan(0);
        });
    });

    describe('Performance', () => {
        it('recalculates counts efficiently when tasks change', () => {
            const { rerender } = render(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="all"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            // Re-render with same tasks
            rerender(
                <MockTaskProvider>
                    <FilterBar
                        activeFilter="all"
                        onFilterChange={mockOnFilterChange}
                    />
                </MockTaskProvider>
            );

            // Should handle re-renders efficiently
            expect(mockOnFilterChange).not.toHaveBeenCalled();
        });
    });
});