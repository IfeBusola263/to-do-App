import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { TaskProvider } from '../context/TaskContext';
import HomeScreen from '../app/index';
import { SpeechState } from '../services/speechService';
import * as speechService from '../services/speechService';
import * as taskParser from '../services/taskParser';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  return {
    ...Reanimated,
    useSharedValue: jest.fn().mockImplementation((initialValue) => ({
      value: initialValue,
    })),
    useAnimatedStyle: jest.fn().mockImplementation((styleFunction) => styleFunction()),
    withSpring: jest.fn().mockImplementation((value) => value),
    withTiming: jest.fn().mockImplementation((value) => value),
    withSequence: jest.fn().mockImplementation((...values) => values[values.length - 1]),
    withRepeat: jest.fn().mockImplementation((value) => value),
    interpolate: jest.fn().mockImplementation((value: any) => value),
    runOnJS: jest.fn().mockImplementation((fn) => fn),
  };
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

// Mock speech service
jest.mock('../services/speechService', () => ({
  SpeechState: {
    IDLE: 'idle',
    LISTENING: 'listening',
    PROCESSING: 'processing',
    ERROR: 'error',
  },
  createSpeechService: jest.fn(),
}));

// Mock task parser
jest.mock('../services/taskParser', () => ({
  parseTasksFromSpeech: jest.fn(),
}));

// Mock permissions
jest.mock('../utils/permissions', () => ({
  requestMicrophonePermission: jest.fn().mockResolvedValue({
    granted: true,
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('Voice-to-Task Integration', () => {
  let mockSpeechService: any;
  let mockParseTasksFromSpeech: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock speech service
    mockSpeechService = {
      startListening: jest.fn(),
      stopListening: jest.fn(),
      isListening: jest.fn().mockReturnValue(false),
      getState: jest.fn().mockReturnValue(SpeechState.IDLE),
    };

    (speechService.createSpeechService as jest.Mock).mockReturnValue(mockSpeechService);
    
    mockParseTasksFromSpeech = taskParser.parseTasksFromSpeech as jest.Mock;
    mockParseTasksFromSpeech.mockReturnValue(['Buy milk', 'Call mom']);
  });

  const renderHomeScreen = () => {
    return render(
      <TaskProvider>
        <HomeScreen />
      </TaskProvider>
    );
  };

  describe('Voice FAB Integration', () => {
    it('should render voice FAB on home screen', () => {
      const { getAllByRole } = renderHomeScreen();
      
      const buttons = getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should open voice recorder when FAB is pressed', async () => {
      const { getAllByRole, queryByText } = renderHomeScreen();
      
      // Find and press the voice FAB (should be the last button)
      const buttons = getAllByRole('button');
      const voiceFAB = buttons[buttons.length - 1];
      
      fireEvent.press(voiceFAB);
      
      await waitFor(() => {
        expect(queryByText('Voice to Tasks')).toBeDefined();
      });
    });
  });

  describe('Voice Recording Workflow', () => {
    it('should complete full voice-to-task workflow', async () => {
      const { getAllByRole, getByText, queryByText } = renderHomeScreen();
      
      // 1. Open voice recorder
      const buttons = getAllByRole('button');
      const voiceFAB = buttons[buttons.length - 1];
      fireEvent.press(voiceFAB);

      await waitFor(() => {
        expect(queryByText('Voice to Tasks')).toBeDefined();
      });

      // 2. Start recording
      const startRecordingButton = getByText('Start Recording');
      fireEvent.press(startRecordingButton);

      expect(mockSpeechService.startListening).toHaveBeenCalled();

      // 3. Simulate speech recognition result
      const mockCallbacks = (speechService.createSpeechService as jest.Mock).mock.calls[0][0];
      
      // Simulate speech start
      mockCallbacks.onStart();
      
      // Simulate speech result
      mockCallbacks.onResult({
        transcript: 'Buy groceries and call mom',
        confidence: 0.95,
        isFinal: true,
      });

      // Simulate speech end
      mockCallbacks.onEnd();

      await waitFor(() => {
        expect(queryByText('Buy groceries and call mom')).toBeDefined();
      });

      // 4. Confirm transcript and create tasks
      const createTasksButton = getByText('Create Tasks');
      fireEvent.press(createTasksButton);

      await waitFor(() => {
        expect(mockParseTasksFromSpeech).toHaveBeenCalledWith('Buy groceries and call mom');
        expect(Alert.alert).toHaveBeenCalledWith(
          'Tasks Created!',
          expect.stringContaining('Created 2 tasks')
        );
      });
    });

    it('should handle recording errors gracefully', async () => {
      const { getAllByRole, getByText, queryByText } = renderHomeScreen();
      
      // Open voice recorder
      const buttons = getAllByRole('button');
      const voiceFAB = buttons[buttons.length - 1];
      fireEvent.press(voiceFAB);

      await waitFor(() => {
        expect(queryByText('Voice to Tasks')).toBeDefined();
      });

      // Start recording
      const startRecordingButton = getByText('Start Recording');
      fireEvent.press(startRecordingButton);

      // Simulate error
      const mockCallbacks = (speechService.createSpeechService as jest.Mock).mock.calls[0][0];
      mockCallbacks.onError(new Error('Microphone permission denied'));

      await waitFor(() => {
        expect(queryByText('Microphone permission denied')).toBeDefined();
      });
    });

    it('should handle task parsing failures', async () => {
      // Setup parser to return empty array
      mockParseTasksFromSpeech.mockReturnValue([]);

      const { getAllByRole, getByText, queryByText } = renderHomeScreen();
      
      // Open recorder and get transcript
      const buttons = getAllByRole('button');
      const voiceFAB = buttons[buttons.length - 1];
      fireEvent.press(voiceFAB);

      await waitFor(() => {
        expect(queryByText('Voice to Tasks')).toBeDefined();
      });

      // Simulate having a transcript
      const startRecordingButton = getByText('Start Recording');
      fireEvent.press(startRecordingButton);

      const mockCallbacks = (speechService.createSpeechService as jest.Mock).mock.calls[0][0];
      mockCallbacks.onResult({
        transcript: 'unclear speech',
        confidence: 0.95,
        isFinal: true,
      });
      mockCallbacks.onEnd();

      // Try to create tasks
      await waitFor(() => {
        const createTasksButton = getByText('Create Tasks');
        fireEvent.press(createTasksButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'No Tasks Found',
          expect.stringContaining('Could not extract any tasks')
        );
      });
    });
  });

  describe('Speech Service Integration', () => {
    it('should initialize speech service with correct callbacks', () => {
      renderHomeScreen();
      
      // Voice FAB should be rendered, speech service will be initialized when needed
      expect(speechService.createSpeechService).not.toHaveBeenCalled();
      
      // After opening voice recorder, speech service should be initialized
      const { getAllByRole } = renderHomeScreen();
      const buttons = getAllByRole('button');
      const voiceFAB = buttons[buttons.length - 1];
      fireEvent.press(voiceFAB);

      // Service should be initialized with callbacks
      expect(speechService.createSpeechService).toHaveBeenCalledWith({
        onStart: expect.any(Function),
        onResult: expect.any(Function),
        onEnd: expect.any(Function),
        onError: expect.any(Function),
      });
    });

    it('should handle speech state changes', async () => {
      const { getAllByRole, getByText, queryByText } = renderHomeScreen();
      
      const buttons = getAllByRole('button');
      const voiceFAB = buttons[buttons.length - 1];
      fireEvent.press(voiceFAB);

      await waitFor(() => {
        expect(queryByText('Voice to Tasks')).toBeDefined();
      });

      // Start recording
      fireEvent.press(getByText('Start Recording'));

      const mockCallbacks = (speechService.createSpeechService as jest.Mock).mock.calls[0][0];

      // Test state progression
      mockCallbacks.onStart();
      await waitFor(() => {
        expect(queryByText('Stop Recording')).toBeDefined();
      });

      mockCallbacks.onResult({
        transcript: 'partial result',
        confidence: 0.7,
        isFinal: false,
      });

      mockCallbacks.onResult({
        transcript: 'final result',
        confidence: 0.95,
        isFinal: true,
      });

      mockCallbacks.onEnd();
      await waitFor(() => {
        expect(queryByText('Start Recording')).toBeDefined();
      });
    });
  });

  describe('Task Parser Integration', () => {
    it('should parse multiple tasks from speech', async () => {
      mockParseTasksFromSpeech.mockReturnValue([
        'Buy groceries',
        'Call mom', 
        'Pick up dry cleaning'
      ]);

      const { getAllByRole, getByText, queryByText } = renderHomeScreen();
      
      // Complete workflow to task creation
      const buttons = getAllByRole('button');
      const voiceFAB = buttons[buttons.length - 1];
      fireEvent.press(voiceFAB);

      await waitFor(() => {
        expect(queryByText('Voice to Tasks')).toBeDefined();
      });

      fireEvent.press(getByText('Start Recording'));

      const mockCallbacks = (speechService.createSpeechService as jest.Mock).mock.calls[0][0];
      mockCallbacks.onResult({
        transcript: 'Buy groceries and call mom then pick up dry cleaning',
        confidence: 0.95,
        isFinal: true,
      });
      mockCallbacks.onEnd();

      await waitFor(() => {
        const createTasksButton = getByText('Create Tasks');
        fireEvent.press(createTasksButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Tasks Created!',
          'Created 3 tasks from your speech.'
        );
      });
    });

    it('should handle single task creation', async () => {
      mockParseTasksFromSpeech.mockReturnValue(['Buy groceries']);

      const { getAllByRole, getByText, queryByText } = renderHomeScreen();
      
      const buttons = getAllByRole('button');
      const voiceFAB = buttons[buttons.length - 1];
      fireEvent.press(voiceFAB);

      await waitFor(() => {
        expect(queryByText('Voice to Tasks')).toBeDefined();
      });

      fireEvent.press(getByText('Start Recording'));

      const mockCallbacks = (speechService.createSpeechService as jest.Mock).mock.calls[0][0];
      mockCallbacks.onResult({
        transcript: 'Buy groceries',
        confidence: 0.95,
        isFinal: true,
      });
      mockCallbacks.onEnd();

      await waitFor(() => {
        const createTasksButton = getByText('Create Tasks');
        fireEvent.press(createTasksButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Tasks Created!',
          'Created 1 task: "Buy groceries"'
        );
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle empty transcript gracefully', async () => {
      const { getAllByRole, getByText, queryByText } = renderHomeScreen();
      
      const buttons = getAllByRole('button');
      const voiceFAB = buttons[buttons.length - 1];
      fireEvent.press(voiceFAB);

      await waitFor(() => {
        expect(queryByText('Voice to Tasks')).toBeDefined();
      });

      // Try to create tasks with empty transcript
      fireEvent.press(getByText('Start Recording'));

      const mockCallbacks = (speechService.createSpeechService as jest.Mock).mock.calls[0][0];
      mockCallbacks.onEnd();

      // Should not show create tasks button without transcript
      expect(queryByText('Create Tasks')).toBeNull();
    });

    it('should handle task creation errors', async () => {
      const { getAllByRole, getByText, queryByText } = renderHomeScreen();
      
      // Mock task creation to fail
      mockParseTasksFromSpeech.mockImplementation(() => {
        throw new Error('Task creation failed');
      });

      const buttons = getAllByRole('button');
      const voiceFAB = buttons[buttons.length - 1];
      fireEvent.press(voiceFAB);

      await waitFor(() => {
        expect(queryByText('Voice to Tasks')).toBeDefined();
      });

      fireEvent.press(getByText('Start Recording'));

      const mockCallbacks = (speechService.createSpeechService as jest.Mock).mock.calls[0][0];
      mockCallbacks.onResult({
        transcript: 'Buy groceries',
        confidence: 0.95,
        isFinal: true,
      });
      mockCallbacks.onEnd();

      await waitFor(() => {
        const createTasksButton = getByText('Create Tasks');
        fireEvent.press(createTasksButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error Creating Tasks',
          expect.stringContaining('There was a problem creating your tasks')
        );
      });
    });
  });

  describe('Modal Management', () => {
    it('should close modal after successful task creation', async () => {
      const { getAllByRole, getByText, queryByText } = renderHomeScreen();
      
      const buttons = getAllByRole('button');
      const voiceFAB = buttons[buttons.length - 1];
      fireEvent.press(voiceFAB);

      await waitFor(() => {
        expect(queryByText('Voice to Tasks')).toBeDefined();
      });

      fireEvent.press(getByText('Start Recording'));

      const mockCallbacks = (speechService.createSpeechService as jest.Mock).mock.calls[0][0];
      mockCallbacks.onResult({
        transcript: 'Buy groceries',
        confidence: 0.95,
        isFinal: true,
      });
      mockCallbacks.onEnd();

      await waitFor(() => {
        const createTasksButton = getByText('Create Tasks');
        fireEvent.press(createTasksButton);
      });

      // Modal should close after successful creation
      await waitFor(() => {
        expect(queryByText('Voice to Tasks')).toBeNull();
      });
    });

    it('should close modal on cancel', async () => {
      const { getAllByRole, queryByText, getAllByRole: getAllByRoleAgain } = renderHomeScreen();
      
      const buttons = getAllByRole('button');
      const voiceFAB = buttons[buttons.length - 1];
      fireEvent.press(voiceFAB);

      await waitFor(() => {
        expect(queryByText('Voice to Tasks')).toBeDefined();
      });

      // Find and press cancel button
      const allButtons = getAllByRoleAgain('button');
      const cancelButton = allButtons[0]; // First button should be cancel
      fireEvent.press(cancelButton);

      await waitFor(() => {
        expect(queryByText('Voice to Tasks')).toBeNull();
      });
    });
  });
});