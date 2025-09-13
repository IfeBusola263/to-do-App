import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, ListRenderItem, RefreshControl, StyleSheet, View } from 'react-native';
import { useTaskContext } from '../context/TaskContext';
import { Theme } from '../theme';
import { Task } from '../types';
import EmptyState from './EmptyState';
import { TaskItem } from './TaskItem';

export const TaskList: React.FC = memo(() => {
  const { tasks, loadTasks } = useTaskContext();
  const [refreshing, setRefreshing] = React.useState(false);

  // Sort tasks with enhanced logic: incomplete first, then by due date, then completed
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // First, separate completed from incomplete
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // For tasks with the same completion status, sort by due date
      if (a.dueDate && b.dueDate) {
        // Both have due dates - sort by date
        return a.dueDate.getTime() - b.dueDate.getTime();
      } else if (a.dueDate && !b.dueDate) {
        // Only A has due date - A comes first
        return -1;
      } else if (!a.dueDate && b.dueDate) {
        // Only B has due date - B comes first
        return 1;
      }

      // Neither has due date - maintain original order
      return 0;
    });
  }, [tasks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTasks();
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadTasks]);

  const renderItem: ListRenderItem<Task> = useCallback(({ item }) => (
    <TaskItem task={item} />
  ), []);

  const keyExtractor = useCallback((item: Task) => item.id, []);

  const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

  if (tasks.length === 0 && !refreshing) {
    return (
      <EmptyState
        message="No tasks yet! Add a new task to get started."
        image={require('../assets/images/react-logo.png')}
      />
    );
  }

  return (
    <FlatList
      data={sortedTasks}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={[
        styles.listContent,
        tasks.length === 0 && styles.emptyListContent
      ]}
      ItemSeparatorComponent={ItemSeparator}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Theme.light.colors.primary]}
          tintColor={Theme.light.colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
      bounces={true}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={10}
      getItemLayout={(data, index) => ({
        length: 80, // Approximate item height
        offset: 80 * index,
        index,
      })}
    />
  );
});

const styles = StyleSheet.create({
  listContent: {
    paddingTop: Theme.light.spacing.small,
    paddingBottom: Theme.light.spacing.large,
  },
  emptyListContent: {
    flex: 1,
  },
  separator: {
    height: Theme.light.spacing.xs,
  },
});