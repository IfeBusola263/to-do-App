import { MaterialIcons } from '@expo/vector-icons';
import React, { memo, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Theme } from '../theme';

/**
 * Voice FAB component props
 */
interface VoiceFABProps {
    /** Callback when FAB is pressed */
    onPress: () => void;
    /** Whether the voice input is currently active/listening */
    isListening?: boolean;
    /** Whether the FAB is disabled */
    disabled?: boolean;
    /** Custom position from bottom (default: 20) */
    bottom?: number;
    /** Custom position from right (default: 20) */
    right?: number;
    /** Size variant of the FAB */
    size?: 'small' | 'medium' | 'large';
    /** Whether to show the pulsing animation when listening */
    showPulse?: boolean;
}

/**
 * Floating Action Button for Voice Input
 * 
 * A beautifully animated floating action button that provides access to
 * voice-to-task functionality. Features smooth animations, visual feedback
 * for different states, and follows Material Design principles.
 * 
 * @param props - VoiceFAB component props
 * 
 * @example
 * ```tsx
 * <VoiceFAB
 *   onPress={() => startVoiceRecording()}
 *   isListening={voiceState === 'listening'}
 *   disabled={!hasPermission}
 * />
 * ```
 */
export const VoiceFAB: React.FC<VoiceFABProps> = memo(({
    onPress,
    isListening = false,
    disabled = false,
    bottom = 20,
    right = 20,
    size = 'large',
    showPulse = true,
}) => {
    // Animation values
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const pulseScale = useSharedValue(1);
    const rotationValue = useSharedValue(0);

    // Get size dimensions based on variant
    const getSizeDimensions = () => {
        switch (size) {
            case 'small':
                return { width: 48, height: 48, iconSize: 20 };
            case 'medium':
                return { width: 56, height: 56, iconSize: 24 };
            case 'large':
            default:
                return { width: 64, height: 64, iconSize: 28 };
        }
    };

    const dimensions = getSizeDimensions();

    // Handle listening state animations
    useEffect(() => {
        if (isListening && showPulse) {
            // Start pulsing animation
            pulseScale.value = withSequence(
                withTiming(1.2, { duration: 600 }),
                withTiming(1, { duration: 600 }),
                withTiming(1.2, { duration: 600 }),
                withTiming(1, { duration: 600 })
            );

            // Subtle rotation for listening state
            rotationValue.value = withSequence(
                withTiming(5, { duration: 200 }),
                withTiming(-5, { duration: 400 }),
                withTiming(0, { duration: 200 })
            );
        } else {
            // Reset animations
            pulseScale.value = withTiming(1, { duration: 300 });
            rotationValue.value = withTiming(0, { duration: 300 });
        }
    }, [isListening, showPulse, pulseScale, rotationValue]);

    // Handle disabled state
    useEffect(() => {
        opacity.value = withTiming(disabled ? 0.5 : 1, { duration: 200 });
    }, [disabled, opacity]);

    // Press animation handlers
    const handlePressIn = () => {
        scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    };

    const handlePress = () => {
        if (!disabled) {
            // Haptic feedback could be added here
            onPress();
        }
    };

    // Animated styles
    const animatedButtonStyle = useAnimatedStyle(() => {
        const rotation = interpolate(rotationValue.value, [-5, 0, 5], [-5, 0, 5]);

        return {
            transform: [
                { scale: scale.value },
                { rotate: `${rotation}deg` },
            ],
            opacity: opacity.value,
        };
    });

    const animatedPulseStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pulseScale.value }],
            opacity: interpolate(pulseScale.value, [1, 1.2], [0.3, 0.1]),
        };
    });

    return (
        <View style={[styles.container, { bottom, right }]}>
            {/* Pulse effect background (shown when listening) */}
            {isListening && showPulse && (
                <Animated.View
                    style={[
                        styles.pulseRing,
                        {
                            width: dimensions.width + 20,
                            height: dimensions.height + 20,
                            borderRadius: (dimensions.width + 20) / 2,
                        },
                        animatedPulseStyle,
                    ]}
                />
            )}

            {/* Main FAB button */}
            <Animated.View style={[animatedButtonStyle]}>
                <TouchableOpacity
                    style={[
                        styles.fab,
                        {
                            width: dimensions.width,
                            height: dimensions.height,
                            borderRadius: dimensions.width / 2,
                            backgroundColor: isListening
                                ? Theme.light.colors.accent
                                : Theme.light.colors.primary,
                        },
                        disabled && styles.disabled,
                    ]}
                    onPress={handlePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.8}
                    disabled={disabled}
                >
                    <MaterialIcons
                        name={isListening ? 'mic' : 'mic-none'}
                        size={dimensions.iconSize}
                        color={Theme.light.colors.background}
                    />
                </TouchableOpacity>
            </Animated.View>

            {/* Listening indicator dot */}
            {isListening && (
                <View style={[styles.listeningDot, { top: 8, right: 8 }]} />
            )}
        </View>
    );
});

VoiceFAB.displayName = 'VoiceFAB';

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fab: {
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: Theme.light.colors.text,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    disabled: {
        backgroundColor: Theme.light.colors.textTertiary,
    },
    pulseRing: {
        position: 'absolute',
        backgroundColor: Theme.light.colors.accent,
        zIndex: -1,
    },
    listeningDot: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Theme.light.colors.error,
        borderWidth: 2,
        borderColor: Theme.light.colors.background,
    },
});

export default VoiceFAB;