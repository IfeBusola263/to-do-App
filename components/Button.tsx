import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { Theme } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'error' | 'text' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const buttonStyles: StyleProp<ViewStyle>[] = [
    styles.baseButton,
    styles[`${size}Button`],
    styles[`${variant}Button`],
  ];

  const buttonTextStyles: StyleProp<TextStyle>[] = [
    styles.baseText,
    styles[`${size}Text`],
    styles[`${variant}Text`],
  ];

  if (fullWidth) {
    buttonStyles.push(styles.fullWidth);
  }

  if (disabled || loading) {
    buttonStyles.push(styles.disabledButton);
    buttonTextStyles.push(styles.disabledText);
  }

  if (style) {
    buttonStyles.push(style);
  }

  if (textStyle) {
    buttonTextStyles.push(textStyle);
  }

  return (
    <AnimatedTouchableOpacity
      style={[buttonStyles, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'secondary' || variant === 'error'
            ? Theme.light.colors.background
            : Theme.light.colors.primary
          }
        />
      ) : (
        <Text style={buttonTextStyles}>{title}</Text>
      )}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Theme.light.shadows.small,
  },
  baseText: {
    ...Theme.light.typography.button,
  },

  // Size variants
  smallButton: {
    paddingVertical: Theme.light.spacing.small,
    paddingHorizontal: Theme.light.spacing.medium,
    borderRadius: Theme.light.borderRadius.small,
  },
  mediumButton: {
    paddingVertical: Theme.light.spacing.medium,
    paddingHorizontal: Theme.light.spacing.large,
    borderRadius: Theme.light.borderRadius.medium,
  },
  largeButton: {
    paddingVertical: Theme.light.spacing.large,
    paddingHorizontal: Theme.light.spacing.xLarge,
    borderRadius: Theme.light.borderRadius.large,
  },

  // Size text variants
  smallText: {
    fontSize: Theme.light.typography.bodySmall.fontSize,
  },
  mediumText: {
    fontSize: Theme.light.typography.button.fontSize,
  },
  largeText: {
    fontSize: Theme.light.typography.h3.fontSize,
  },

  // Variant styles
  primaryButton: {
    backgroundColor: Theme.light.colors.primary,
  },
  primaryText: {
    color: Theme.light.colors.background,
  },

  secondaryButton: {
    backgroundColor: Theme.light.colors.secondary,
  },
  secondaryText: {
    color: Theme.light.colors.background,
  },

  errorButton: {
    backgroundColor: Theme.light.colors.error,
  },
  errorText: {
    color: Theme.light.colors.background,
  },

  textButton: {
    backgroundColor: 'transparent',
  },
  textText: {
    color: Theme.light.colors.primary,
  },

  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Theme.light.colors.primary,
  },
  outlineText: {
    color: Theme.light.colors.primary,
  },

  // States
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: Theme.light.colors.textTertiary,
  },

  // Layout
  fullWidth: {
    width: '100%',
  },
});

export default Button;