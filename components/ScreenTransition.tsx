import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface ScreenTransitionProps {
    children: React.ReactNode;
    style?: ViewStyle;
    animationType?: 'fade' | 'slide' | 'scale';
    duration?: number;
    delay?: number;
}

const ScreenTransition: React.FC<ScreenTransitionProps> = ({
    children,
    style,
    animationType = 'fade',
    duration = 300,
    delay = 0,
}) => {
    const opacity = useSharedValue(animationType === 'fade' ? 0 : 1);
    const translateY = useSharedValue(animationType === 'slide' ? 50 : 0);
    const scale = useSharedValue(animationType === 'scale' ? 0.9 : 1);

    useEffect(() => {
        const timer = setTimeout(() => {
            switch (animationType) {
                case 'fade':
                    opacity.value = withTiming(1, { duration });
                    break;
                case 'slide':
                    opacity.value = withTiming(1, { duration });
                    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
                    break;
                case 'scale':
                    opacity.value = withTiming(1, { duration });
                    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
                    break;
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [animationType, duration, delay]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <Animated.View style={[style, animatedStyle]}>
            {children}
        </Animated.View>
    );
};

export default ScreenTransition;