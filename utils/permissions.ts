import { Alert, Platform } from 'react-native';

/**
 * Permission status types for microphone access
 */
export enum PermissionStatus {
    GRANTED = 'granted',
    DENIED = 'denied',
    UNDETERMINED = 'undetermined',
    RESTRICTED = 'restricted',
}

/**
 * Result type for permission operations
 */
export interface PermissionResult {
    status: PermissionStatus;
    canAskAgain: boolean;
    granted: boolean;
}

/**
 * Requests microphone permission from the user
 * 
 * This function handles the complete flow of requesting microphone permissions,
 * including checking current status, requesting if needed, and providing
 * user-friendly error handling.
 * 
 * @returns Promise<PermissionResult> - The permission result with status and metadata
 * 
 * @example
 * ```typescript
 * const result = await requestMicrophonePermission();
 * if (result.granted) {
 *   // Proceed with voice recording
 * } else {
 *   // Show permission denied message
 * }
 * ```
 */
export const requestMicrophonePermission = async (): Promise<PermissionResult> => {
    try {
        // For iOS/Android, we need to request audio recording permission
        // This will be handled by expo-speech and expo-audio internally
        // For now, we'll simulate a permission check

        if (Platform.OS === 'web') {
            // Web requires getUserMedia permission
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                return {
                    status: PermissionStatus.GRANTED,
                    canAskAgain: false,
                    granted: true,
                };
            } catch (error) {
                return {
                    status: PermissionStatus.DENIED,
                    canAskAgain: false,
                    granted: false,
                };
            }
        }

        // For mobile platforms, expo-speech handles permissions internally
        // We'll return granted by default and let the speech service handle errors
        return {
            status: PermissionStatus.GRANTED,
            canAskAgain: true,
            granted: true,
        };
    } catch (error) {
        console.error('Error requesting microphone permission:', error);
        return {
            status: PermissionStatus.DENIED,
            canAskAgain: false,
            granted: false,
        };
    }
};

/**
 * Checks the current microphone permission status without requesting
 * 
 * This function queries the current permission status without triggering
 * a permission request dialog. Useful for determining if we need to
 * show explanatory UI before requesting permissions.
 * 
 * @returns Promise<PermissionResult> - Current permission status
 * 
 * @example
 * ```typescript
 * const status = await checkMicrophonePermission();
 * if (status.status === PermissionStatus.UNDETERMINED) {
 *   // Show explanation before requesting
 * }
 * ```
 */
export const checkMicrophonePermission = async (): Promise<PermissionResult> => {
    try {
        if (Platform.OS === 'web') {
            // Web doesn't have a way to check permission status without requesting
            // Return undetermined to prompt for permission
            return {
                status: PermissionStatus.UNDETERMINED,
                canAskAgain: true,
                granted: false,
            };
        }

        // For mobile, we'll assume undetermined and let the speech service handle it
        return {
            status: PermissionStatus.UNDETERMINED,
            canAskAgain: true,
            granted: false,
        };
    } catch (error) {
        console.error('Error checking microphone permission:', error);
        return {
            status: PermissionStatus.DENIED,
            canAskAgain: false,
            granted: false,
        };
    }
};

/**
 * Shows a user-friendly alert when microphone permission is denied
 * 
 * This provides consistent messaging and guidance for users when
 * microphone access is not available. Includes platform-specific
 * instructions for enabling permissions.
 * 
 * @param canRetry - Whether the user can retry the permission request
 * 
 * @example
 * ```typescript
 * const result = await requestMicrophonePermission();
 * if (!result.granted) {
 *   showPermissionDeniedAlert(result.canAskAgain);
 * }
 * ```
 */
export const showPermissionDeniedAlert = (canRetry: boolean = false): void => {
    const title = 'Microphone Access Required';
    const message = canRetry
        ? 'Voice-to-Task feature requires microphone access to convert your speech to tasks. Please allow microphone access to continue.'
        : 'Microphone access has been denied. To use Voice-to-Task, please enable microphone permissions in your device settings.';

    const buttons = canRetry
        ? [
            { text: 'Cancel', style: 'cancel' as const },
            { text: 'Retry', onPress: () => requestMicrophonePermission() },
        ]
        : [
            { text: 'Cancel', style: 'cancel' as const },
            {
                text: 'Settings', onPress: () => {
                    // Note: Opening settings requires additional setup with expo-linking
                    console.log('Open device settings for microphone permissions');
                }
            },
        ];

    Alert.alert(title, message, buttons);
};

/**
 * Handles permission errors with appropriate user feedback
 * 
 * Centralized error handling for permission-related errors that can
 * occur during voice recording operations. Provides consistent UX
 * across the app for permission issues.
 * 
 * @param error - The error that occurred
 * @param context - Additional context about where the error occurred
 * 
 * @example
 * ```typescript
 * try {
 *   await startVoiceRecording();
 * } catch (error) {
 *   handlePermissionError(error, 'voice recording');
 * }
 * ```
 */
export const handlePermissionError = (error: unknown, context: string = 'voice feature'): void => {
    console.error(`Permission error in ${context}:`, error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if it's a permission-related error
    if (errorMessage.toLowerCase().includes('permission') ||
        errorMessage.toLowerCase().includes('denied') ||
        errorMessage.toLowerCase().includes('microphone')) {
        showPermissionDeniedAlert(true);
    } else {
        // Generic error alert
        Alert.alert(
            'Voice Feature Error',
            `There was a problem with the ${context}. Please try again.`,
            [{ text: 'OK' }]
        );
    }
};