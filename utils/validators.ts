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

export const validateDueDate = (dueDate: Date | undefined): string | undefined => {
  if (!dueDate) {
    return undefined; // Due date is optional
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selectedDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  if (selectedDate < today) {
    return 'Due date cannot be in the past';
  }

  // Check if date is more than 5 years in the future
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 5);

  if (dueDate > maxDate) {
    return 'Due date cannot be more than 5 years in the future';
  }

  return undefined;
};