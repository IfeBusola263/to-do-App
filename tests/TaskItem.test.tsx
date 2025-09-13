import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TaskItem } from '../components/TaskItem';
import { Task } from '../types';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  completed: false,
};

describe('TaskItem', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <TaskItem task={mockTask} />
    );
    expect(getByText('Test Task')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
  });

  it('toggles completion when checkbox is pressed', () => {
    const mockToggleTask = jest.fn();
    const { getByTestId } = render(
      <TaskItem 
        task={mockTask} 
        toggleTask={mockToggleTask}
      />
    );
    fireEvent.press(getByTestId('checkbox'));
    expect(mockToggleTask).toHaveBeenCalledWith('1');
  });

  it('deletes task when delete button is pressed', () => {
    const mockDeleteTask = jest.fn();
    const { getByTestId } = render(
      <TaskItem 
        task={mockTask} 
        deleteTask={mockDeleteTask}
      />
    );
    fireEvent.press(getByTestId('delete-button'));
    expect(mockDeleteTask).toHaveBeenCalledWith('1');
  });

  it('navigates to task detail when task is pressed', () => {
    const mockPush = jest.fn();
    const { getByTestId } = render(
      <TaskItem 
        task={mockTask} 
        router={{ push: mockPush }}
      />
    );
    fireEvent.press(getByTestId('task-content'));
    expect(mockPush).toHaveBeenCalledWith('/task/1');
  });
});