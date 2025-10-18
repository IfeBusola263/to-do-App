import {
    ParseStrategy,
    TaskParser,
    couldContainMultipleTasks,
    createTaskParser,
    parseTasksFromSpeech,
} from '../services/taskParser';

describe('TaskParser', () => {
    let parser: TaskParser;

    beforeEach(() => {
        parser = new TaskParser();
    });

    describe('Constructor and Configuration', () => {
        it('should create parser with default options', () => {
            const defaultParser = new TaskParser();
            expect(defaultParser).toBeInstanceOf(TaskParser);
        });

        it('should create parser with custom options', () => {
            const customParser = new TaskParser({
                minTaskLength: 5,
                maxTasks: 3,
                preserveOriginalOnFailure: false,
                language: 'es',
            });
            expect(customParser).toBeInstanceOf(TaskParser);
        });
    });

    describe('Conjunction-based Parsing', () => {
        it('should split tasks on "and" conjunction', () => {
            const result = parser.parseTasksFromSpeech('Buy milk and call mom');

            expect(result.success).toBe(true);
            expect(result.tasks).toEqual(['Buy milk', 'Call mom']);
            expect(result.strategy).toBe(ParseStrategy.CONJUNCTION_SPLIT);
            expect(result.confidence).toBeGreaterThan(0.8);
        });

        it('should split tasks on "then" conjunction', () => {
            const result = parser.parseTasksFromSpeech('Schedule meeting then email client');

            expect(result.success).toBe(true);
            expect(result.tasks).toEqual(['Schedule meeting', 'Email client']);
            expect(result.strategy).toBe(ParseStrategy.CONJUNCTION_SPLIT);
        });

        it('should handle multiple conjunctions', () => {
            const result = parser.parseTasksFromSpeech('Buy groceries and call mom then visit store also check email');

            expect(result.success).toBe(true);
            expect(result.tasks).toHaveLength(4);
            expect(result.tasks).toContain('Buy groceries');
            expect(result.tasks).toContain('Call mom');
            expect(result.tasks).toContain('Visit store');
            expect(result.tasks).toContain('Check email');
        });

        it('should handle "followed by" and other complex conjunctions', () => {
            const result = parser.parseTasksFromSpeech('Complete report followed by schedule meeting');

            expect(result.success).toBe(true);
            expect(result.tasks).toEqual(['Complete report', 'Schedule meeting']);
        });
    });

    describe('Punctuation-based Parsing', () => {
        it('should split tasks on commas', () => {
            const result = parser.parseTasksFromSpeech('Buy bread, call doctor, finish presentation');

            expect(result.success).toBe(true);
            expect(result.tasks).toEqual(['Buy bread', 'Call doctor', 'Finish presentation']);
        });

        it('should split tasks on periods', () => {
            const result = parser.parseTasksFromSpeech('Book flight. Pack bags. Call taxi.');

            expect(result.success).toBe(true);
            expect(result.tasks).toEqual(['Book flight', 'Pack bags', 'Call taxi']);
        });

        it('should preserve shopping lists and similar contexts', () => {
            const result = parser.parseTasksFromSpeech('Buy groceries: milk, bread, and eggs');

            // Should be treated as single task due to shopping list indicator
            expect(result.tasks).toHaveLength(1);
            expect(result.tasks[0]).toContain('groceries');
        });
    });

    describe('Action Verb-based Parsing', () => {
        it('should split on action verbs', () => {
            const result = parser.parseTasksFromSpeech('buy milk call mom schedule dentist');

            expect(result.success).toBe(true);
            expect(result.tasks).toEqual(['Buy milk', 'Call mom', 'Schedule dentist']);
        });

        it('should handle two-word action verbs', () => {
            const result = parser.parseTasksFromSpeech('pick up kids drop off packages');

            expect(result.success).toBe(true);
            expect(result.tasks).toEqual(['Pick up kids', 'Drop off packages']);
        });

        it('should not split when only one action verb present', () => {
            const result = parser.parseTasksFromSpeech('buy some groceries from the store');

            // Should fall back to single task
            expect(result.tasks).toHaveLength(1);
        });
    });

    describe('Hybrid Parsing Strategy', () => {
        it('should combine conjunction and punctuation parsing', () => {
            const result = parser.parseTasksFromSpeech('Buy milk, bread and call mom, then visit store');

            expect(result.success).toBe(true);
            expect(result.tasks.length).toBeGreaterThan(2);
        });

        it('should refine conjunction results with punctuation', () => {
            const result = parser.parseTasksFromSpeech('Buy groceries: apples, oranges and call mom then check email');

            expect(result.success).toBe(true);
            // Should intelligently handle the grocery list vs separate tasks
        });
    });

    describe('Text Preprocessing', () => {
        it('should remove common speech prefixes', () => {
            const result = parser.parseTasksFromSpeech('I need to buy milk and call mom');

            expect(result.success).toBe(true);
            expect(result.tasks).toEqual(['Buy milk', 'Call mom']);
        });

        it('should normalize whitespace and conjunctions', () => {
            const result = parser.parseTasksFromSpeech('buy   milk    and     call mom');

            expect(result.success).toBe(true);
            expect(result.tasks).toEqual(['Buy milk', 'Call mom']);
        });

        it('should handle mixed case input', () => {
            const result = parser.parseTasksFromSpeech('BUY MILK and call MOM');

            expect(result.success).toBe(true);
            expect(result.tasks).toEqual(['Buy milk', 'Call mom']);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle empty input', () => {
            const result = parser.parseTasksFromSpeech('');

            expect(result.success).toBe(false);
            expect(result.tasks).toEqual([]);
        });

        it('should handle whitespace-only input', () => {
            const result = parser.parseTasksFromSpeech('   ');

            expect(result.success).toBe(false);
            expect(result.tasks).toEqual([]);
        });

        it('should handle very short tasks based on minTaskLength', () => {
            const shortParser = new TaskParser({ minTaskLength: 10 });
            const result = shortParser.parseTasksFromSpeech('hi and bye');

            expect(result.tasks).toEqual([]); // Both tasks too short
        });

        it('should respect maxTasks limit', () => {
            const limitedParser = new TaskParser({ maxTasks: 2 });
            const result = limitedParser.parseTasksFromSpeech('task one and task two and task three and task four');

            expect(result.tasks).toHaveLength(2);
        });

        it('should preserve original on failure when configured', () => {
            const preserveParser = new TaskParser({ preserveOriginalOnFailure: true });
            const result = preserveParser.parseTasksFromSpeech('some unparseable text without clear tasks');

            expect(result.success).toBe(true); // Fallback success
            expect(result.tasks).toHaveLength(1);
            expect(result.tasks[0]).toContain('Some unparseable text');
        });

        it('should not preserve original when configured not to', () => {
            const noPreserveParser = new TaskParser({ preserveOriginalOnFailure: false });
            const result = noPreserveParser.parseTasksFromSpeech('unparseable');

            expect(result.success).toBe(false);
            expect(result.tasks).toEqual([]);
        });
    });

    describe('Confidence Scoring', () => {
        it('should give high confidence to conjunction splits', () => {
            const result = parser.parseTasksFromSpeech('Buy milk and call mom');

            expect(result.confidence).toBeGreaterThanOrEqual(0.9);
            expect(result.strategy).toBe(ParseStrategy.CONJUNCTION_SPLIT);
        });

        it('should give lower confidence to punctuation splits', () => {
            const result = parser.parseTasksFromSpeech('Buy bread, call doctor');

            expect(result.confidence).toBeLessThan(0.9);
            expect(result.confidence).toBeGreaterThan(0.5);
        });

        it('should give low confidence to fallback results', () => {
            const result = parser.parseTasksFromSpeech('just a single task');

            expect(result.confidence).toBeLessThanOrEqual(0.3);
            expect(result.strategy).toBe(ParseStrategy.FALLBACK);
        });
    });
});

describe('Factory Functions', () => {
    it('should create parser with createTaskParser', () => {
        const parser = createTaskParser();
        expect(parser).toBeInstanceOf(TaskParser);
    });

    it('should create parser with custom options using factory', () => {
        const parser = createTaskParser({ maxTasks: 5 });
        expect(parser).toBeInstanceOf(TaskParser);
    });

    it('should parse tasks directly with parseTasksFromSpeech', () => {
        const tasks = parseTasksFromSpeech('Buy milk and call mom');

        expect(Array.isArray(tasks)).toBe(true);
        expect(tasks).toEqual(['Buy milk', 'Call mom']);
    });

    it('should parse with options using direct function', () => {
        const tasks = parseTasksFromSpeech('Buy milk and call mom', { maxTasks: 1 });

        expect(tasks).toHaveLength(1);
    });
});

describe('Utility Functions', () => {
    describe('couldContainMultipleTasks', () => {
        it('should detect conjunctions', () => {
            expect(couldContainMultipleTasks('Buy milk and call mom')).toBe(true);
            expect(couldContainMultipleTasks('Schedule meeting then email client')).toBe(true);
        });

        it('should detect punctuation indicators', () => {
            expect(couldContainMultipleTasks('Buy bread, call doctor')).toBe(true);
            expect(couldContainMultipleTasks('Task one. Task two.')).toBe(true);
        });

        it('should detect multiple action verbs', () => {
            expect(couldContainMultipleTasks('buy groceries call mom')).toBe(true);
            expect(couldContainMultipleTasks('schedule visit organize')).toBe(true);
        });

        it('should return false for single tasks', () => {
            expect(couldContainMultipleTasks('Buy some groceries')).toBe(false);
            expect(couldContainMultipleTasks('Call my mother')).toBe(false);
        });

        it('should handle empty input', () => {
            expect(couldContainMultipleTasks('')).toBe(false);
            expect(couldContainMultipleTasks('   ')).toBe(false);
        });
    });
});

describe('Real-world Examples', () => {
    let parser: TaskParser;

    beforeEach(() => {
        parser = new TaskParser();
    });

    it('should parse typical voice commands correctly', () => {
        const testCases = [
            {
                input: 'Buy groceries and call mom then pick up kids',
                expected: ['Buy groceries', 'Call mom', 'Pick up kids'],
            },
            {
                input: 'Schedule dentist appointment, email the client, finish the report',
                expected: ['Schedule dentist appointment', 'Email the client', 'Finish the report'],
            },
            {
                input: 'Pick up dry cleaning then go to bank and pay bills',
                expected: ['Pick up dry cleaning', 'Go to bank', 'Pay bills'],
            },
        ];

        testCases.forEach(({ input, expected }) => {
            const result = parser.parseTasksFromSpeech(input);
            expect(result.success).toBe(true);
            expect(result.tasks).toEqual(expected);
        });
    });

    it('should preserve context when appropriate', () => {
        const contextCases = [
            'Buy groceries: milk, bread, and eggs',
            'Shopping list: apples, oranges, bananas',
            'Remember to pick up the kids at 3 PM from school',
        ];

        contextCases.forEach(input => {
            const result = parser.parseTasksFromSpeech(input);
            expect(result.tasks).toHaveLength(1);
            expect(result.tasks[0]).toContain(input.replace(/^(i need to|i have to|i want to|i should)\s+/gi, ''));
        });
    });
});