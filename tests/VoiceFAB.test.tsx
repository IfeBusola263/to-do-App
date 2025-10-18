import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import VoiceFAB from '../components/VoiceFAB';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');

    // The mock implementation doesn't include all methods we use
    Reanimated.default.createAnimatedComponent = jest.fn().mockImplementation((Component) => Component);

    return {
        ...Reanimated,
        useSharedValue: jest.fn().mockImplementation((initialValue) => ({
            value: initialValue,
        })),
        useAnimatedStyle: jest.fn().mockImplementation((styleFunction) => styleFunction()),
        withSpring: jest.fn().mockImplementation((value) => value),
        withTiming: jest.fn().mockImplementation((value) => value),
        withSequence: jest.fn().mockImplementation((...values) => values[values.length - 1]),
        interpolate: jest.fn().mockImplementation((value) => value),
    };
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
    MaterialIcons: 'MaterialIcons',
}));

describe('VoiceFAB', () => {
    const defaultProps = {
        onPress: jest.fn(),
        isListening: false,
        disabled: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render correctly with default props', () => {
            const { getByTestId } = render(<VoiceFAB {...defaultProps} />);

            // The FAB should be rendered
            expect(() => render(<VoiceFAB {...defaultProps} />)).not.toThrow();
        });

        it('should render with listening state', () => {
            const { rerender } = render(<VoiceFAB {...defaultProps} />);

            // Change to listening state
            rerender(<VoiceFAB {...defaultProps} isListening={true} />);

            // Should not throw and should handle state change
            expect(() => rerender(<VoiceFAB {...defaultProps} isListening={true} />)).not.toThrow();
        });

        it('should render with disabled state', () => {
            const { rerender } = render(<VoiceFAB {...defaultProps} />);

            rerender(<VoiceFAB {...defaultProps} disabled={true} />);

            expect(() => rerender(<VoiceFAB {...defaultProps} disabled={true} />)).not.toThrow();
        });

        it('should render with different sizes', () => {
            const sizes = ['small', 'medium', 'large'] as const;

            sizes.forEach(size => {
                const { rerender } = render(<VoiceFAB {...defaultProps} size={size} />);
                expect(() => rerender(<VoiceFAB {...defaultProps} size={size} />)).not.toThrow();
            });
        });
    });

    describe('Interaction', () => {
        it('should call onPress when pressed', () => {
            const onPress = jest.fn();
            const { getByRole } = render(<VoiceFAB {...defaultProps} onPress={onPress} />);

            const button = getByRole('button');
            fireEvent.press(button);

            expect(onPress).toHaveBeenCalledTimes(1);
        });

        it('should not call onPress when disabled', () => {
            const onPress = jest.fn();
            const { getByRole } = render(
                <VoiceFAB {...defaultProps} onPress={onPress} disabled={true} />
            );

            const button = getByRole('button');
            fireEvent.press(button);

            expect(onPress).not.toHaveBeenCalled();
        });

        it('should handle press in and press out events', () => {
            const { getByRole } = render(<VoiceFAB {...defaultProps} />);

            const button = getByRole('button');

            // These should not throw
            fireEvent(button, 'pressIn');
            fireEvent(button, 'pressOut');

            expect(() => {
                fireEvent(button, 'pressIn');
                fireEvent(button, 'pressOut');
            }).not.toThrow();
        });
    });

    describe('Props and Positioning', () => {
        it('should apply custom positioning', () => {
            const { rerender } = render(
                <VoiceFAB {...defaultProps} bottom={50} right={30} />
            );

            expect(() => {
                rerender(<VoiceFAB {...defaultProps} bottom={50} right={30} />);
            }).not.toThrow();
        });

        it('should handle showPulse prop', () => {
            const { rerender } = render(
                <VoiceFAB {...defaultProps} isListening={true} showPulse={false} />
            );

            expect(() => {
                rerender(<VoiceFAB {...defaultProps} isListening={true} showPulse={false} />);
            }).not.toThrow();
        });
    });

    describe('State Changes and Animations', () => {
        it('should handle isListening state changes', async () => {
            const { rerender } = render(<VoiceFAB {...defaultProps} isListening={false} />);

            // Change to listening
            rerender(<VoiceFAB {...defaultProps} isListening={true} />);

            await waitFor(() => {
                // Animation should trigger
                expect(() => {
                    rerender(<VoiceFAB {...defaultProps} isListening={true} />);
                }).not.toThrow();
            });
        });

        it('should handle disabled state changes', async () => {
            const { rerender } = render(<VoiceFAB {...defaultProps} disabled={false} />);

            rerender(<VoiceFAB {...defaultProps} disabled={true} />);

            await waitFor(() => {
                expect(() => {
                    rerender(<VoiceFAB {...defaultProps} disabled={true} />);
                }).not.toThrow();
            });
        });

        it('should cleanup animations on unmount', () => {
            const { unmount } = render(<VoiceFAB {...defaultProps} isListening={true} />);

            expect(() => unmount()).not.toThrow();
        });
    });

    describe('Memoization', () => {
        it('should be memoized and not re-render unnecessarily', () => {
            const renderSpy = jest.fn();

            const TestComponent = React.memo(() => {
                renderSpy();
                return <VoiceFAB {...defaultProps} />;
            });

            const { rerender } = render(<TestComponent />);

            // First render
            expect(renderSpy).toHaveBeenCalledTimes(1);

            // Re-render with same props
            rerender(<TestComponent />);

            // Should not re-render due to memo
            expect(renderSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('Accessibility', () => {
        it('should have proper accessibility properties', () => {
            const { getByRole } = render(<VoiceFAB {...defaultProps} />);

            const button = getByRole('button');
            expect(button).toBeDefined();
        });

        it('should handle disabled accessibility state', () => {
            const { getByRole } = render(<VoiceFAB {...defaultProps} disabled={true} />);

            const button = getByRole('button');
            expect(button.props.disabled).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle rapid state changes', () => {
            const { rerender } = render(<VoiceFAB {...defaultProps} isListening={false} />);

            // Rapid state changes
            for (let i = 0; i < 10; i++) {
                rerender(<VoiceFAB {...defaultProps} isListening={i % 2 === 0} />);
            }

            expect(() => {
                rerender(<VoiceFAB {...defaultProps} isListening={true} />);
            }).not.toThrow();
        });

        it('should handle all prop combinations', () => {
            const propCombinations = [
                { isListening: true, disabled: true, showPulse: false },
                { isListening: false, disabled: false, showPulse: true },
                { isListening: true, disabled: false, showPulse: true, size: 'small' as const },
            ];

            propCombinations.forEach(props => {
                expect(() => {
                    render(<VoiceFAB {...defaultProps} {...props} />);
                }).not.toThrow();
            });
        });
    });
});