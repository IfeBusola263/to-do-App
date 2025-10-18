import { Platform } from 'react-native';
import { handlePermissionError, requestMicrophonePermission } from '../utils/permissions';

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
                // For mobile platforms, fall back to simulation for now
                // TODO: Implement native speech recognition for iOS/Android
                console.warn('Native speech recognition not yet implemented for mobile. Using simulation.');
                this.simulateSpeechRecognition();
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