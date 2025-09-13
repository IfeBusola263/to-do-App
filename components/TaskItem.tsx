import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Checkbox } from 'expo-checkbox';
import { Task } from '../types';
import { Theme } from '../theme';
import { useTaskContext } from '../context/TaskContext';
import { MaterialIcons } from '@expo/vector-icons';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTask, deleteTask } = useTaskContext();

  return (
    <View style={styles.container}>
      <View style={styles.taskContent}>
        <Checkbox
          value={task.completed}
          onValueChange={() => toggleTask(task.id)}
          color={task.completed ? Theme.light.colors.primary : undefined}
          style={styles.checkbox}
        />
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              task.completed && styles.completedTitle,
            ]}
          >
            {task.title}
          </Text>
          {task.description && (
            <Text
              style={[
                styles.description,
                task.completed && styles.completedDescription,
              ]}
            >
              {task.description}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={() => deleteTask(task.id)} style={styles.deleteButton}>
        <MaterialIcons name="delete" size={24} color={Theme.light.colors.error} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.light.spacing.medium,
    backgroundColor: Theme.light.colors.cardBackground,
    borderRadius: Theme.light.spacing.small,
    marginBottom: Theme.light.spacing.small,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
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
    fontWeight: Theme.light.typography.body.fontWeight,
    color: Theme.light.colors.text,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: Theme.light.colors.textSecondary,
  },
  description: {
    fontSize: Theme.light.typography.caption.fontSize,
    color: Theme.light.colors.textSecondary,
    marginTop: Theme.light.spacing.xsmall,
  },
  completedDescription: {
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    padding: Theme.light.spacing.xsmall,
  },
});