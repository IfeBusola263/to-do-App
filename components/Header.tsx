import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../theme";

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
    return (
        <View style={[
            styles.container,
            { backgroundColor },
            showBorder && styles.border
        ]}>
            <View style={styles.leftContainer}>
                {leftAction && (
                    <TouchableOpacity
                        onPress={leftAction.onPress}
                        style={styles.actionButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={[
                            styles.actionText,
                            { color: leftAction.color || Theme.light.colors.primary }
                        ]}>
                            {leftAction.label}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.centerContainer}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
            </View>

            <View style={styles.rightContainer}>
                {rightAction && (
                    <TouchableOpacity
                        onPress={rightAction.onPress}
                        style={styles.actionButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={[
                            styles.actionText,
                            { color: rightAction.color || Theme.light.colors.primary }
                        ]}>
                            {rightAction.label}
                        </Text>
                    </TouchableOpacity>
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