import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import Header from "../components/Header";
import Input from "../components/Input";
import { useTaskContext } from "../context/TaskContext";
import { Theme } from "../theme";
import { validateTaskDescription, validateTaskTitle } from "../utils/validators";

export default function AddTaskScreen() {
    const { addTask } = useTaskContext();
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [titleError, setTitleError] = useState<string | undefined>(undefined);
    const [descriptionError, setDescriptionError] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddTask = async () => {
        const titleValidation = validateTaskTitle(newTaskTitle);
        const descriptionValidation = validateTaskDescription(newTaskDescription);

        setTitleError(titleValidation);
        setDescriptionError(descriptionValidation);

        if (titleValidation || descriptionValidation) {
            return;
        }

        try {
            setIsLoading(true);
            addTask(newTaskTitle, newTaskDescription);

            // Show success feedback
            Alert.alert("Success", "Task added successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to add task. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (newTaskTitle.trim() || newTaskDescription.trim()) {
            Alert.alert(
                "Discard Changes",
                "Are you sure you want to discard your changes?",
                [
                    { text: "Keep Editing", style: "cancel" },
                    { text: "Discard", style: "destructive", onPress: () => router.back() }
                ]
            );
        } else {
            router.back();
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <Header
                title="Add New Task"
                leftAction={{
                    label: "Cancel",
                    onPress: handleCancel,
                }}
                backgroundColor={Theme.light.colors.surface}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingContainer}
            >
                <View style={styles.formContainer}>
                    <Input
                        label="Task Title"
                        placeholder="Enter task title"
                        value={newTaskTitle}
                        onChangeText={(text) => {
                            setNewTaskTitle(text);
                            if (titleError) {
                                setTitleError(validateTaskTitle(text));
                            }
                        }}
                        onBlur={() => setTitleError(validateTaskTitle(newTaskTitle))}
                        containerStyle={styles.inputField}
                        error={titleError}
                        autoFocus
                    />

                    <Input
                        label="Description (Optional)"
                        placeholder="Enter task description"
                        value={newTaskDescription}
                        onChangeText={(text) => {
                            setNewTaskDescription(text);
                            if (descriptionError) {
                                setDescriptionError(validateTaskDescription(text));
                            }
                        }}
                        onBlur={() => setDescriptionError(validateTaskDescription(newTaskDescription))}
                        containerStyle={styles.inputField}
                        error={descriptionError}
                        multiline
                        numberOfLines={3}
                    />

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Add Task"
                            onPress={handleAddTask}
                            loading={isLoading}
                            disabled={!newTaskTitle.trim() || isLoading}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.light.colors.surface,
    },
    keyboardAvoidingContainer: {
        flex: 1,
        backgroundColor: Theme.light.colors.background,
    },
    formContainer: {
        flex: 1,
        padding: Theme.light.spacing.large,
    },
    inputField: {
        marginBottom: Theme.light.spacing.medium,
    },
    buttonContainer: {
        marginTop: Theme.light.spacing.large,
    },
});