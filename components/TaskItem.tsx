import { MaterialIcons } from '@expo/vector-icons';
import { Checkbox } from 'expo-checkbox';
import { useRouter } from 'expo-router';
import React, { memo, useCallback } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTaskContext } from '../context/TaskContext';
import { Theme } from '../theme';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = memo(({ task }) => {
  const { toggleTask, deleteTask } = useTaskContext();
  const router = useRouter();

  const handleToggleTask = useCallback(() => {
    toggleTask(task.id);
  }, [task.id, toggleTask]);

  const handleDeleteTask = useCallback(() => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTask(task.id)
        }
      ]
    );
  }, [task.id, task.title, deleteTask]);

  const handleTaskPress = useCallback(() => {
    router.push("./TaskDetailScreen");
  }, [router]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.taskContent}
        onPress={handleTaskPress}
        activeOpacity={0.7}
      >
        <Checkbox
          value={task.completed}
          onValueChange={handleToggleTask}
          color={task.completed ? Theme.light.colors.primary : Theme.light.colors.border}
          style={styles.checkbox}
        />
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
    </View>
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
  deleteButton: {
    padding: Theme.light.spacing.small,
    borderRadius: Theme.light.borderRadius.small,
  },
});