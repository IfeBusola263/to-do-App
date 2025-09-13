import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FilterBar, { TaskFilter } from "../components/FilterBar";
import Header from "../components/Header";
import ScreenTransition from "../components/ScreenTransition";
import SearchBar from "../components/SearchBar";
import { TaskList } from "../components/TaskList";
import { useTaskContext } from "../context/TaskContext";
import { Theme } from "../theme";

export default function HomeScreen() {
  const { tasks } = useTaskContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (activeFilter) {
      case "active":
        return filtered.filter((task) => !task.completed);
      case "completed":
        return filtered.filter((task) => task.completed);
      case "overdue":
        return filtered.filter((task) => {
          if (task.completed || !task.dueDate) return false;
          return new Date(task.dueDate) < today;
        });
      case "today":
        return filtered.filter((task) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= today && dueDate < tomorrow;
        });
      case "upcoming":
        return filtered.filter((task) => {
          if (task.completed || !task.dueDate) return false;
          return new Date(task.dueDate) >= tomorrow;
        });
      default:
        return filtered;
    }
  }, [tasks, searchQuery, activeFilter]);

  const handleAddTaskPress = useCallback(() => {
    router.push("/add-task");
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((filter: TaskFilter) => {
    setActiveFilter(filter);
  }, []);

  const handleAddTask = () => {
    router.push("./add-task");
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="My Tasks"
        rightAction={{
          label: "Add",
          onPress: handleAddTaskPress,
        }}
      />
      <ScreenTransition animationType="fade" style={styles.content}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search tasks..."
        />
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
        <TaskList tasks={filteredTasks} showEmptyState />
      </ScreenTransition>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.light.colors.surface,
  },
  content: {
    flex: 1,
    backgroundColor: Theme.light.colors.background,
  },
});
