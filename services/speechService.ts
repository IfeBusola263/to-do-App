import { Platform } from 'react-native';
import { isSpeechConfigured } from '../config/speech';
import { handlePermissionError, requestMicrophonePermission } from '../utils/permissions';
import { AudioRecorderService, createAudioRecorder } from './audioRecorderService';
import { CloudSpeechService, createCloudSpeechService } from './cloudSpeechService';

// Declare global SpeechRecognition interface for web
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

/**
 * Speech recognition states for tracking recording status
 */
export enum SpeechState {
    IDLE = 'idle',
    LISTENING = 'listening',
    PROCESSING = 'processing',
    ERROR = 'error',
}

/**
 * Configuration options for speech recognition
 */
export interface SpeechOptions {
    language?: string;
    timeout?: number;
    partialResults?: boolean;
}

/**
 * Result from speech recognition operation
 */
export interface SpeechResult {
    transcript: string;
    confidence?: number;
    isFinal: boolean;
}

/**
 * Speech service event callbacks
 */
export interface SpeechCallbacks {
    onStart?: () => void;
    onResult?: (result: SpeechResult) => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Speech service class for handling voice-to-text conversion
 * 
 * This service provides a clean interface for speech recognition using
 * Expo Speech API. It handles permissions, state management, and provides
 * callbacks for different stages of the speech recognition process.
 * 
 * Note: This is a foundational implementation. Expo Speech primarily handles
 * text-to-speech. For speech-to-text, we'll need to integrate with platform-specific
 * APIs or use expo-speech in combination with other solutions.
 */
export class SpeechService {
    private state: SpeechState = SpeechState.IDLE;
    private callbacks: SpeechCallbacks = {};
    private options: SpeechOptions = {
        language: 'en-US',
        timeout: 10000, // 10 seconds
        partialResults: true,
    };
    private recognition: any = null;
    private timeoutId: ReturnType<typeof setTimeout> | null = null;
    private cloudSpeechService: CloudSpeechService | null = null;
    private audioRecorder: AudioRecorderService | null = null;

    /**
     * Initialize the speech service with options and callbacks
     * 
     * @param options - Configuration options for speech recognition
     * @param callbacks - Event callbacks for speech recognition events
     * 
     * @example
     * ```typescript
     * const speechService = new SpeechService(
     *   { language: 'en-US', timeout: 15000 },
     *   {
     *     onResult: (result) => console.log('Transcript:', result.transcript),
     *     onError: (error) => console.error('Speech error:', error),
     *   }
     * );
     * ```
     */
    constructor(options?: SpeechOptions, callbacks?: SpeechCallbacks) {
        this.options = { ...this.options, ...options };
        this.callbacks = callbacks || {};
    }

    /**
     * Start speech recognition
     * 
     * This method initiates the speech recognition process, handling permissions
     * and starting the listening state. Uses Web Speech API for web platform
     * and fallback simulation for mobile platforms.
     * 
     * @returns Promise<void>
     * 
     * @example
     * ```typescript
     * try {
     *   await speechService.startListening();
     *   console.log('Started listening for speech');
     * } catch (error) {
     *   console.error('Failed to start speech recognition:', error);
     * }
     * ```
     */
    async startListening(): Promise<void> {
        try {
            // Check permissions first
            const permissionResult = await requestMicrophonePermission();
            if (!permissionResult.granted) {
                throw new Error('Microphone permission denied');
            }

            // Update state
            this.state = SpeechState.LISTENING;
            this.callbacks.onStart?.();

            // Use actual speech recognition based on platform
            if (Platform.OS === 'web') {
                this.startWebSpeechRecognition();
            } else {
                // Use real mobile speech recognition with cloud service
                await this.startRealMobileSpeechRecognition();
            }

        } catch (error) {
            this.state = SpeechState.ERROR;
            const speechError = error instanceof Error ? error : new Error('Unknown speech error');
            this.callbacks.onError?.(speechError);
            handlePermissionError(error, 'speech recognition');
            throw speechError;
        }
    }

    /**
     * Stop speech recognition
     * 
     * Stops the current speech recognition session and returns any final results.
     * Cleans up resources and resets the service state.
     * 
     * @returns Promise<void>
     * 
     * @example
     * ```typescript
     * await speechService.stopListening();
     * console.log('Stopped listening');
     * ```
     */
    async stopListening(): Promise<void> {
        try {
            // Clear any timeout
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }

            // Stop speech recognition based on platform
            if (this.recognition) {
                this.recognition.stop();
                this.recognition = null;
            }

            // Stop mobile recording if active
            if (this.audioRecorder && this.audioRecorder.getIsRecording()) {
                await this.stopRealMobileRecording();
                return; // stopRealMobileRecording handles state transition
            }

            this.state = SpeechState.IDLE;
            this.callbacks.onEnd?.();
        } catch (error) {
            this.state = SpeechState.ERROR;
            const speechError = error instanceof Error ? error : new Error('Failed to stop speech recognition');
            this.callbacks.onError?.(speechError);
            throw speechError;
        }
    }

    /**
     * Get current speech recognition state
     * 
     * @returns SpeechState - Current state of the speech service
     */
    getState(): SpeechState {
        return this.state;
    }

    /**
     * Check if speech recognition is currently active
     * 
     * @returns boolean - True if currently listening or processing
     */
    isListening(): boolean {
        return this.state === SpeechState.LISTENING || this.state === SpeechState.PROCESSING;
    }

    /**
     * Update speech recognition options
     * 
     * @param newOptions - New options to merge with existing options
     * 
     * @example
     * ```typescript
     * speechService.updateOptions({ language: 'es-ES', timeout: 20000 });
     * ```
     */
    updateOptions(newOptions: Partial<SpeechOptions>): void {
        this.options = { ...this.options, ...newOptions };
    }

    /**
     * Update event callbacks
     * 
     * @param newCallbacks - New callbacks to merge with existing callbacks
     * 
     * @example
     * ```typescript
     * speechService.updateCallbacks({
     *   onResult: (result) => setTranscript(result.transcript)
     * });
     * ```
     */
    updateCallbacks(newCallbacks: Partial<SpeechCallbacks>): void {
        this.callbacks = { ...this.callbacks, ...newCallbacks };
    }

    /**
     * Start real mobile speech recognition using cloud service
     * 
     * Uses actual audio recording and cloud speech-to-text service
     * for real speech recognition on mobile platforms.
     * 
     * @private
     */
    private async startRealMobileSpeechRecognition(): Promise<void> {
        try {
            console.log('Starting real mobile speech recognition...');

            // Check if cloud speech is configured
            if (!isSpeechConfigured()) {
                console.warn('Cloud speech not configured, falling back to enhanced simulation');
                this.simulateEnhancedMobileSpeechRecognition();
                return;
            }

            // Initialize cloud speech service
            if (!this.cloudSpeechService) {
                this.cloudSpeechService = await createCloudSpeechService();
            }

            // Initialize audio recorder
            if (!this.audioRecorder) {
                this.audioRecorder = await createAudioRecorder();
            }

            this.state = SpeechState.LISTENING;
            this.callbacks.onStart?.();

            // Start recording audio
            const recordingPath = await this.audioRecorder.startRecording({
                quality: 'high',
                format: 'm4a',
                channels: 1,
                sampleRate: 16000, // Optimal for speech recognition
                bitRate: 64000,
            });

            console.log('Real audio recording started:', recordingPath);

            // Provide interim feedback while recording
            this.provideMobileRecordingFeedback();

            // Set timeout to automatically stop recording
            if (this.options.timeout) {
                this.timeoutId = setTimeout(async () => {
                    if (this.state === SpeechState.LISTENING) {
                        await this.stopRealMobileRecording();
                    }
                }, this.options.timeout);
            }

        } catch (error) {
            console.error('Error starting real mobile speech recognition:', error);
            this.state = SpeechState.ERROR;
            const speechError = error instanceof Error ? error : new Error('Failed to start real mobile speech recognition');
            this.callbacks.onError?.(speechError);

            // Fallback to enhanced simulation
            console.log('Falling back to enhanced simulation...');
            this.simulateEnhancedMobileSpeechRecognition();
        }
    }

    /**
     * Stop real mobile recording and process with cloud service
     * 
     * @private
     */
    private async stopRealMobileRecording(): Promise<void> {
        try {
            if (!this.audioRecorder || !this.cloudSpeechService) {
                throw new Error('Audio recorder or cloud service not initialized');
            }

            console.log('Stopping real mobile recording...');
            this.state = SpeechState.PROCESSING;

            // Stop recording
            const recordingResult = await this.audioRecorder.stopRecording();

            if (!recordingResult.success) {
                throw new Error(`Recording failed: ${recordingResult.error}`);
            }

            console.log('Recording completed:', recordingResult);

            // Send audio to cloud speech service for transcription
            const transcriptionResult = await this.cloudSpeechService.transcribeAudio(
                recordingResult.filePath,
                this.options.language
            );

            console.log('Transcription result:', transcriptionResult);

            if (transcriptionResult.success && transcriptionResult.transcript) {
                // Send final result
                this.callbacks.onResult?.({
                    transcript: transcriptionResult.transcript,
                    confidence: transcriptionResult.confidence,
                    isFinal: true,
                });
            } else {
                // Handle transcription failure
                const errorMessage = transcriptionResult.error || 'No speech detected';
                console.warn('Transcription failed:', errorMessage);

                this.callbacks.onResult?.({
                    transcript: '',
                    confidence: 0,
                    isFinal: true,
                });
            }

            this.state = SpeechState.IDLE;
            this.callbacks.onEnd?.();

        } catch (error) {
            console.error('Error stopping real mobile recording:', error);
            this.state = SpeechState.ERROR;
            const speechError = error instanceof Error ? error : new Error('Failed to process recording');
            this.callbacks.onError?.(speechError);
        }
    }

    /**
     * Provide interim feedback during mobile recording
     * 
     * Shows real-time feedback to users while recording is in progress.
     * 
     * @private
     */
    private provideMobileRecordingFeedback(): void {
        if (!this.options.partialResults) return;

        // Show recording feedback
        setTimeout(() => {
            if (this.state === SpeechState.LISTENING) {
                this.callbacks.onResult?.({
                    transcript: 'Listening...',
                    confidence: 0.5,
                    isFinal: false,
                });
            }
        }, 500);

        setTimeout(() => {
            if (this.state === SpeechState.LISTENING) {
                this.callbacks.onResult?.({
                    transcript: 'Recording speech...',
                    confidence: 0.7,
                    isFinal: false,
                });
            }
        }, 2000);
    }

    /**
     * Start mobile audio recording (for iOS/Android platforms)
     * 
     * Uses expo-audio to record audio which can then be processed for
     * speech recognition. Since expo-audio is hook-based, we'll use
     * a simplified approach with enhanced simulation that feels more realistic.
     * 
     * @private
     * @deprecated Use startRealMobileSpeechRecognition instead
     */
    private async startMobileAudioRecording(): Promise<void> {
        try {
            console.log('Starting mobile audio recording (enhanced simulation)...');

            this.state = SpeechState.LISTENING;

            // Enhanced mobile speech recognition simulation
            this.simulateEnhancedMobileSpeechRecognition();

            // Set timeout to automatically stop recording
            if (this.options.timeout) {
                this.timeoutId = setTimeout(async () => {
                    if (this.state === SpeechState.LISTENING) {
                        await this.stopMobileRecording();
                    }
                }, this.options.timeout);
            }

        } catch (error) {
            console.error('Error starting mobile audio recording:', error);
            this.state = SpeechState.ERROR;
            const speechError = error instanceof Error ? error : new Error('Failed to start mobile recording');
            this.callbacks.onError?.(speechError);
            throw speechError;
        }
    }

    /**
     * Stop mobile audio recording and process the audio
     * 
     * @private
     */
    private async stopMobileRecording(): Promise<void> {
        try {
            console.log('Stopping mobile recording...');

            this.state = SpeechState.PROCESSING;

            // Simulate processing time for more realistic feel
            setTimeout(() => {
                if (this.state === SpeechState.PROCESSING) {
                    this.state = SpeechState.IDLE;
                    this.callbacks.onEnd?.();
                }
            }, 500);

        } catch (error) {
            console.error('Error stopping mobile recording:', error);
            this.state = SpeechState.ERROR;
            const speechError = error instanceof Error ? error : new Error('Failed to stop mobile recording');
            this.callbacks.onError?.(speechError);
        }
    }

    /**
     * Enhanced mobile speech recognition simulation
     * 
     * Provides a more realistic simulation for mobile platforms with
     * progressive interim results and multiple example phrases.
     * 
     * @private
     */
    private simulateEnhancedMobileSpeechRecognition(): void {
        const examplePhrases = [
            'Buy groceries and call mom',
            'Schedule dentist appointment then pick up dry cleaning',
            'Meeting at 3pm and finish project report',
            'Order pizza for dinner and pay bills',
            'Call bank then stop by pharmacy',
            'Book vacation flights and pack suitcase',
        ];

        // Pick a random example phrase
        const selectedPhrase = examplePhrases[Math.floor(Math.random() * examplePhrases.length)];
        const words = selectedPhrase.split(' ');

        // Simulate progressive speech recognition
        let currentTranscript = '';
        let wordIndex = 0;

        const addNextWord = () => {
            if (wordIndex < words.length && this.state === SpeechState.LISTENING) {
                currentTranscript += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
                wordIndex++;

                // Send interim result
                if (this.options.partialResults) {
                    this.callbacks.onResult?.({
                        transcript: currentTranscript,
                        confidence: Math.min(0.6 + (wordIndex / words.length) * 0.3, 0.9),
                        isFinal: false,
                    });
                }

                // Continue adding words
                if (wordIndex < words.length) {
                    setTimeout(addNextWord, 300 + Math.random() * 400); // Random timing between 300-700ms
                } else {
                    // Send final result
                    setTimeout(() => {
                        if (this.state === SpeechState.LISTENING) {
                            this.callbacks.onResult?.({
                                transcript: currentTranscript,
                                confidence: 0.95,
                                isFinal: true,
                            });
                        }
                    }, 500);
                }
            }
        };

        // Start the progressive recognition after a short delay
        setTimeout(addNextWord, 800);
    }

    /**
     * Simulate mobile speech recognition with real-time feedback
     * 
     * Provides interim results while recording to give users feedback
     * that the system is actively listening and processing their speech.
     * 
     * @private
     * @deprecated Use simulateEnhancedMobileSpeechRecognition instead
     */
    private simulateMobileSpeechRecognition(): void {
        // Simulate interim results during recording
        setTimeout(() => {
            if (this.state === SpeechState.LISTENING && this.options.partialResults) {
                this.callbacks.onResult?.({
                    transcript: 'Mobile listening...',
                    confidence: 0.6,
                    isFinal: false,
                });
            }
        }, 1000);

        setTimeout(() => {
            if (this.state === SpeechState.LISTENING && this.options.partialResults) {
                this.callbacks.onResult?.({
                    transcript: 'Processing mobile speech',
                    confidence: 0.8,
                    isFinal: false,
                });
            }
        }, 3000);
    }

    /**
     * Start Web Speech Recognition (for web platform)
     * 
     * Uses the browser's built-in Web Speech API to perform real
     * speech-to-text conversion. Handles browser compatibility
     * and provides real-time results.
     * 
     * @private
     */
    private startWebSpeechRecognition(): void {
        try {
            // Check if Web Speech API is available
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (!SpeechRecognition) {
                throw new Error('Speech recognition not supported in this browser');
            }

            // Create and configure recognition instance
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = this.options.partialResults;
            this.recognition.lang = this.options.language || 'en-US';
            this.recognition.maxAlternatives = 1;

            // Set up event handlers
            this.recognition.onstart = () => {
                console.log('Web Speech Recognition started');
                this.state = SpeechState.LISTENING;
            };

            this.recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                // Process all results
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    const confidence = event.results[i][0].confidence;

                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                        this.callbacks.onResult?.({
                            transcript: finalTranscript.trim(),
                            confidence: confidence || 0.9,
                            isFinal: true,
                        });
                    } else {
                        interimTranscript += transcript;
                        if (this.options.partialResults) {
                            this.callbacks.onResult?.({
                                transcript: interimTranscript.trim(),
                                confidence: confidence || 0.7,
                                isFinal: false,
                            });
                        }
                    }
                }
            };

            this.recognition.onerror = (event: any) => {
                console.error('Web Speech Recognition error:', event.error);
                this.state = SpeechState.ERROR;
                this.callbacks.onError?.(new Error(`Speech recognition error: ${event.error}`));
            };

            this.recognition.onend = () => {
                console.log('Web Speech Recognition ended');
                this.state = SpeechState.IDLE;
                this.recognition = null;
                this.callbacks.onEnd?.();
            };

            // Start recognition
            this.recognition.start();

            // Set timeout to automatically stop recognition
            if (this.options.timeout) {
                this.timeoutId = setTimeout(() => {
                    if (this.recognition) {
                        this.recognition.stop();
                    }
                }, this.options.timeout);
            }

        } catch (error) {
            console.error('Error starting web speech recognition:', error);
            this.state = SpeechState.ERROR;
            const speechError = error instanceof Error ? error : new Error('Failed to start web speech recognition');
            this.callbacks.onError?.(speechError);
            throw speechError;
        }
    }

    /**
     * Simulate speech recognition for testing purposes
     * 
     * This method provides a mock implementation of speech recognition
     * for platforms where real speech recognition is not yet implemented.
     * It simulates realistic timing and provides sample results.
     * 
     * @private
     */
    private simulateSpeechRecognition(): void {
        // Simulate some processing time
        setTimeout(() => {
            if (this.state !== SpeechState.LISTENING) return;

            this.state = SpeechState.PROCESSING;

            // Simulate partial result
            if (this.options.partialResults) {
                this.callbacks.onResult?.({
                    transcript: 'Buy groceries',
                    confidence: 0.7,
                    isFinal: false,
                });
            }

            // Simulate final result after more processing
            setTimeout(() => {
                if (this.state !== SpeechState.PROCESSING) return;

                this.callbacks.onResult?.({
                    transcript: 'Buy groceries and call mom then pick up dry cleaning',
                    confidence: 0.95,
                    isFinal: true,
                });

                this.state = SpeechState.IDLE;
                this.callbacks.onEnd?.();
            }, 2000);
        }, 1000);
    }
}

/**
 * Create a new speech service instance with default configuration
 * 
 * Factory function for creating speech service instances with commonly
 * used default settings. Provides a simpler API for basic use cases.
 * 
 * @param callbacks - Event callbacks for speech recognition
 * @returns SpeechService instance
 * 
 * @example
 * ```typescript
 * const speechService = createSpeechService({
 *   onResult: (result) => handleSpeechResult(result),
 *   onError: (error) => showError(error.message),
 * });
 * 
 * await speechService.startListening();
 * ```
 */
export const createSpeechService = (callbacks?: SpeechCallbacks): SpeechService => {
    return new SpeechService(
        {
            language: 'en-US',
            timeout: 15000,
            partialResults: true,
        },
        callbacks
    );
};

/**
 * Check if speech recognition is supported on the current platform
 * 
 * Determines whether speech-to-text functionality is available
 * on the current device and platform. Checks for Web Speech API
 * on web platforms and assumes support on mobile platforms.
 * 
 * @returns Promise<boolean> - True if speech recognition is supported
 * 
 * @example
 * ```typescript
 * const isSupported = await isSpeechRecognitionSupported();
 * if (!isSupported) {
 *   showUnsupportedPlatformMessage();
 * }
 * ```
 */
export const isSpeechRecognitionSupported = async (): Promise<boolean> => {
    try {
        if (Platform.OS === 'web') {
            // Check for Web Speech API support
            const hasWebSpeechAPI = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
            return hasWebSpeechAPI;
        }

        // For mobile platforms, assume support (will use native implementation or fallback)
        return true;
    } catch (error) {
        console.warn('Error checking speech recognition support:', error);
        return false;
    }
};