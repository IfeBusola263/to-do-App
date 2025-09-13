import { MaterialIcons } from '@expo/vector-icons';
import { Checkbox } from 'expo-checkbox';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTaskContext } from '../context/TaskContext';
import { Theme } from '../theme';
import { Task } from '../types';
import { useRouter } from 'expo-router';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTask, deleteTask } = useTaskContext();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.taskContent} onPress={() => router.push(`/task/${task.id}`)}>
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
      </TouchableOpacity>
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
    backgroundColor: Theme.light.colors.background,
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
    fontWeight: Theme.light.typography.body.fontWeight as FontWeight,
    color: Theme.light.colors.text,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: Theme.light.colors.text,
  },
  description: {
    fontSize: Theme.light.typography.body.fontSize * 0.85,
    color: Theme.light.colors.text,
    marginTop: Theme.light.spacing.small,
  },
  completedDescription: {
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    padding: Theme.light.spacing.small,
  },
});