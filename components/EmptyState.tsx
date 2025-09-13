import React from 'react';
import { View, Text, StyleSheet, Image, StyleProp, ViewStyle, TextStyle, ImageSourcePropType } from 'react-native';
import { Theme } from '../theme';

interface EmptyStateProps {
  message: string;
  image?: ImageSourcePropType;
  containerStyle?: StyleProp<ViewStyle>;
  messageStyle?: StyleProp<TextStyle>;
  imageStyle?: StyleProp<any>;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  image,
  containerStyle,
  messageStyle,
  imageStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {image && <Image source={image} style={[styles.image, imageStyle]} resizeMode="contain" />}
      <Text style={[styles.message, messageStyle]}>{message}</Text>
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
  image: {
    width: 150,
    height: 150,
    marginBottom: Theme.light.spacing.medium,
  },
  message: {
    fontSize: Theme.light.typography.h2.fontSize,
    fontWeight: Theme.light.typography.h2.fontWeight as 'bold',
    color: Theme.light.colors.text,
    textAlign: 'center',
  },
});

export default EmptyState;