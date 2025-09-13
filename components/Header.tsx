import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { Theme } from "../theme";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface HeaderProps {
    title: string;
    leftAction?: {
        label: string;
        onPress: () => void;
        color?: string;
    };
    rightAction?: {
        label: string;
        onPress: () => void;
        color?: string;
    };
    backgroundColor?: string;
    showBorder?: boolean;
}

const Header: React.FC<HeaderProps> = ({
    title,
    leftAction,
    rightAction,
    backgroundColor = Theme.light.colors.surface,
    showBorder = true,
}) => {
    const leftButtonScale = useSharedValue(1);
    const rightButtonScale = useSharedValue(1);

    const leftAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: leftButtonScale.value }],
    }));

    const rightAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: rightButtonScale.value }],
    }));

    const handleLeftPressIn = () => {
        leftButtonScale.value = withSpring(0.9);
    };

    const handleLeftPressOut = () => {
        leftButtonScale.value = withSpring(1);
    };

    const handleRightPressIn = () => {
        rightButtonScale.value = withSpring(0.9);
    };

    const handleRightPressOut = () => {
        rightButtonScale.value = withSpring(1);
    };
    return (
        <View style={[
            styles.container,
            { backgroundColor },
            showBorder && styles.border
        ]}>
            <View style={styles.leftContainer}>
                {leftAction && (
                    <AnimatedTouchableOpacity
                        onPress={leftAction.onPress}
                        onPressIn={handleLeftPressIn}
                        onPressOut={handleLeftPressOut}
                        style={[styles.actionButton, leftAnimatedStyle]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={[
                            styles.actionText,
                            { color: leftAction.color || Theme.light.colors.primary }
                        ]}>
                            {leftAction.label}
                        </Text>
                    </AnimatedTouchableOpacity>
                )}
            </View>

            <View style={styles.centerContainer}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
            </View>

            <View style={styles.rightContainer}>
                {rightAction && (
                    <AnimatedTouchableOpacity
                        onPress={rightAction.onPress}
                        onPressIn={handleRightPressIn}
                        onPressOut={handleRightPressOut}
                        style={[styles.actionButton, rightAnimatedStyle]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={[
                            styles.actionText,
                            { color: rightAction.color || Theme.light.colors.primary }
                        ]}>
                            {rightAction.label}
                        </Text>
                    </AnimatedTouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Theme.light.spacing.medium,
        paddingVertical: Theme.light.spacing.small,
        minHeight: 56,
    },
    border: {
        borderBottomWidth: 1,
        borderBottomColor: Theme.light.colors.border,
    },
    leftContainer: {
        flex: 1,
        alignItems: "flex-start",
    },
    centerContainer: {
        flex: 2,
        alignItems: "center",
    },
    rightContainer: {
        flex: 1,
        alignItems: "flex-end",
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: Theme.light.colors.text,
        textAlign: "center",
    },
    actionButton: {
        padding: Theme.light.spacing.small,
    },
    actionText: {
        fontSize: 16,
        fontWeight: "500",
    },
});

export default Header;