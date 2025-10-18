import { MaterialIcons } from '@expo/vector-icons';
import React, { memo, useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { SpeechState } from '../services/speechService';
import { Theme } from '../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Voice recorder component props
 */
interface VoiceRecorderProps {
    /** Whether the recorder modal is visible */
    visible: boolean;
    /** Current speech recognition state */
    speechState: SpeechState;
    /** Partial or final transcript text */
    transcript?: string;
    /** Callback when user wants to start/stop recording */
    onToggleRecording: () => void;
    /** Callback when user cancels recording */
    onCancel: () => void;
    /** Callback when user confirms the transcript */
    onConfirm: () => void;
    /** Error message to display */
    error?: string | null;
}

/**
 * Voice Recorder Modal Component
 * 
 * A full-screen modal interface for voice recording with real-time visual feedback.
 * Provides intuitive controls for starting/stopping recording, showing transcripts,
 * and handling errors gracefully.
 * 
 * @param props - VoiceRecorder component props
 * 
 * @example
 * ```tsx
 * <VoiceRecorder
 *   visible={showRecorder}
 *   speechState={speechState}
 *   transcript={currentTranscript}
 *   onToggleRecording={() => toggleRecording()}
 *   onCancel={() => setShowRecorder(false)}
 *   onConfirm={() => handleConfirmTranscript()}
 * />
 * ```
 */
export const VoiceRecorder: React.FC<VoiceRecorderProps> = memo(({
    visible,
    speechState,
    transcript = '',
    onToggleRecording,
    onCancel,
    onConfirm,
    error,
}) => {
    // Animation values
    const modalScale = useSharedValue(0);
    const microphoneScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0);
    const waveformScale = useSharedValue(1);

    // Local state
    const [recordingDuration, setRecordingDuration] = useState(0);

    // Handle modal visibility animations
    useEffect(() => {
        if (visible) {
            modalScale.value = withSpring(1, { damping: 20, stiffness: 300 });
        } else {
            modalScale.value = withTiming(0, { duration: 200 });
            setRecordingDuration(0);
        }
    }, [visible, modalScale]);

    // Handle speech state animations
    useEffect(() => {
        switch (speechState) {
            case SpeechState.LISTENING:
                // Start listening animations
                microphoneScale.value = withRepeat(
                    withSequence(
                        withTiming(1.2, { duration: 800 }),
                        withTiming(1, { duration: 800 })
                    ),
                    -1,
                    false
                );
                pulseOpacity.value = withRepeat(
                    withSequence(
                        withTiming(0.8, { duration: 800 }),
                        withTiming(0.2, { duration: 800 })
                    ),
                    -1,
                    false
                );
                waveformScale.value = withRepeat(
                    withSequence(
                        withTiming(1.5, { duration: 600 }),
                        withTiming(0.8, { duration: 600 })
                    ),
                    -1,
                    false
                );
                break;

            case SpeechState.PROCESSING:
                // Processing animations
                microphoneScale.value = withTiming(1, { duration: 300 });
                pulseOpacity.value = withTiming(0.4, { duration: 300 });
                waveformScale.value = withRepeat(
                    withTiming(1.2, { duration: 1000 }),
                    -1,
                    true
                );
                break;

            case SpeechState.IDLE:
            case SpeechState.ERROR:
            default:
                // Stop all animations
                microphoneScale.value = withTiming(1, { duration: 300 });
                pulseOpacity.value = withTiming(0, { duration: 300 });
                waveformScale.value = withTiming(1, { duration: 300 });
                break;
        }
    }, [speechState, microphoneScale, pulseOpacity, waveformScale]);

    // Recording duration timer
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;

        if (speechState === SpeechState.LISTENING) {
            interval = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } else {
            setRecordingDuration(0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [speechState]);

    // Format recording duration
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get appropriate button text and color
    const getRecordingButtonConfig = () => {
        switch (speechState) {
            case SpeechState.LISTENING:
                return {
                    text: 'Stop Recording',
                    icon: 'stop' as const,
                    color: Theme.light.colors.error,
                };
            case SpeechState.PROCESSING:
                return {
                    text: 'Processing...',
                    icon: 'hourglass-empty' as const,
                    color: Theme.light.colors.warning,
                };
            default:
                return {
                    text: 'Start Recording',
                    icon: 'mic' as const,
                    color: Theme.light.colors.primary,
                };
        }
    };

    const buttonConfig = getRecordingButtonConfig();
    const isListening = speechState === SpeechState.LISTENING;
    const isProcessing = speechState === SpeechState.PROCESSING;
    const hasTranscript = transcript.length > 0;
    const hasError = !!error;

    // Animated styles
    const animatedModalStyle = useAnimatedStyle(() => ({
        transform: [{ scale: modalScale.value }],
        opacity: modalScale.value,
    }));

    const animatedMicrophoneStyle = useAnimatedStyle(() => ({
        transform: [{ scale: microphoneScale.value }],
    }));

    const animatedPulseStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value,
        transform: [{ scale: interpolate(pulseOpacity.value, [0, 1], [0.5, 1.5]) }],
    }));

    const animatedWaveformStyle = useAnimatedStyle(() => ({
        transform: [{ scaleX: waveformScale.value }],
    }));

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
        >
            <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />

            <View style={styles.overlay}>
                <Animated.View style={[styles.container, animatedModalStyle]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onCancel}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color={Theme.light.colors.text}
                            />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>Voice to Tasks</Text>

                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Status Section */}
                    <View style={styles.statusSection}>
                        {isListening && (
                            <Text style={styles.statusText}>
                                Listening... {formatDuration(recordingDuration)}
                            </Text>
                        )}

                        {isProcessing && (
                            <Text style={styles.statusText}>
                                Processing your speech...
                            </Text>
                        )}

                        {hasError && (
                            <Text style={styles.errorText}>{error}</Text>
                        )}
                    </View>

                    {/* Microphone Visual */}
                    <View style={styles.microphoneSection}>
                        {/* Pulse rings */}
                        <Animated.View style={[styles.pulseRing, styles.pulseRing1, animatedPulseStyle]} />
                        <Animated.View style={[styles.pulseRing, styles.pulseRing2, animatedPulseStyle]} />

                        {/* Main microphone */}
                        <Animated.View style={[styles.microphoneContainer, animatedMicrophoneStyle]}>
                            <MaterialIcons
                                name="mic"
                                size={64}
                                color={isListening ? Theme.light.colors.accent : Theme.light.colors.primary}
                            />
                        </Animated.View>
                    </View>

                    {/* Waveform Visualization */}
                    {isListening && (
                        <View style={styles.waveformContainer}>
                            <Animated.View style={[styles.waveform, animatedWaveformStyle]}>
                                {Array.from({ length: 20 }, (_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.waveformBar,
                                            {
                                                height: Math.random() * 30 + 10,
                                                backgroundColor: Theme.light.colors.accent,
                                            },
                                        ]}
                                    />
                                ))}
                            </Animated.View>
                        </View>
                    )}

                    {/* Transcript Section */}
                    {hasTranscript && (
                        <View style={styles.transcriptSection}>
                            <Text style={styles.transcriptLabel}>Transcript:</Text>
                            <Text style={styles.transcriptText}>{transcript}</Text>
                        </View>
                    )}

                    {/* Controls */}
                    <View style={styles.controls}>
                        <TouchableOpacity
                            style={[
                                styles.recordButton,
                                { backgroundColor: buttonConfig.color },
                                isProcessing && styles.disabledButton,
                            ]}
                            onPress={onToggleRecording}
                            disabled={isProcessing}
                        >
                            <MaterialIcons
                                name={buttonConfig.icon}
                                size={32}
                                color={Theme.light.colors.background}
                            />
                            <Text style={styles.recordButtonText}>{buttonConfig.text}</Text>
                        </TouchableOpacity>

                        {hasTranscript && !isListening && !isProcessing && (
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={onConfirm}
                            >
                                <MaterialIcons
                                    name="check"
                                    size={24}
                                    color={Theme.light.colors.background}
                                />
                                <Text style={styles.confirmButtonText}>Create Tasks</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
});

VoiceRecorder.displayName = 'VoiceRecorder';

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: SCREEN_WIDTH * 0.9,
        maxWidth: 400,
        backgroundColor: Theme.light.colors.background,
        borderRadius: Theme.light.borderRadius.large,
        padding: Theme.light.spacing.large,
        alignItems: 'center',
        ...Theme.light.shadows.large,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: Theme.light.spacing.large,
    },
    cancelButton: {
        padding: Theme.light.spacing.small,
    },
    headerTitle: {
        ...Theme.light.typography.h3,
        color: Theme.light.colors.text,
    },
    headerSpacer: {
        width: 40, // Same as cancel button width
    },
    statusSection: {
        alignItems: 'center',
        marginBottom: Theme.light.spacing.large,
        minHeight: 24,
    },
    statusText: {
        ...Theme.light.typography.body,
        color: Theme.light.colors.textSecondary,
        textAlign: 'center',
    },
    errorText: {
        ...Theme.light.typography.body,
        color: Theme.light.colors.error,
        textAlign: 'center',
    },
    microphoneSection: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        width: 200,
        marginBottom: Theme.light.spacing.large,
    },
    pulseRing: {
        position: 'absolute',
        borderRadius: 100,
        backgroundColor: Theme.light.colors.accent,
    },
    pulseRing1: {
        width: 160,
        height: 160,
    },
    pulseRing2: {
        width: 200,
        height: 200,
    },
    microphoneContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Theme.light.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        ...Theme.light.shadows.medium,
    },
    waveformContainer: {
        width: '80%',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Theme.light.spacing.large,
    },
    waveform: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
    },
    waveformBar: {
        width: 3,
        borderRadius: 2,
        marginHorizontal: 1,
    },
    transcriptSection: {
        width: '100%',
        backgroundColor: Theme.light.colors.surface,
        borderRadius: Theme.light.borderRadius.medium,
        padding: Theme.light.spacing.medium,
        marginBottom: Theme.light.spacing.large,
    },
    transcriptLabel: {
        ...Theme.light.typography.bodySmall,
        color: Theme.light.colors.textSecondary,
        marginBottom: Theme.light.spacing.small,
    },
    transcriptText: {
        ...Theme.light.typography.body,
        color: Theme.light.colors.text,
    },
    controls: {
        width: '100%',
        gap: Theme.light.spacing.medium,
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Theme.light.spacing.medium,
        paddingHorizontal: Theme.light.spacing.large,
        borderRadius: Theme.light.borderRadius.medium,
        gap: Theme.light.spacing.small,
    },
    disabledButton: {
        opacity: 0.6,
    },
    recordButtonText: {
        ...Theme.light.typography.button,
        color: Theme.light.colors.background,
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Theme.light.spacing.medium,
        paddingHorizontal: Theme.light.spacing.large,
        borderRadius: Theme.light.borderRadius.medium,
        backgroundColor: Theme.light.colors.accent,
        gap: Theme.light.spacing.small,
    },
    confirmButtonText: {
        ...Theme.light.typography.button,
        color: Theme.light.colors.background,
    },
});

export default VoiceRecorder;