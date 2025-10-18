import Constants from 'expo-constants';

/**
 * Environment configuration for speech recognition
 * 
 * Contains API keys and endpoints for cloud speech services.
 * In production, these should be securely stored and accessed
 * through environment variables or secure configuration.
 */
export interface SpeechConfig {
    googleCloudApiKey?: string;
    googleCloudProjectId?: string;
    speechApiEndpoint?: string;
}

/**
 * Get speech recognition configuration from environment
 * 
 * Retrieves API keys and configuration from Expo Constants
 * or environment variables. For development, you can also
 * provide fallback values directly in this file.
 * 
 * @returns SpeechConfig object with API credentials
 * 
 * @example
 * ```typescript
 * const config = getSpeechConfig();
 * if (!config.googleCloudApiKey) {
 *   throw new Error('Google Cloud API key not configured');
 * }
 * ```
 */
export const getSpeechConfig = (): SpeechConfig => {
    // Try to get from Expo Constants (expo build config)
    const expoConfig = Constants.expoConfig?.extra;

    // Try to get from environment variables (for development)
    const envConfig = process.env;

    return {
        googleCloudApiKey:
            expoConfig?.GOOGLE_CLOUD_API_KEY ||
            envConfig.GOOGLE_CLOUD_API_KEY ||
            // For development only - replace with your actual API key
            // Get your API key from: https://console.cloud.google.com/apis/credentials
            'your_actual_api_key_here',

        googleCloudProjectId:
            expoConfig?.GOOGLE_CLOUD_PROJECT_ID ||
            envConfig.GOOGLE_CLOUD_PROJECT_ID ||
            'your_project_id_here',

        speechApiEndpoint:
            expoConfig?.SPEECH_API_ENDPOINT ||
            envConfig.SPEECH_API_ENDPOINT ||
            'https://speech.googleapis.com/v1/speech:recognize',
    };
};

/**
 * Validate speech configuration
 * 
 * Checks if all required configuration values are present
 * and throws descriptive errors for missing values.
 * 
 * @param config - Speech configuration to validate
 * @throws Error if required configuration is missing
 * 
 * @example
 * ```typescript
 * try {
 *   validateSpeechConfig(getSpeechConfig());
 * } catch (error) {
 *   console.error('Speech config invalid:', error.message);
 * }
 * ```
 */
export const validateSpeechConfig = (config: SpeechConfig): void => {
    if (!config.googleCloudApiKey || config.googleCloudApiKey === 'your_actual_api_key_here') {
        throw new Error(
            'Google Cloud API key not configured. Please set GOOGLE_CLOUD_API_KEY in your environment or app.config.js'
        );
    }

    if (!config.googleCloudProjectId || config.googleCloudProjectId === 'your_project_id_here') {
        throw new Error(
            'Google Cloud Project ID not configured. Please set GOOGLE_CLOUD_PROJECT_ID in your environment or app.config.js'
        );
    }

    if (!config.speechApiEndpoint) {
        throw new Error('Speech API endpoint not configured');
    }
};

/**
 * Check if speech recognition is properly configured
 * 
 * Returns true if all required configuration is present,
 * false otherwise. Use this for graceful degradation.
 * 
 * @returns boolean indicating if speech recognition can be used
 * 
 * @example
 * ```typescript
 * if (isSpeechConfigured()) {
 *   // Use real speech recognition
 *   startRealSpeechRecognition();
 * } else {
 *   // Fall back to simulation
 *   startSimulatedSpeechRecognition();
 * }
 * ```
 */
export const isSpeechConfigured = (): boolean => {
    try {
        const config = getSpeechConfig();
        validateSpeechConfig(config);
        return true;
    } catch (error) {
        console.warn('Speech recognition not configured:', error);
        return false;
    }
};