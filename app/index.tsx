import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, View } from "react-native";
import Button from "../components/Button";
import Input from "../components/Input";
import { TaskList } from "../components/TaskList";
import { useTaskContext } from "../context/TaskContext";
import { Theme } from "../theme";
import { validateTaskTitle, validateTaskDescription } from "../utils/validators";

export default function Index() {
  const { addTask } = useTaskContext();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [titleError, setTitleError] = useState<string | undefined>(undefined);
  const [descriptionError, setDescriptionError] = useState<string | undefined>(undefined);

  const handleAddTask = () => {
    const titleValidation = validateTaskTitle(newTaskTitle);
    const descriptionValidation = validateTaskDescription(newTaskDescription);

    setTitleError(titleValidation);
    setDescriptionError(descriptionValidation);

    if (titleValidation || descriptionValidation) {
      return;
    }

    addTask(newTaskTitle, newTaskDescription);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setTitleError(undefined);
    setDescriptionError(undefined);
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
            onChangeText={(text) => {
              setNewTaskTitle(text);
              setTitleError(validateTaskTitle(text));
            }}
            containerStyle={styles.inputField}
            error={titleError}
          />
          <Input
            label="Description (Optional)"
            placeholder="Enter task description"
            value={newTaskDescription}
            onChangeText={(text) => {
              setNewTaskDescription(text);
              setDescriptionError(validateTaskDescription(text));
            }}
            containerStyle={styles.inputField}
            error={descriptionError}
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
    borderBottomColor: Theme.light.colors.accent,
    marginBottom: Theme.light.spacing.medium,
  },
  inputField: {
    marginBottom: Theme.light.spacing.small,
  },
});
