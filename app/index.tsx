import React, { useState } from "react";
import { StyleSheet, View, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { TaskList } from "../components/TaskList";
import { useTaskContext } from "../context/TaskContext";
import { Theme } from "../theme";

export default function Index() {
  const { addTask } = useTaskContext();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") {
      Alert.alert("Error", "Task title cannot be empty.");
      return;
    }
    addTask(newTaskTitle, newTaskDescription);
    setNewTaskTitle("");
    setNewTaskDescription("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.inputContainer}>
          <Input
            label="Task Title"
            placeholder="Enter new task title"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            containerStyle={styles.inputField}
          />
          <Input
            label="Description (Optional)"
            placeholder="Enter task description"
            value={newTaskDescription}
            onChangeText={setNewTaskDescription}
            containerStyle={styles.inputField}
          />
          <Button title="Add Task" onPress={handleAddTask} />
        </View>
        <TaskList />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.light.colors.background,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  inputContainer: {
    padding: Theme.light.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: Theme.light.colors.border,
    marginBottom: Theme.light.spacing.medium,
  },
  inputField: {
    marginBottom: Theme.light.spacing.small,
  },
});
