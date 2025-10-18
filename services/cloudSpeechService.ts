import RNFS from 'react-native-fs';
import { getSpeechConfig, validateSpeechConfig } from '../config/speech';

/**
 * Google Cloud Speech-to-Text API Response Interface
 */
interface GoogleSpeechResponse {
    results?: Array<{
        alternatives?: Array<{
            transcript: string;
            confidence: number;
        }>;
    }>;
    error?: {
        code: number;
        message: string;
        status: string;
    };
}

/**
 * Speech recognition result from cloud service
 */
export interface CloudSpeechResult {
    transcript: string;
    confidence: number;
    success: boolean;
    error?: string;
}

/**
 * Real Speech-to-Text Service
 * 
 * Handles actual speech recognition by recording audio and sending
 * it to Google Cloud Speech-to-Text API for transcription.
 * 
 * This service provides real speech recognition capabilities for
 * mobile platforms by recording audio files and processing them
 * through cloud-based speech recognition services.
 */
export class CloudSpeechService {
    private config = getSpeechConfig();
    private isInitialized = false;

    /**
     * Initialize the cloud speech service
     * 
     * Validates configuration and prepares the service for use.
     * Should be called before attempting speech recognition.
     * 
     * @throws Error if configuration is invalid
     * 
     * @example
     * ```typescript
     * const speechService = new CloudSpeechService();
     * await speechService.initialize();
     * ```
     */
    async initialize(): Promise<void> {
        try {
            validateSpeechConfig(this.config);
            this.isInitialized = true;
            console.log('Cloud speech service initialized successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
            console.error('Failed to initialize cloud speech service:', errorMessage);
            throw new Error(`Speech service initialization failed: ${errorMessage}`);
        }
    }

    /**
     * Convert audio file to text using Google Cloud Speech-to-Text
     * 
     * Takes an audio file path and sends it to Google Cloud Speech API
     * for transcription. Handles encoding, API communication, and result parsing.
     * 
     * @param audioFilePath - Path to the recorded audio file
     * @param language - Language code for speech recognition (default: 'en-US')
     * @returns Promise<CloudSpeechResult> with transcript and confidence
     * 
     * @example
     * ```typescript
     * const result = await cloudSpeechService.transcribeAudio('/path/to/audio.m4a');
     * if (result.success) {
     *   console.log('Transcript:', result.transcript);
     *   console.log('Confidence:', result.confidence);
     * }
     * ```
     */
    async transcribeAudio(
        audioFilePath: string,
        language: string = 'en-US'
    ): Promise<CloudSpeechResult> {
        if (!this.isInitialized) {
            throw new Error('Speech service not initialized. Call initialize() first.');
        }

        try {
            console.log('Transcribing audio file:', audioFilePath);

            // Read audio file and convert to base64
            const audioBase64 = await this.readAudioFileAsBase64(audioFilePath);

            // Prepare request payload
            const requestPayload = {
                config: {
                    encoding: this.getAudioEncoding(audioFilePath),
                    sampleRateHertz: 44100,
                    languageCode: language,
                    enableAutomaticPunctuation: true,
                    model: 'latest_long', // Use latest model for better accuracy
                },
                audio: {
                    content: audioBase64,
                },
            };

            // Make API request to Google Cloud Speech
            const response = await this.makeGoogleCloudRequest(requestPayload);

            // Parse and return result
            return this.parseGoogleCloudResponse(response);

        } catch (error) {
            console.error('Audio transcription failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown transcription error';

            return {
                transcript: '',
                confidence: 0,
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Read audio file and convert to base64 encoding
     * 
     * @private
     * @param filePath - Path to the audio file
     * @returns Promise<string> base64 encoded audio data
     */
    private async readAudioFileAsBase64(filePath: string): Promise<string> {
        try {
            // Check if file exists
            const fileExists = await RNFS.exists(filePath);
            if (!fileExists) {
                throw new Error(`Audio file does not exist: ${filePath}`);
            }

            // Get file info
            const fileInfo = await RNFS.stat(filePath);
            console.log('Audio file info:', {
                path: filePath,
                size: fileInfo.size,
                isFile: fileInfo.isFile(),
            });

            // Read file as base64
            const base64Data = await RNFS.readFile(filePath, 'base64');
            console.log('Audio file read successfully, size:', base64Data.length);

            return base64Data;
        } catch (error) {
            console.error('Failed to read audio file:', error);
            throw new Error(`Failed to read audio file: ${error}`);
        }
    }

    /**
     * Determine audio encoding based on file extension
     * 
     * @private
     * @param filePath - Path to the audio file
     * @returns Audio encoding string for Google Cloud Speech API
     */
    private getAudioEncoding(filePath: string): string {
        const extension = filePath.toLowerCase().split('.').pop();

        switch (extension) {
            case 'm4a':
            case 'mp4':
                return 'MP4';
            case 'wav':
                return 'LINEAR16';
            case 'flac':
                return 'FLAC';
            case 'amr':
                return 'AMR';
            case 'ogg':
                return 'OGG_OPUS';
            default:
                console.warn(`Unknown audio format: ${extension}, defaulting to MP4`);
                return 'MP4';
        }
    }

    /**
     * Make HTTP request to Google Cloud Speech API
     * 
     * @private
     * @param payload - Request payload for the API
     * @returns Promise<GoogleSpeechResponse> API response
     */
    private async makeGoogleCloudRequest(payload: any): Promise<GoogleSpeechResponse> {
        const apiUrl = `${this.config.speechApiEndpoint}?key=${this.config.googleCloudApiKey}`;

        console.log('Making request to Google Cloud Speech API...');

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('Google Cloud API error:', responseData);
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        return responseData as GoogleSpeechResponse;
    }

    /**
     * Parse Google Cloud Speech API response
     * 
     * @private
     * @param response - Raw API response
     * @returns CloudSpeechResult parsed result
     */
    private parseGoogleCloudResponse(response: GoogleSpeechResponse): CloudSpeechResult {
        // Check for API errors
        if (response.error) {
            return {
                transcript: '',
                confidence: 0,
                success: false,
                error: `API Error: ${response.error.message}`,
            };
        }

        // Extract transcript and confidence
        const results = response.results || [];
        if (results.length === 0) {
            return {
                transcript: '',
                confidence: 0,
                success: false,
                error: 'No speech detected in audio',
            };
        }

        const firstResult = results[0];
        const alternatives = firstResult.alternatives || [];

        if (alternatives.length === 0) {
            return {
                transcript: '',
                confidence: 0,
                success: false,
                error: 'No transcription alternatives found',
            };
        }

        const bestAlternative = alternatives[0];

        return {
            transcript: bestAlternative.transcript || '',
            confidence: bestAlternative.confidence || 0,
            success: true,
        };
    }

    /**
     * Check if the service is ready for use
     * 
     * @returns boolean indicating if service is initialized and ready
     */
    isReady(): boolean {
        return this.isInitialized;
    }

    /**
     * Get configuration status for debugging
     * 
     * @returns object with configuration status (without sensitive data)
     */
    getConfigStatus() {
        return {
            hasApiKey: !!this.config.googleCloudApiKey && this.config.googleCloudApiKey !== 'your_actual_api_key_here',
            hasProjectId: !!this.config.googleCloudProjectId && this.config.googleCloudProjectId !== 'your_project_id_here',
            hasEndpoint: !!this.config.speechApiEndpoint,
            isInitialized: this.isInitialized,
        };
    }
}

/**
 * Create and initialize cloud speech service
 * 
 * Factory function for creating a ready-to-use cloud speech service instance.
 * Handles initialization and provides error handling.
 * 
 * @returns Promise<CloudSpeechService> initialized service instance
 * 
 * @example
 * ```typescript
 * try {
 *   const speechService = await createCloudSpeechService();
 *   const result = await speechService.transcribeAudio('/path/to/audio.m4a');
 * } catch (error) {
 *   console.error('Speech service unavailable:', error);
 * }
 * ```
 */
export const createCloudSpeechService = async (): Promise<CloudSpeechService> => {
    const service = new CloudSpeechService();
    await service.initialize();
    return service;
};