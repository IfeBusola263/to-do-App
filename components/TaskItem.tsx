import { MaterialIcons } from '@expo/vector-icons';
import { Checkbox } from 'expo-checkbox';
import { useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTaskContext } from '../context/TaskContext';
import { Theme } from '../theme';
import { Task } from '../types';

// Helper functions for due date formatting and status
const ensureDate = (dateValue: Date | string | undefined): Date | null => {
  if (!dateValue) return null;
  if (dateValue instanceof Date) return dateValue;
  const parsedDate = new Date(dateValue);
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const formatDueDate = (dueDate: Date | string): string => {
  const date = ensureDate(dueDate);
  if (!date) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (taskDate.getTime() === today.getTime()) {
    return 'Due Today';
  } else if (taskDate.getTime() === tomorrow.getTime()) {
    return 'Due Tomorrow';
  } else {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };

    // Add year if it's not current year
    if (date.getFullYear() !== now.getFullYear()) {
      options.year = 'numeric';
    }

    return `Due ${date.toLocaleDateString('en-US', options)}`;
  }
};

const isDueDateOverdue = (dueDate: Date | string, completed: boolean): boolean => {
  if (completed) return false;

  const date = ensureDate(dueDate);
  if (!date) return false;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return taskDate < today;
};

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = memo(({ task }) => {
  const { toggleTask, deleteTask } = useTaskContext();
  const router = useRouter();

  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const checkboxScale = useSharedValue(1);

  // Initialize animations
  useEffect(() => {
    // Entry animation
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, []);

  const handleToggleTask = useCallback(() => {
    // Animate checkbox
    checkboxScale.value = withSpring(1.2, { duration: 150 }, () => {
      checkboxScale.value = withSpring(1, { duration: 150 });
    });

    // Animate completion
    if (!task.completed) {
      // Completing task - brief scale animation
      scale.value = withSpring(1.05, { duration: 150 }, () => {
        scale.value = withSpring(1, { duration: 150 });
      });
    }

    runOnJS(toggleTask)(task.id);
  }, [task.id, task.completed, toggleTask, checkboxScale, scale]);

  const handleDeleteTask = useCallback(() => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            // Slide out animation before deletion
            translateX.value = withTiming(-300, { duration: 300 });
            opacity.value = withTiming(0, { duration: 300 }, () => {
              runOnJS(deleteTask)(task.id);
            });
          },
          style: "destructive"
        },
      ]
    );
  }, [task.title, task.id, deleteTask, translateX, opacity]);

  const handleTaskPress = useCallback(() => {
    // Press animation
    scale.value = withSpring(0.95, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 100 });
    });

    router.push(`/task/${task.id}`);
  }, [task.id, router, scale]);

  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
  }));

  const animatedCheckboxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        task.completed ? 1 : 0,
        [0, 1],
        [1, 0.6]
      ),
    };
  });

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <TouchableOpacity
        style={styles.taskContent}
        onPress={handleTaskPress}
        activeOpacity={0.7}
      >
        <Animated.View style={animatedCheckboxStyle}>
          <Checkbox
            value={task.completed}
            onValueChange={handleToggleTask}
            color={task.completed ? Theme.light.colors.primary : Theme.light.colors.border}
            style={styles.checkbox}
          />
        </Animated.View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              task.completed && styles.completedTitle,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {task.description && (
            <Text
              style={[
                styles.description,
                task.completed && styles.completedDescription,
              ]}
              numberOfLines={3}
            >
              {task.description}
            </Text>
          )}
          {task.dueDate && (
            <Text
              style={[
                styles.dueDate,
                task.completed && styles.completedDueDate,
                isDueDateOverdue(task.dueDate, task.completed) && styles.overdueDueDate,
              ]}
            >
              {formatDueDate(task.dueDate)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleDeleteTask}
        style={styles.deleteButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <MaterialIcons name="delete" size={20} color={Theme.light.colors.error} />
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.light.spacing.medium,
    backgroundColor: Theme.light.colors.surface,
    borderRadius: Theme.light.borderRadius.medium,
    marginVertical: Theme.light.spacing.xs,
    marginHorizontal: Theme.light.spacing.medium,
    shadowColor: Theme.light.shadows.small.shadowColor,
    shadowOffset: Theme.light.shadows.small.shadowOffset,
    shadowOpacity: Theme.light.shadows.small.shadowOpacity,
    shadowRadius: Theme.light.shadows.small.shadowRadius,
    elevation: Theme.light.shadows.small.elevation,
    borderWidth: 1,
    borderColor: Theme.light.colors.border,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    marginRight: Theme.light.spacing.medium,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: Theme.light.typography.body.fontSize,
    fontWeight: '600' as any,
    color: Theme.light.colors.text,
    lineHeight: Theme.light.typography.body.lineHeight,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: Theme.light.colors.textSecondary,
    opacity: 0.7,
  },
  description: {
    fontSize: Theme.light.typography.caption.fontSize,
    color: Theme.light.colors.textSecondary,
    marginTop: Theme.light.spacing.xs,
    lineHeight: Theme.light.typography.caption.lineHeight,
  },
  completedDescription: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  dueDate: {
    fontSize: Theme.light.typography.caption.fontSize * 0.9,
    color: Theme.light.colors.primary,
    marginTop: Theme.light.spacing.xs,
    fontWeight: '500' as any,
  },
  completedDueDate: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
    color: Theme.light.colors.textSecondary,
  },
  overdueDueDate: {
    color: Theme.light.colors.error,
    fontWeight: '600' as any,
  },
  deleteButton: {
    padding: Theme.light.spacing.small,
    borderRadius: Theme.light.borderRadius.small,
  },
});