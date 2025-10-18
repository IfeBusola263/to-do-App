import { router } from "expo-router";
import React, { useCallback, useMemo, useState, useRef } from "react";
import { StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FilterBar, { TaskFilter } from "../components/FilterBar";
import Header from "../components/Header";
import ScreenTransition from "../components/ScreenTransition";
import SearchBar from "../components/SearchBar";
import { TaskList } from "../components/TaskList";
import VoiceFAB from "../components/VoiceFAB";
import VoiceRecorder from "../components/VoiceRecorder";
import { useTaskContext } from "../context/TaskContext";
import { Theme } from "../theme";
import { SpeechService, SpeechState, createSpeechService } from "../services/speechService";
import { parseTasksFromSpeech } from "../services/taskParser";

export default function HomeScreen() {
  const { tasks, addTask } = useTaskContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("all");
  
  // Voice recording state
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [speechState, setSpeechState] = useState<SpeechState>(SpeechState.IDLE);
  const [transcript, setTranscript] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const speechServiceRef = useRef<SpeechService | null>(null);

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
          const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
          return dueDate < today;
        });
      case "today":
        return filtered.filter((task) => {
          if (!task.dueDate) return false;
          const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
          return dueDate >= today && dueDate < tomorrow;
        });
      case "upcoming":
        return filtered.filter((task) => {
          if (task.completed || !task.dueDate) return false;
          const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
          return dueDate >= tomorrow;
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

  // Initialize speech service
  const initializeSpeechService = useCallback(() => {
    if (!speechServiceRef.current) {
      speechServiceRef.current = createSpeechService({
        onStart: () => {
          setSpeechState(SpeechState.LISTENING);
          setSpeechError(null);
        },
        onResult: (result) => {
          setTranscript(result.transcript);
          if (result.isFinal) {
            setSpeechState(SpeechState.PROCESSING);
          }
        },
        onEnd: () => {
          setSpeechState(SpeechState.IDLE);
        },
        onError: (error) => {
          setSpeechState(SpeechState.ERROR);
          setSpeechError(error.message);
          console.error('Speech recognition error:', error);
        },
      });
    }
    return speechServiceRef.current;
  }, []);

  // Voice recording handlers
  const handleVoiceFABPress = useCallback(() => {
    setShowVoiceRecorder(true);
    setTranscript("");
    setSpeechError(null);
    setSpeechState(SpeechState.IDLE);
  }, []);

  const handleToggleRecording = useCallback(async () => {
    const speechService = initializeSpeechService();
    
    try {
      if (speechState === SpeechState.LISTENING) {
        // Stop recording
        await speechService.stopListening();
      } else {
        // Start recording
        setTranscript("");
        setSpeechError(null);
        await speechService.startListening();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle recording';
      setSpeechError(errorMessage);
      setSpeechState(SpeechState.ERROR);
    }
  }, [speechState, initializeSpeechService]);

  const handleCancelVoiceRecording = useCallback(() => {
    const speechService = speechServiceRef.current;
    if (speechService && speechService.isListening()) {
      speechService.stopListening().catch(console.error);
    }
    
    setShowVoiceRecorder(false);
    setTranscript("");
    setSpeechError(null);
    setSpeechState(SpeechState.IDLE);
  }, []);

  const handleConfirmTranscript = useCallback(async () => {
    if (!transcript.trim()) {
      Alert.alert('No Speech Detected', 'Please try recording again.');
      return;
    }

    try {
      // Parse the transcript into multiple tasks
      const parsedTasks = parseTasksFromSpeech(transcript);
      
      if (parsedTasks.length === 0) {
        Alert.alert('No Tasks Found', 'Could not extract any tasks from your speech. Please try again.');
        return;
      }

      // Add each task to the context
      const taskPromises = parsedTasks.map(taskTitle => 
        addTask(taskTitle.trim())
      );

      await Promise.all(taskPromises);

      // Show success message
      const taskCount = parsedTasks.length;
      const message = taskCount === 1 
        ? `Created 1 task: "${parsedTasks[0]}"`
        : `Created ${taskCount} tasks from your speech.`;
      
      Alert.alert('Tasks Created!', message);

      // Close the recorder
      setShowVoiceRecorder(false);
      setTranscript("");
      setSpeechState(SpeechState.IDLE);
      
    } catch (error) {
      console.error('Error creating tasks from speech:', error);
      Alert.alert(
        'Error Creating Tasks',
        'There was a problem creating your tasks. Please try again.'
      );
    }
  }, [transcript, addTask]);

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
        
        {/* Voice FAB */}
        <VoiceFAB
          onPress={handleVoiceFABPress}
          isListening={speechState === SpeechState.LISTENING}
          disabled={false}
          bottom={20}
          right={20}
        />
        
        {/* Voice Recorder Modal */}
        <VoiceRecorder
          visible={showVoiceRecorder}
          speechState={speechState}
          transcript={transcript}
          onToggleRecording={handleToggleRecording}
          onCancel={handleCancelVoiceRecording}
          onConfirm={handleConfirmTranscript}
          error={speechError}
        />
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
