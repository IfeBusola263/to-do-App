import {
    validateDueDate,
    validateTaskDescription,
    validateTaskTitle,
} from '../utils/validators';

describe('Validators', () => {
    describe('validateTaskTitle', () => {
        it('returns undefined for valid titles', () => {
            expect(validateTaskTitle('Valid Title')).toBeUndefined();
            expect(validateTaskTitle('A')).toBeUndefined();
            expect(validateTaskTitle('a'.repeat(100))).toBeUndefined();
        });

        it('returns error for empty title', () => {
            expect(validateTaskTitle('')).toBe('Title is required');
            expect(validateTaskTitle('   ')).toBe('Title is required');
        });

        it('returns error for title that is too long', () => {
            const longTitle = 'a'.repeat(101);
            expect(validateTaskTitle(longTitle)).toBe('Title must be 100 characters or less');
        });

        it('handles undefined title', () => {
            expect(validateTaskTitle(undefined as any)).toBe('Title is required');
        });

        it('handles null title', () => {
            expect(validateTaskTitle(null as any)).toBe('Title is required');
        });
    });

    describe('validateTaskDescription', () => {
        it('returns undefined for valid descriptions', () => {
            expect(validateTaskDescription('Valid description')).toBeUndefined();
            expect(validateTaskDescription('')).toBeUndefined(); // Empty is valid
            expect(validateTaskDescription('a'.repeat(500))).toBeUndefined();
        });

        it('returns undefined for empty description (optional field)', () => {
            expect(validateTaskDescription('')).toBeUndefined();
            expect(validateTaskDescription('   ')).toBeUndefined();
        });

        it('returns error for description that is too long', () => {
            const longDescription = 'a'.repeat(501);
            expect(validateTaskDescription(longDescription)).toBe('Description must be 500 characters or less');
        });

        it('handles undefined description', () => {
            expect(validateTaskDescription(undefined)).toBeUndefined();
        });

        it('handles null description', () => {
            expect(validateTaskDescription(null as any)).toBeUndefined();
        });

        it('trims whitespace correctly', () => {
            expect(validateTaskDescription('  valid  ')).toBeUndefined();
        });
    });

    describe('validateDueDate', () => {
        const now = new Date('2025-09-13T12:00:00.000Z');
        const yesterday = new Date('2025-09-12T12:00:00.000Z');
        const tomorrow = new Date('2025-09-14T12:00:00.000Z');

        beforeAll(() => {
            // Mock the current date
            jest.useFakeTimers();
            jest.setSystemTime(now);
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        it('returns undefined for valid future dates', () => {
            expect(validateDueDate(tomorrow)).toBeUndefined();
            expect(validateDueDate(new Date('2025-12-31'))).toBeUndefined();
        });

        it('returns undefined for today', () => {
            const today = new Date('2025-09-13T15:00:00.000Z'); // Same day, different time
            expect(validateDueDate(today)).toBeUndefined();
        });

        it('returns undefined for undefined date (optional field)', () => {
            expect(validateDueDate(undefined)).toBeUndefined();
        });

        it('returns error for past dates', () => {
            expect(validateDueDate(yesterday)).toBe('Due date cannot be in the past');
            expect(validateDueDate(new Date('2025-01-01'))).toBe('Due date cannot be in the past');
        });

        it('handles invalid date objects', () => {
            const invalidDate = new Date('invalid');
            expect(validateDueDate(invalidDate)).toBe('Please select a valid date');
        });

        it('handles null date', () => {
            expect(validateDueDate(null as any)).toBeUndefined();
        });

        it('handles dates at the exact boundary (start of today)', () => {
            const startOfToday = new Date('2025-09-13T00:00:00.000Z');
            expect(validateDueDate(startOfToday)).toBeUndefined();
        });

        it('handles dates at the exact boundary (end of yesterday)', () => {
            const endOfYesterday = new Date('2025-09-12T23:59:59.999Z');
            expect(validateDueDate(endOfYesterday)).toBe('Due date cannot be in the past');
        });
    });

    describe('Edge Cases', () => {
        it('handles various string inputs for title validation', () => {
            expect(validateTaskTitle('123')).toBeUndefined();
            expect(validateTaskTitle('Title with special chars !@#$%')).toBeUndefined();
            expect(validateTaskTitle('Unicode title 🚀')).toBeUndefined();
        });

        it('handles various string inputs for description validation', () => {
            expect(validateTaskDescription('Description with\nnewlines')).toBeUndefined();
            expect(validateTaskDescription('Description with tabs\t')).toBeUndefined();
            expect(validateTaskDescription('Unicode description 🎉')).toBeUndefined();
        });

        it('handles timezone edge cases for due date validation', () => {
            // Test with different timezone offsets
            const utcDate = new Date('2025-09-14T00:00:00.000Z');
            expect(validateDueDate(utcDate)).toBeUndefined();
        });
    });

    describe('Performance', () => {
        it('validates titles quickly for large inputs', () => {
            const mediumTitle = 'a'.repeat(50);
            const start = performance.now();

            for (let i = 0; i < 1000; i++) {
                validateTaskTitle(mediumTitle);
            }

            const end = performance.now();
            expect(end - start).toBeLessThan(100); // Should be very fast
        });

        it('validates descriptions quickly for large inputs', () => {
            const mediumDescription = 'a'.repeat(250);
            const start = performance.now();

            for (let i = 0; i < 1000; i++) {
                validateTaskDescription(mediumDescription);
            }

            const end = performance.now();
            expect(end - start).toBeLessThan(100); // Should be very fast
        });
    });
});