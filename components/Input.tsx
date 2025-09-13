import React, { useState } from 'react';
import { TextInput, Text, View, StyleSheet, StyleProp, ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { Theme } from '../theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          inputStyle,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
      {error ? <Text style={[styles.errorText, errorStyle]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.light.spacing.medium,
  },
  label: {
    fontSize: Theme.light.typography.body.fontSize,
    fontWeight: Theme.light.typography.body.fontWeight as 'normal',
    color: Theme.light.colors.text,
    marginBottom: Theme.light.spacing.small,
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.light.colors.primary,
    borderRadius: 5,
    padding: Theme.light.spacing.medium,
    fontSize: Theme.light.typography.body.fontSize,
    color: Theme.light.colors.text,
  },
  inputFocused: {
    borderColor: Theme.light.colors.accent,
    shadowColor: Theme.light.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  inputError: {
    borderColor: Theme.light.colors.error,
  },
  errorText: {
    color: Theme.light.colors.error,
    fontSize: Theme.light.typography.body.fontSize * 0.85,
    marginTop: Theme.light.spacing.small / 2,
  },
});

export default Input;