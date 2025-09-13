export const validateTaskTitle = (title: string): string | undefined => {
  if (!title.trim()) {
    return 'Task title cannot be empty';
  }
  if (title.trim().length < 3) {
    return 'Task title must be at least 3 characters long';
  }
  if (title.trim().length > 100) {
    return 'Task title cannot exceed 100 characters';
  }
  return undefined;
};

export const validateTaskDescription = (description: string | undefined): string | undefined => {
  if (description && description.trim().length > 500) {
    return 'Task description cannot exceed 500 characters';
  }
  return undefined;
};