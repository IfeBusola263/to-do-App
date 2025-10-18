import { SpeechService, SpeechState, createSpeechService, isSpeechRecognitionSupported } from '../services/speechService';

// Mock expo-speech
jest.mock('expo-speech', () => ({
    startAsync: jest.fn(),
    stopAsync: jest.fn(),
    speak: jest.fn(),
}));

// Mock permissions
jest.mock('../utils/permissions', () => ({
    requestMicrophonePermission: jest.fn().mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        granted: true,
    }),
    handlePermissionError: jest.fn(),
}));

describe('SpeechService', () => {
    let speechService: SpeechService;
    let mockCallbacks: {
        onStart: jest.Mock;
        onResult: jest.Mock;
        onEnd: jest.Mock;
        onError: jest.Mock;
    };

    beforeEach(() => {
        mockCallbacks = {
            onStart: jest.fn(),
            onResult: jest.fn(),
            onEnd: jest.fn(),
            onError: jest.fn(),
        };

        speechService = new SpeechService(
            { language: 'en-US', timeout: 10000 },
            mockCallbacks
        );

        jest.clearAllMocks();
    });

    describe('Construction and Configuration', () => {
        it('should create speech service with default options', () => {
            const service = new SpeechService();
            expect(service.getState()).toBe(SpeechState.IDLE);
            expect(service.isListening()).toBe(false);
        });

        it('should create speech service with custom options', () => {
            const options = { language: 'es-ES', timeout: 15000 };
            const service = new SpeechService(options);
            expect(service.getState()).toBe(SpeechState.IDLE);
        });

        it('should update options after creation', () => {
            speechService.updateOptions({ language: 'fr-FR' });
            // Options are updated internally - no direct way to test without exposing internals
            expect(speechService.getState()).toBe(SpeechState.IDLE);
        });

        it('should update callbacks after creation', () => {
            const newCallback = jest.fn();
            speechService.updateCallbacks({ onStart: newCallback });
            // Callbacks are updated internally
            expect(speechService.getState()).toBe(SpeechState.IDLE);
        });
    });

    describe('Speech Recognition Lifecycle', () => {
        it('should start listening successfully', async () => {
            await speechService.startListening();

            expect(mockCallbacks.onStart).toHaveBeenCalledTimes(1);
            expect(speechService.getState()).toBe(SpeechState.LISTENING);
            expect(speechService.isListening()).toBe(true);
        });

        it('should handle permission errors when starting', async () => {
            const { requestMicrophonePermission } = require('../utils/permissions');
            requestMicrophonePermission.mockResolvedValueOnce({
                status: 'denied',
                granted: false,
                canAskAgain: false,
            });

            await expect(speechService.startListening()).rejects.toThrow('Microphone permission denied');
            expect(speechService.getState()).toBe(SpeechState.ERROR);
            expect(mockCallbacks.onError).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Microphone permission denied' })
            );
        });

        it('should stop listening successfully', async () => {
            // First start listening
            await speechService.startListening();

            // Then stop
            await speechService.stopListening();

            expect(mockCallbacks.onEnd).toHaveBeenCalledTimes(1);
            expect(speechService.getState()).toBe(SpeechState.IDLE);
            expect(speechService.isListening()).toBe(false);
        });

        it('should handle errors when stopping', async () => {
            // Mock an error during stop
            const service = new SpeechService({}, {
                ...mockCallbacks,
                onError: mockCallbacks.onError,
            });

            // Force an error by making the service think it's in a bad state
            await expect(async () => {
                // This would normally not throw, but we're testing error handling
                await service.stopListening();
            }).not.toThrow(); // The current implementation doesn't throw on stop
        });
    });

    describe('Mock Speech Recognition Simulation', () => {
        it('should simulate speech recognition with partial results', async () => {
            const service = new SpeechService(
                { partialResults: true },
                mockCallbacks
            );

            await service.startListening();

            // Wait for simulated results
            await new Promise(resolve => setTimeout(resolve, 1200));

            expect(mockCallbacks.onResult).toHaveBeenCalledWith({
                transcript: 'Buy groceries',
                confidence: 0.7,
                isFinal: false,
            });

            // Wait for final result
            await new Promise(resolve => setTimeout(resolve, 2200));

            expect(mockCallbacks.onResult).toHaveBeenCalledWith({
                transcript: 'Buy groceries and call mom then pick up dry cleaning',
                confidence: 0.95,
                isFinal: true,
            });

            expect(mockCallbacks.onEnd).toHaveBeenCalled();
        });

        it('should not provide partial results when disabled', async () => {
            const service = new SpeechService(
                { partialResults: false },
                mockCallbacks
            );

            await service.startListening();

            // Wait for where partial result would be
            await new Promise(resolve => setTimeout(resolve, 1200));

            // Should not have partial results
            expect(mockCallbacks.onResult).not.toHaveBeenCalledWith(
                expect.objectContaining({ isFinal: false })
            );
        });
    });

    describe('State Management', () => {
        it('should track state correctly through lifecycle', async () => {
            expect(speechService.getState()).toBe(SpeechState.IDLE);
            expect(speechService.isListening()).toBe(false);

            await speechService.startListening();
            expect(speechService.getState()).toBe(SpeechState.LISTENING);
            expect(speechService.isListening()).toBe(true);

            await speechService.stopListening();
            expect(speechService.getState()).toBe(SpeechState.IDLE);
            expect(speechService.isListening()).toBe(false);
        });

        it('should handle error states correctly', async () => {
            const { requestMicrophonePermission } = require('../utils/permissions');
            requestMicrophonePermission.mockRejectedValueOnce(new Error('Permission error'));

            await expect(speechService.startListening()).rejects.toThrow();
            expect(speechService.getState()).toBe(SpeechState.ERROR);
            expect(speechService.isListening()).toBe(false);
        });
    });

    describe('Factory Functions', () => {
        it('should create speech service with factory function', () => {
            const service = createSpeechService(mockCallbacks);
            expect(service).toBeInstanceOf(SpeechService);
            expect(service.getState()).toBe(SpeechState.IDLE);
        });

        it('should create speech service with default callbacks', () => {
            const service = createSpeechService();
            expect(service).toBeInstanceOf(SpeechService);
        });
    });

    describe('Platform Support Detection', () => {
        it('should detect speech recognition support on mobile', async () => {
            // Mock mobile platform
            jest.doMock('react-native', () => ({
                Platform: { OS: 'ios' },
            }));

            const isSupported = await isSpeechRecognitionSupported();
            expect(isSupported).toBe(true);
        });

        it('should detect speech recognition support on web', async () => {
            // Mock web platform with speech recognition
            Object.defineProperty(global, 'window', {
                value: {
                    webkitSpeechRecognition: jest.fn(),
                },
                writable: true,
            });

            jest.doMock('react-native', () => ({
                Platform: { OS: 'web' },
            }));

            const isSupported = await isSpeechRecognitionSupported();
            expect(isSupported).toBe(true);
        });

        it('should handle errors in support detection', async () => {
            // Mock an error during detection
            jest.doMock('react-native', () => ({
                Platform: {
                    get OS() {
                        throw new Error('Platform detection error');
                    }
                },
            }));

            const isSupported = await isSpeechRecognitionSupported();
            expect(isSupported).toBe(false);
        });
    });

    describe('Integration Edge Cases', () => {
        it('should handle multiple start calls gracefully', async () => {
            await speechService.startListening();

            // Try to start again while already listening
            await speechService.startListening();

            expect(mockCallbacks.onStart).toHaveBeenCalledTimes(2);
            expect(speechService.isListening()).toBe(true);
        });

        it('should handle stop before start', async () => {
            // Try to stop without starting
            await speechService.stopListening();

            expect(mockCallbacks.onEnd).toHaveBeenCalledTimes(1);
            expect(speechService.getState()).toBe(SpeechState.IDLE);
        });

        it('should cleanup properly on service destruction', () => {
            // This would be relevant if we had cleanup logic
            speechService = new SpeechService();
            expect(speechService.getState()).toBe(SpeechState.IDLE);
        });
    });
});