import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { TaskItem } from './TaskItem';
import EmptyState from './EmptyState';
import { useTaskContext } from '../context/TaskContext';
import { Theme } from '../theme';

export const TaskList: React.FC = () => {
  const { tasks } = useTaskContext();

  if (tasks.length === 0) {
    return (
      <EmptyState
        message="No tasks yet! Add a new task to get started."
        image={require('../assets/images/react-logo.png')}
      />
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TaskItem task={item} />}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: Theme.light.spacing.medium,
    paddingBottom: Theme.light.spacing.large,
  },
  separator: {
    height: Theme.light.spacing.small,
  },
});