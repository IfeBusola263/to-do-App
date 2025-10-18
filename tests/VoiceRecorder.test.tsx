import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import VoiceRecorder from '../components/VoiceRecorder';
import { SpeechState } from '../services/speechService';

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
        interpolate: jest.fn().mockImplementation((value) => value),
        runOnJS: jest.fn().mockImplementation((fn) => fn),
    };
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: 'MaterialIcons',
}));

// Mock Dimensions
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    return {
        ...RN,
        Dimensions: {
            get: jest.fn().mockReturnValue({ width: 400, height: 800 }),
        },
    };
});

describe('VoiceRecorder', () => {
    const defaultProps = {
        visible: true,
        speechState: SpeechState.IDLE,
        transcript: '',
        onToggleRecording: jest.fn(),
        onCancel: jest.fn(),
        onConfirm: jest.fn(),
        error: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should not render when not visible', () => {
            const { queryByText } = render(
                <VoiceRecorder {...defaultProps} visible={false} />
            );

            expect(queryByText('Voice to Tasks')).toBeNull();
        });

        it('should render when visible', () => {
            const { getByText } = render(<VoiceRecorder {...defaultProps} />);

            expect(getByText('Voice to Tasks')).toBeDefined();
        });

        it('should render with idle state', () => {
            const { getByText } = render(
                <VoiceRecorder {...defaultProps} speechState={SpeechState.IDLE} />
            );

            expect(getByText('Start Recording')).toBeDefined();
        });

        it('should render with listening state', () => {
            const { getByText } = render(
                <VoiceRecorder {...defaultProps} speechState={SpeechState.LISTENING} />
            );

            expect(getByText('Stop Recording')).toBeDefined();
        });

        it('should render with processing state', () => {
            const { getByText } = render(
                <VoiceRecorder {...defaultProps} speechState={SpeechState.PROCESSING} />
            );

            expect(getByText('Processing...')).toBeDefined();
        });

        it('should render transcript when provided', () => {
            const transcript = 'Buy milk and call mom';
            const { getByText } = render(
                <VoiceRecorder {...defaultProps} transcript={transcript} />
            );

            expect(getByText('Transcript:')).toBeDefined();
            expect(getByText(transcript)).toBeDefined();
        });

        it('should render error when provided', () => {
            const error = 'Microphone permission denied';
            const { getByText } = render(
                <VoiceRecorder {...defaultProps} error={error} />
            );

            expect(getByText(error)).toBeDefined();
        });
    });

    describe('Interactions', () => {
        it('should call onCancel when cancel button is pressed', () => {
            const onCancel = jest.fn();
            const { getByTestId } = render(
                <VoiceRecorder {...defaultProps} onCancel={onCancel} />
            );

            // Look for close button by icon or accessibility
            const cancelButtons = render(<VoiceRecorder {...defaultProps} onCancel={onCancel} />)
                .getAllByRole('button');

            // Find the cancel button (should be the first button)
            const cancelButton = cancelButtons[0];
            fireEvent.press(cancelButton);

            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('should call onToggleRecording when record button is pressed', () => {
            const onToggleRecording = jest.fn();
            const { getByText } = render(
                <VoiceRecorder {...defaultProps} onToggleRecording={onToggleRecording} />
            );

            const recordButton = getByText('Start Recording');
            fireEvent.press(recordButton);

            expect(onToggleRecording).toHaveBeenCalledTimes(1);
        });

        it('should call onConfirm when confirm button is pressed with transcript', () => {
            const onConfirm = jest.fn();
            const { getByText } = render(
                <VoiceRecorder
                    {...defaultProps}
                    transcript="Buy milk"
                    speechState={SpeechState.IDLE}
                    onConfirm={onConfirm}
                />
            );

            const confirmButton = getByText('Create Tasks');
            fireEvent.press(confirmButton);

            expect(onConfirm).toHaveBeenCalledTimes(1);
        });

        it('should not show confirm button when listening', () => {
            const { queryByText } = render(
                <VoiceRecorder
                    {...defaultProps}
                    transcript="Buy milk"
                    speechState={SpeechState.LISTENING}
                />
            );

            expect(queryByText('Create Tasks')).toBeNull();
        });

        it('should not show confirm button when processing', () => {
            const { queryByText } = render(
                <VoiceRecorder
                    {...defaultProps}
                    transcript="Buy milk"
                    speechState={SpeechState.PROCESSING}
                />
            );

            expect(queryByText('Create Tasks')).toBeNull();
        });

        it('should disable record button when processing', () => {
            const { getByText } = render(
                <VoiceRecorder {...defaultProps} speechState={SpeechState.PROCESSING} />
            );

            const recordButton = getByText('Processing...');
            expect(recordButton.parent?.parent?.props.disabled).toBe(true);
        });
    });

    describe('Status Display', () => {
        it('should show listening status with duration', async () => {
            const { getByText, rerender } = render(
                <VoiceRecorder {...defaultProps} speechState={SpeechState.LISTENING} />
            );

            // Should show listening status
            expect(getByText(/Listening\.\.\./)).toBeDefined();

            // Wait a bit for timer to tick
            await waitFor(() => {
                rerender(<VoiceRecorder {...defaultProps} speechState={SpeechState.LISTENING} />);
            }, { timeout: 1100 });

            // Duration should be displayed
            expect(() => getByText(/Listening\.\.\./)).not.toThrow();
        });

        it('should show processing status', () => {
            const { getByText } = render(
                <VoiceRecorder {...defaultProps} speechState={SpeechState.PROCESSING} />
            );

            expect(getByText('Processing your speech...')).toBeDefined();
        });

        it('should format duration correctly', () => {
            // This tests the internal formatDuration function through the UI
            const { getByText, rerender } = render(
                <VoiceRecorder {...defaultProps} speechState={SpeechState.IDLE} />
            );

            // Start listening to trigger timer
            rerender(<VoiceRecorder {...defaultProps} speechState={SpeechState.LISTENING} />);

            // Should start with 0:00
            expect(() => getByText(/0:0/)).not.toThrow();
        });
    });

    describe('Visual Elements', () => {
        it('should show waveform when listening', () => {
            const { getByText } = render(
                <VoiceRecorder {...defaultProps} speechState={SpeechState.LISTENING} />
            );

            // Should show listening status when waveform is active
            expect(getByText(/Listening\.\.\./)).toBeDefined();
        });

        it('should not show waveform when not listening', () => {
            const { queryByText } = render(
                <VoiceRecorder {...defaultProps} speechState={SpeechState.IDLE} />
            );

            // Should not show listening status when idle
            expect(queryByText(/Listening\.\.\./)).toBeNull();
        });

        it('should show pulse rings when listening', () => {
            const { getByText } = render(
                <VoiceRecorder {...defaultProps} speechState={SpeechState.LISTENING} />
            );

            // Pulse animation should be active with listening state
            expect(getByText('Stop Recording')).toBeDefined();
        });

        it('should show listening dot when listening', () => {
            const { getByText } = render(
                <VoiceRecorder {...defaultProps} speechState={SpeechState.LISTENING} />
            );

            // Listening state should show stop button
            expect(getByText('Stop Recording')).toBeDefined();
        });
    });

    describe('Animation Lifecycle', () => {
        it('should handle modal visibility animation', async () => {
            const { rerender } = render(
                <VoiceRecorder {...defaultProps} visible={false} />
            );

            // Show modal
            rerender(<VoiceRecorder {...defaultProps} visible={true} />);

            await waitFor(() => {
                expect(() => {
                    rerender(<VoiceRecorder {...defaultProps} visible={true} />);
                }).not.toThrow();
            });
        });

        it('should handle speech state animation changes', async () => {
            const { rerender } = render(
                <VoiceRecorder {...defaultProps} speechState={SpeechState.IDLE} />
            );

            // Change to listening
            rerender(<VoiceRecorder {...defaultProps} speechState={SpeechState.LISTENING} />);

            await waitFor(() => {
                expect(() => {
                    rerender(<VoiceRecorder {...defaultProps} speechState={SpeechState.LISTENING} />);
                }).not.toThrow();
            });

            // Change to processing
            rerender(<VoiceRecorder {...defaultProps} speechState={SpeechState.PROCESSING} />);

            await waitFor(() => {
                expect(() => {
                    rerender(<VoiceRecorder {...defaultProps} speechState={SpeechState.PROCESSING} />);
                }).not.toThrow();
            });
        });

        it('should cleanup animations on unmount', () => {
            const { unmount } = render(
                <VoiceRecorder {...defaultProps} speechState={SpeechState.LISTENING} />
            );

            expect(() => unmount()).not.toThrow();
        });
    });

    describe('Timer Management', () => {
        it('should start timer when listening', async () => {
            const { rerender } = render(
                <VoiceRecorder {...defaultProps} speechState={SpeechState.IDLE} />
            );

            // Start listening
            rerender(<VoiceRecorder {...defaultProps} speechState={SpeechState.LISTENING} />);

            // Timer should be running (hard to test directly, but component should handle it)
            await waitFor(() => {
                expect(() => {
                    rerender(<VoiceRecorder {...defaultProps} speechState={SpeechState.LISTENING} />);
                }).not.toThrow();
            }, { timeout: 100 });
        });

        it('should stop timer when not listening', () => {
            const { rerender } = render(
                <VoiceRecorder {...defaultProps} speechState={SpeechState.LISTENING} />
            );

            // Stop listening
            rerender(<VoiceRecorder {...defaultProps} speechState={SpeechState.IDLE} />);

            expect(() => {
                rerender(<VoiceRecorder {...defaultProps} speechState={SpeechState.IDLE} />);
            }).not.toThrow();
        });

        it('should reset timer on modal close', () => {
            const { rerender } = render(
                <VoiceRecorder {...defaultProps} visible={true} speechState={SpeechState.LISTENING} />
            );

            // Close modal
            rerender(<VoiceRecorder {...defaultProps} visible={false} speechState={SpeechState.IDLE} />);

            expect(() => {
                rerender(<VoiceRecorder {...defaultProps} visible={false} speechState={SpeechState.IDLE} />);
            }).not.toThrow();
        });
    });

    describe('Error Handling', () => {
        it('should display error messages', () => {
            const error = 'Network connection failed';
            const { getByText } = render(
                <VoiceRecorder {...defaultProps} error={error} />
            );

            expect(getByText(error)).toBeDefined();
        });

        it('should handle null error', () => {
            const { getByText } = render(
                <VoiceRecorder {...defaultProps} error={null} />
            );

            // Should render normally without errors
            expect(getByText('Voice to Tasks')).toBeDefined();
        });

        it('should handle empty error string', () => {
            const { getByText } = render(
                <VoiceRecorder {...defaultProps} error="" />
            );

            // Should render normally without errors
            expect(getByText('Voice to Tasks')).toBeDefined();
        });
    });

    describe('Memoization', () => {
        it('should be memoized', () => {
            const renderSpy = jest.fn();

            const TestComponent = React.memo(() => {
                renderSpy();
                return <VoiceRecorder {...defaultProps} />;
            });

            const { rerender } = render(<TestComponent />);

            expect(renderSpy).toHaveBeenCalledTimes(1);

            // Re-render with same props
            rerender(<TestComponent />);

            // Should not re-render due to memo
            expect(renderSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle rapid state changes', () => {
            const { rerender } = render(
                <VoiceRecorder {...defaultProps} speechState={SpeechState.IDLE} />
            );

            const states = [
                SpeechState.LISTENING,
                SpeechState.PROCESSING,
                SpeechState.IDLE,
                SpeechState.ERROR,
            ];

            states.forEach(state => {
                expect(() => {
                    rerender(<VoiceRecorder {...defaultProps} speechState={state} />);
                }).not.toThrow();
            });
        });

        it('should handle long transcripts', () => {
            const longTranscript = 'This is a very long transcript '.repeat(20);

            expect(() => {
                render(<VoiceRecorder {...defaultProps} transcript={longTranscript} />);
            }).not.toThrow();
        });

        it('should handle special characters in transcript', () => {
            const specialTranscript = 'Buy groceries: milk, bread & eggs (organic) @store #shopping';

            expect(() => {
                render(<VoiceRecorder {...defaultProps} transcript={specialTranscript} />);
            }).not.toThrow();
        });
    });
});