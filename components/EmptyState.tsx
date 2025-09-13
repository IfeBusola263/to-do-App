import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Theme } from '../theme';

interface EmptyStateProps {
  title?: string;
  description: string;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  iconSize?: number;
  iconColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  iconName = 'inbox',
  iconSize = 80,
  iconColor = Theme.light.colors.textSecondary,
  containerStyle,
  titleStyle,
  descriptionStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <MaterialIcons
        name={iconName}
        size={iconSize}
        color={iconColor}
        style={styles.icon}
      />
      {title && (
        <Text style={[styles.title, titleStyle]}>
          {title}
        </Text>
      )}
      <Text style={[styles.description, descriptionStyle]}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.light.spacing.large,
  },
  icon: {
    marginBottom: Theme.light.spacing.medium,
    opacity: 0.6,
  },
  title: {
    fontSize: Theme.light.typography.h3.fontSize,
    fontWeight: Theme.light.typography.h3.fontWeight as 'bold',
    color: Theme.light.colors.text,
    textAlign: 'center',
    marginBottom: Theme.light.spacing.small,
  },
  description: {
    fontSize: Theme.light.typography.body.fontSize,
    color: Theme.light.colors.textSecondary,
    textAlign: 'center',
    lineHeight: Theme.light.typography.body.lineHeight,
  },
});

export default EmptyState;