import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { TaskList } from "../components/TaskList";
import { useTaskContext } from "../context/TaskContext";
import { Theme } from "../theme";

export default function Index() {
  const { tasks } = useTaskContext();

  const handleAddTask = () => {
    router.push("./add-task");
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header
        title={`Tasks (${completedCount}/${totalCount})`}
        rightAction={{
          label: "Add",
          onPress: handleAddTask,
        }}
        backgroundColor={Theme.light.colors.surface}
      />
      <View style={styles.content}>
        <TaskList />
      </View>
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
