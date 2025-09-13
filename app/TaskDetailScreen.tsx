import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { useTaskContext } from "../context/TaskContext";
import { Theme } from "../theme";
import { validateTaskDescription, validateTaskTitle } from "../utils/validators";

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { tasks, addTask, deleteTask } = useTaskContext();

  const [currentTask, setCurrentTask] = useState(tasks.find(task => task.id === id));
  const [title, setTitle] = useState(currentTask?.title || '');
  const [description, setDescription] = useState(currentTask?.description || '');
  const [titleError, setTitleError] = useState<string | undefined>(undefined);
  const [descriptionError, setDescriptionError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!currentTask) {
      Alert.alert("Error", "Task not found.");
      router.back();
    }
  }, [currentTask, router]);

  const handleSave = () => {
    if (!currentTask) return;

    const titleValidation = validateTaskTitle(title);
    const descriptionValidation = validateTaskDescription(description);

    setTitleError(titleValidation);
    setDescriptionError(descriptionValidation);

    if (titleValidation || descriptionValidation) {
      return;
    }

    // For simplicity, we'll re-add the task with updated details and delete the old one.
    // In a real app, you'd have an updateTask function in your context.
    deleteTask(currentTask.id);
    addTask(title, description);
    router.back();
  };

  const handleDelete = () => {
    if (!currentTask) return;
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => {
            deleteTask(currentTask.id);
            router.back();
          }, style: "destructive" },
      ]
    );
  };

  if (!currentTask) {
    return null; // Or a loading indicator
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.contentContainer}>
          <Input
            label="Title"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              setTitleError(validateTaskTitle(text));
            }}
            containerStyle={styles.inputField}
            error={titleError}
          />
          <Input
            label="Description"
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              setDescriptionError(validateTaskDescription(text));
            }}
            multiline
            numberOfLines={4}
            containerStyle={styles.inputField}
            error={descriptionError}
          />
          <View style={styles.buttonContainer}>
            <Button title="Save Changes" onPress={handleSave} variant="primary" />
            <Button title="Delete Task" onPress={handleDelete} variant="error" />
            <Button title="Back" onPress={() => router.back()} variant="secondary" />
          </View>
        </View>
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
  contentContainer: {
    flex: 1,
    padding: Theme.light.spacing.medium,
  },
  inputField: {
    marginBottom: Theme.light.spacing.medium,
  },
  buttonContainer: {
    marginTop: Theme.light.spacing.large,
    gap: Theme.light.spacing.small,
  },
});