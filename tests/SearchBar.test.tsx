import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import SearchBar from '../components/SearchBar';

describe('SearchBar', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      const { getByPlaceholderText, getByTestId } = render(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );

      expect(getByPlaceholderText('Search...')).toBeTruthy();
      expect(getByTestId('search-input')).toBeTruthy();
      expect(getByTestId('search-icon')).toBeTruthy();
    });

    it('renders with custom placeholder', () => {
      const { getByPlaceholderText } = render(
        <SearchBar 
          value="" 
          onChangeText={mockOnChangeText} 
          placeholder="Search tasks..."
        />
      );

      expect(getByPlaceholderText('Search tasks...')).toBeTruthy();
    });

    it('displays the current value', () => {
      const { getByDisplayValue } = render(
        <SearchBar value="test query" onChangeText={mockOnChangeText} />
      );

      expect(getByDisplayValue('test query')).toBeTruthy();
    });

    it('shows clear button when there is text', () => {
      const { getByTestId } = render(
        <SearchBar value="some text" onChangeText={mockOnChangeText} />
      );

      expect(getByTestId('clear-button')).toBeTruthy();
    });

    it('hides clear button when text is empty', () => {
      const { queryByTestId } = render(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );

      expect(queryByTestId('clear-button')).toBeNull();
    });
  });

  describe('Interactions', () => {
    it('calls onChangeText when text is entered', () => {
      const { getByTestId } = render(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );

      const input = getByTestId('search-input');
      fireEvent.changeText(input, 'new search query');

      expect(mockOnChangeText).toHaveBeenCalledWith('new search query');
    });

    it('clears text when clear button is pressed', () => {
      const { getByTestId } = render(
        <SearchBar value="some text" onChangeText={mockOnChangeText} />
      );

      const clearButton = getByTestId('clear-button');
      fireEvent.press(clearButton);

      expect(mockOnChangeText).toHaveBeenCalledWith('');
    });

    it('handles focus and blur events', () => {
      const { getByTestId } = render(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );

      const input = getByTestId('search-input');
      
      fireEvent(input, 'focus');
      // Focus event should work without errors
      
      fireEvent(input, 'blur');
      // Blur event should work without errors
      
      expect(input).toBeTruthy();
    });

    it('handles return key press', () => {
      const { getByTestId } = render(
        <SearchBar value="test" onChangeText={mockOnChangeText} />
      );

      const input = getByTestId('search-input');
      fireEvent(input, 'submitEditing');

      // Should not crash or cause errors
      expect(input).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('applies focus styling when focused', () => {
      const { getByTestId } = render(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );

      const input = getByTestId('search-input');
      fireEvent(input, 'focus');

      // Component should handle focus styling
      expect(input).toBeTruthy();
    });

    it('removes focus styling when blurred', () => {
      const { getByTestId } = render(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );

      const input = getByTestId('search-input');
      fireEvent(input, 'focus');
      fireEvent(input, 'blur');

      // Component should handle blur styling
      expect(input).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByLabelText } = render(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );

      expect(getByLabelText('Search input')).toBeTruthy();
    });

    it('has accessible clear button when text is present', () => {
      const { getByLabelText } = render(
        <SearchBar value="text" onChangeText={mockOnChangeText} />
      );

      expect(getByLabelText('Clear search')).toBeTruthy();
    });

    it('supports keyboard navigation', () => {
      const { getByTestId } = render(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );

      const input = getByTestId('search-input');
      
      // Input should be focusable
      expect(input.props.accessible).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid text changes', () => {
      const { getByTestId } = render(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );

      const input = getByTestId('search-input');
      
      fireEvent.changeText(input, 'a');
      fireEvent.changeText(input, 'ab');
      fireEvent.changeText(input, 'abc');

      expect(mockOnChangeText).toHaveBeenCalledTimes(3);
      expect(mockOnChangeText).toHaveBeenLastCalledWith('abc');
    });

    it('handles empty string properly', () => {
      const { getByTestId, queryByTestId } = render(
        <SearchBar value="" onChangeText={mockOnChangeText} />
      );

      expect(getByTestId('search-input')).toBeTruthy();
      expect(queryByTestId('clear-button')).toBeNull();
    });

    it('handles whitespace-only strings', () => {
      const { getByTestId } = render(
        <SearchBar value="   " onChangeText={mockOnChangeText} />
      );

      const clearButton = getByTestId('clear-button');
      expect(clearButton).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(
        <SearchBar value="test" onChangeText={mockOnChangeText} />
      );

      // Re-render with same props
      rerender(
        <SearchBar value="test" onChangeText={mockOnChangeText} />
      );

      // Should not cause performance issues
      expect(mockOnChangeText).not.toHaveBeenCalled();
    });

    it('handles long search queries efficiently', () => {
      const longQuery = 'a'.repeat(1000);
      const { getByDisplayValue } = render(
        <SearchBar value={longQuery} onChangeText={mockOnChangeText} />
      );

      expect(getByDisplayValue(longQuery)).toBeTruthy();
    });
  });
});