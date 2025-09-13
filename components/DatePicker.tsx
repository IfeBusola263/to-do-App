import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Theme } from '../theme';

interface DatePickerProps {
    label: string;
    value?: Date;
    onDateChange: (date: Date | undefined) => void;
    error?: string;
    containerStyle?: any;
    placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
    label,
    value,
    onDateChange,
    error,
    containerStyle,
    placeholder = "Select due date (optional)"
}) => {
    const [showPicker, setShowPicker] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const formatDate = (date: Date): string => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        if (event.type === 'set' && selectedDate) {
            onDateChange(selectedDate);
        } else if (event.type === 'dismissed') {
            // User cancelled, don't change the date
        }

        if (Platform.OS === 'ios') {
            setShowModal(false);
        }
    };

    const clearDate = () => {
        onDateChange(undefined);
    };

    const openPicker = () => {
        if (Platform.OS === 'ios') {
            setShowModal(true);
        } else {
            setShowPicker(true);
        }
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <Text style={styles.label}>{label}</Text>

            <TouchableOpacity
                style={[
                    styles.dateInput,
                    error && styles.errorInput
                ]}
                onPress={openPicker}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.dateText,
                    !value && styles.placeholderText
                ]}>
                    {value ? formatDate(value) : placeholder}
                </Text>
            </TouchableOpacity>

            {value && (
                <TouchableOpacity onPress={clearDate} style={styles.clearButton}>
                    <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Android DatePicker */}
            {showPicker && Platform.OS === 'android' && (
                <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                />
            )}

            {/* iOS DatePicker Modal */}
            {Platform.OS === 'ios' && (
                <Modal
                    visible={showModal}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setShowModal(false)}>
                                    <Text style={styles.modalButton}>Cancel</Text>
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Select Due Date</Text>
                                <TouchableOpacity onPress={() => setShowModal(false)}>
                                    <Text style={[styles.modalButton, styles.doneButton]}>Done</Text>
                                </TouchableOpacity>
                            </View>

                            <DateTimePicker
                                value={value || new Date()}
                                mode="date"
                                display="spinner"
                                onChange={handleDateChange}
                                minimumDate={new Date()}
                                style={styles.iosDatePicker}
                            />
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Theme.light.spacing.medium,
    },
    label: {
        fontSize: Theme.light.typography.body.fontSize,
        fontWeight: '600',
        color: Theme.light.colors.text,
        marginBottom: Theme.light.spacing.xs,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: Theme.light.colors.border,
        borderRadius: Theme.light.borderRadius.medium,
        padding: Theme.light.spacing.medium,
        backgroundColor: Theme.light.colors.surface,
        minHeight: 50,
        justifyContent: 'center',
    },
    errorInput: {
        borderColor: Theme.light.colors.error,
    },
    dateText: {
        fontSize: Theme.light.typography.body.fontSize,
        color: Theme.light.colors.text,
    },
    placeholderText: {
        color: Theme.light.colors.textSecondary,
        fontStyle: 'italic',
    },
    clearButton: {
        alignSelf: 'flex-end',
        marginTop: Theme.light.spacing.xs,
        padding: Theme.light.spacing.xs,
    },
    clearText: {
        color: Theme.light.colors.primary,
        fontSize: Theme.light.typography.caption.fontSize,
        fontWeight: '500',
    },
    errorText: {
        color: Theme.light.colors.error,
        fontSize: Theme.light.typography.caption.fontSize,
        marginTop: Theme.light.spacing.xs,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Theme.light.colors.surface,
        borderTopLeftRadius: Theme.light.borderRadius.large,
        borderTopRightRadius: Theme.light.borderRadius.large,
        paddingBottom: 34, // Safe area for iOS
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Theme.light.spacing.medium,
        borderBottomWidth: 1,
        borderBottomColor: Theme.light.colors.border,
    },
    modalTitle: {
        fontSize: Theme.light.typography.body.fontSize,
        fontWeight: '600',
        color: Theme.light.colors.text,
    },
    modalButton: {
        color: Theme.light.colors.primary,
        fontSize: Theme.light.typography.body.fontSize,
        fontWeight: '500',
    },
    doneButton: {
        fontWeight: '600',
    },
    iosDatePicker: {
        height: 200,
    },
});

export default DatePicker;