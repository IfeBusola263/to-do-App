import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Input from "../../components/Input";
import { useTaskContext } from "../../context/TaskContext";
import { Theme } from "../../theme";
import { validateTaskDescription, validateTaskTitle } from "../../utils/validators";

export default function TaskDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { tasks, updateTask, deleteTask, loading } = useTaskContext();

    const [currentTask, setCurrentTask] = useState(tasks.find(task => task.id === id));
    const [title, setTitle] = useState(currentTask?.title || '');
    const [description, setDescription] = useState(currentTask?.description || '');
    const [titleError, setTitleError] = useState<string | undefined>(undefined);
    const [descriptionError, setDescriptionError] = useState<string | undefined>(undefined);
    const [hasChanges, setHasChanges] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Update current task when tasks change
    useEffect(() => {
        const updatedTask = tasks.find(task => task.id === id);
        setCurrentTask(updatedTask);
    }, [tasks, id]);

    // Initialize form when task is found
    useEffect(() => {
        if (currentTask) {
            setTitle(currentTask.title);
            setDescription(currentTask.description || '');
        }
    }, [currentTask]);

    // Track changes
    useEffect(() => {
        if (currentTask) {
            const titleChanged = title !== currentTask.title;
            const descriptionChanged = description !== (currentTask.description || '');
            setHasChanges(titleChanged || descriptionChanged);
        }
    }, [title, description, currentTask]);

    useEffect(() => {
        if (!currentTask && !loading) {
            Alert.alert("Error", "Task not found.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        }
    }, [currentTask, loading, router]);

    const handleSave = useCallback(async () => {
        if (!currentTask) return;

        const titleValidation = validateTaskTitle(title);
        const descriptionValidation = validateTaskDescription(description);

        setTitleError(titleValidation);
        setDescriptionError(descriptionValidation);

        if (titleValidation || descriptionValidation) {
            return;
        }

        try {
            await updateTask(currentTask.id, title, description);
            Alert.alert("Success", "Task updated successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to update task. Please try again.");
        }
    }, [currentTask, title, description, updateTask, router]);

    const handleDelete = useCallback(async () => {
        if (!currentTask) return;

        Alert.alert(
            "Delete Task",
            `Are you sure you want to delete "${currentTask.title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            setIsDeleting(true);
                            await deleteTask(currentTask.id);
                            router.back();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete task. Please try again.");
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                    style: "destructive"
                },
            ]
        );
    }, [currentTask, deleteTask, router]);

    const handleBack = useCallback(() => {
        if (hasChanges) {
            Alert.alert(
                "Unsaved Changes",
                "You have unsaved changes. Are you sure you want to go back?",
                [
                    { text: "Keep Editing", style: "cancel" },
                    { text: "Discard", onPress: () => router.back(), style: "destructive" }
                ]
            );
        } else {
            router.back();
        }
    }, [hasChanges, router]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Theme.light.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!currentTask) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <Header
                title="Task Details"
                leftAction={{
                    label: "Back",
                    onPress: handleBack,
                }}
                rightAction={hasChanges ? {
                    label: "Save",
                    onPress: handleSave,
                } : undefined}
                backgroundColor={Theme.light.colors.surface}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingContainer}
            >
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentContainer}>
                        <Input
                            label="Title"
                            value={title}
                            onChangeText={(text) => {
                                setTitle(text);
                                if (titleError) {
                                    setTitleError(validateTaskTitle(text));
                                }
                            }}
                            onBlur={() => setTitleError(validateTaskTitle(title))}
                            containerStyle={styles.inputField}
                            error={titleError}
                        />
                        <Input
                            label="Description (Optional)"
                            value={description}
                            onChangeText={(text) => {
                                setDescription(text);
                                if (descriptionError) {
                                    setDescriptionError(validateTaskDescription(text));
                                }
                            }}
                            onBlur={() => setDescriptionError(validateTaskDescription(description))}
                            multiline
                            numberOfLines={4}
                            containerStyle={styles.inputField}
                            error={descriptionError}
                        />
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Save Changes"
                                onPress={handleSave}
                                disabled={!hasChanges || !!titleError || !!descriptionError}
                            />
                            <Button
                                title={isDeleting ? "Deleting..." : "Delete Task"}
                                onPress={handleDelete}
                                variant="error"
                                loading={isDeleting}
                                disabled={isDeleting}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.light.colors.surface,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.light.colors.background,
    },
    keyboardAvoidingContainer: {
        flex: 1,
        backgroundColor: Theme.light.colors.background,
    },
    scrollView: {
        flex: 1,
        backgroundColor: Theme.light.colors.background,
    },
    contentContainer: {
        padding: Theme.light.spacing.large,
        paddingBottom: Theme.light.spacing.xxLarge,
    },
    inputField: {
        marginBottom: Theme.light.spacing.medium,
    },
    buttonContainer: {
        marginTop: Theme.light.spacing.large,
        gap: Theme.light.spacing.medium,
    },
});