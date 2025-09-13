import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { Theme } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const buttonStyles: StyleProp<ViewStyle>[] = [styles.baseButton];
  const buttonTextStyles: StyleProp<TextStyle>[] = [styles.baseText];

  if (variant === 'primary') {
    buttonStyles.push(styles.primaryButton);
    buttonTextStyles.push(styles.primaryText);
  } else if (variant === 'secondary') {
    buttonStyles.push(styles.secondaryButton);
    buttonTextStyles.push(styles.secondaryText);
  } else if (variant === 'text') {
    buttonStyles.push(styles.textButton);
    buttonTextStyles.push(styles.textText);
  }

  if (style) {
    buttonStyles.push(style);
  }

  if (textStyle) {
    buttonTextStyles.push(textStyle);
  }

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress}>
      <Text style={buttonTextStyles}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    paddingVertical: Theme.light.spacing.medium,
    paddingHorizontal: Theme.light.spacing.large,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontSize: Theme.light.typography.body.fontSize,
    fontWeight: Theme.light.typography.body!.fontWeight as 'bold',
  },
  primaryButton: {
    backgroundColor: Theme.light.colors.primary,
  },
  primaryText: {
    color: Theme.light.colors.background,
  },
  secondaryButton: {
    backgroundColor: Theme.light.colors.accent,
  },
  secondaryText: {
    color: Theme.light.colors.background,
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  textText: {
    color: Theme.light.colors.primary,
  },
});

export default Button;