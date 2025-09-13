import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Theme } from '../theme';

interface SearchBarProps {
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    onClear?: () => void;
    autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = "Search tasks...",
    value,
    onChangeText,
    onClear,
    autoFocus = false,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = useCallback(() => {
        onChangeText('');
        onClear?.();
    }, [onChangeText, onClear]);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
    }, []);

    return (
        <View style={[
            styles.container,
            isFocused && styles.focusedContainer
        ]}>
            <MaterialIcons
                name="search"
                size={20}
                color={isFocused ? Theme.light.colors.primary : Theme.light.colors.textSecondary}
                style={styles.searchIcon}
            />

            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={Theme.light.colors.textSecondary}
                value={value}
                onChangeText={onChangeText}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoFocus={autoFocus}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
                clearButtonMode="never" // We'll handle this ourselves
            />

            {value.length > 0 && (
                <TouchableOpacity
                    onPress={handleClear}
                    style={styles.clearButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                >
                    <MaterialIcons
                        name="clear"
                        size={20}
                        color={Theme.light.colors.textSecondary}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.light.colors.surface,
        borderRadius: Theme.light.borderRadius.medium,
        borderWidth: 1,
        borderColor: Theme.light.colors.border,
        paddingHorizontal: Theme.light.spacing.medium,
        paddingVertical: Theme.light.spacing.small,
        marginHorizontal: Theme.light.spacing.medium,
        marginVertical: Theme.light.spacing.small,
    },
    focusedContainer: {
        borderColor: Theme.light.colors.primary,
        shadowColor: Theme.light.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    searchIcon: {
        marginRight: Theme.light.spacing.small,
    },
    input: {
        flex: 1,
        fontSize: Theme.light.typography.body.fontSize,
        color: Theme.light.colors.text,
        paddingVertical: Theme.light.spacing.xs,
    },
    clearButton: {
        marginLeft: Theme.light.spacing.small,
        padding: Theme.light.spacing.xs,
    },
});

export default SearchBar;