/**
 * Task Parser Service - Intelligent Natural Language Processing for Task Creation
 * 
 * This service implements a rule-based algorithm to parse natural language speech
 * into individual tasks. It uses multiple strategies to identify task boundaries
 * and split complex speech into actionable task items.
 */

/**
 * Configuration options for task parsing
 */
export interface ParseOptions {
    /** Minimum length for a valid task (default: 3) */
    minTaskLength?: number;
    /** Maximum number of tasks to extract (default: 10) */
    maxTasks?: number;
    /** Whether to preserve original text as fallback (default: true) */
    preserveOriginalOnFailure?: boolean;
    /** Language-specific parsing rules (default: 'en') */
    language?: string;
}

/**
 * Result of parsing operation with metadata
 */
export interface ParseResult {
    /** Array of parsed task titles */
    tasks: string[];
    /** Original input text */
    originalText: string;
    /** Confidence score for parsing quality (0-1) */
    confidence: number;
    /** Strategy used for parsing */
    strategy: ParseStrategy;
    /** Whether parsing was successful */
    success: boolean;
}

/**
 * Available parsing strategies
 */
export enum ParseStrategy {
    SINGLE_TASK = 'single_task',
    CONJUNCTION_SPLIT = 'conjunction_split',
    PUNCTUATION_SPLIT = 'punctuation_split',
    ACTION_VERB_SPLIT = 'action_verb_split',
    HYBRID = 'hybrid',
    FALLBACK = 'fallback',
}

/**
 * Common coordinating conjunctions used to split tasks
 */
const CONJUNCTIONS = [
    'and', 'then', 'also', 'plus', 'after that', 'next', 'afterwards',
    'followed by', 'as well as', '&', '+', 'along with'
];

/**
 * Common action verbs that typically start tasks
 */
const ACTION_VERBS = [
    'buy', 'call', 'email', 'text', 'schedule', 'book', 'reserve', 'order',
    'pick up', 'drop off', 'visit', 'go to', 'check', 'review', 'finish',
    'complete', 'start', 'begin', 'organize', 'clean', 'wash', 'prepare',
    'make', 'create', 'write', 'read', 'send', 'deliver', 'return',
    'cancel', 'confirm', 'update', 'remind', 'remember', 'pay', 'transfer'
];

/**
 * Patterns that suggest the text should remain as a single task
 */
const SINGLE_TASK_INDICATORS = [
    'groceries:', 'shopping list:', 'items:', 'things to',
    'remember to', 'don\'t forget', 'note to self'
];

/**
 * Main task parser class with multiple parsing strategies
 */
export class TaskParser {
    private options: Required<ParseOptions>;

    /**
     * Initialize task parser with configuration options
     * 
     * @param options - Parsing configuration options
     */
    constructor(options: ParseOptions = {}) {
        this.options = {
            minTaskLength: 3,
            maxTasks: 10,
            preserveOriginalOnFailure: true,
            language: 'en',
            ...options
        };
    }

    /**
     * Parse speech text into individual tasks using intelligent strategies
     * 
     * This is the main entry point that applies multiple parsing strategies
     * and returns the best result based on confidence scoring.
     * 
     * @param text - Raw speech text to parse
     * @returns ParseResult with tasks and metadata
     * 
     * @example
     * ```typescript
     * const parser = new TaskParser();
     * const result = parser.parseTasksFromSpeech("Buy milk and call mom then schedule dentist");
     * // Result: { tasks: ["Buy milk", "Call mom", "Schedule dentist"], ... }
     * ```
     */
    parseTasksFromSpeech(text: string): ParseResult {
        if (!text?.trim()) {
            return this.createFailureResult(text, 'Empty input text');
        }

        const cleanText = this.preprocessText(text);

        // Try different parsing strategies in order of preference
        const strategies = [
            () => this.tryConjunctionSplit(cleanText),
            () => this.tryPunctuationSplit(cleanText),
            () => this.tryActionVerbSplit(cleanText),
            () => this.tryHybridSplit(cleanText),
        ];

        let bestResult: ParseResult | null = null;

        // Apply each strategy and find the best one
        for (const strategy of strategies) {
            try {
                const result = strategy();
                if (result.success && result.confidence > 0.5) {
                    if (!bestResult || result.confidence > bestResult.confidence) {
                        bestResult = result;
                    }
                }
            } catch (error) {
                console.warn('Parser strategy failed:', error);
            }
        }

        // Return best result or fallback
        return bestResult || this.createFallbackResult(cleanText);
    }

    /**
     * Preprocess text by cleaning and normalizing
     * 
     * @private
     */
    private preprocessText(text: string): string {
        return text
            .trim()
            .toLowerCase()
            // Normalize common speech patterns
            .replace(/\s+/g, ' ')
            .replace(/[,;]\s*and\s+/gi, ' and ')
            .replace(/\s*then\s+/gi, ' then ')
            // Handle common speech-to-text artifacts
            .replace(/\s*\.\s*and\s+/gi, ' and ')
            .replace(/^(i need to|i have to|i want to|i should)\s+/gi, '');
    }

    /**
     * Split tasks based on conjunctions (and, then, also, etc.)
     * 
     * @private
     */
    private tryConjunctionSplit(text: string): ParseResult {
        const pattern = new RegExp(`\\b(${CONJUNCTIONS.join('|')})\\b`, 'gi');
        const parts = text.split(pattern).filter(part => part && !CONJUNCTIONS.includes(part.trim().toLowerCase()));

        if (parts.length > 1) {
            const tasks = parts
                .map(task => this.cleanTask(task))
                .filter(task => task.length >= this.options.minTaskLength)
                .slice(0, this.options.maxTasks);

            if (tasks.length > 1) {
                return {
                    tasks,
                    originalText: text,
                    confidence: 0.9,
                    strategy: ParseStrategy.CONJUNCTION_SPLIT,
                    success: true
                };
            }
        }

        return this.createFailureResult(text, 'No conjunctions found');
    }

    /**
     * Split tasks based on punctuation (commas, periods, etc.)
     * 
     * @private
     */
    private tryPunctuationSplit(text: string): ParseResult {
        // Check if this looks like a single task with details
        if (SINGLE_TASK_INDICATORS.some(indicator => text.includes(indicator))) {
            return this.createFailureResult(text, 'Single task indicator found');
        }

        const parts = text.split(/[,.;]+/).filter(part => part.trim());

        if (parts.length > 1) {
            const tasks = parts
                .map(task => this.cleanTask(task))
                .filter(task => task.length >= this.options.minTaskLength)
                .slice(0, this.options.maxTasks);

            if (tasks.length > 1) {
                return {
                    tasks,
                    originalText: text,
                    confidence: 0.7,
                    strategy: ParseStrategy.PUNCTUATION_SPLIT,
                    success: true
                };
            }
        }

        return this.createFailureResult(text, 'No punctuation splits found');
    }

    /**
     * Split tasks based on action verbs at the beginning of phrases
     * 
     * @private
     */
    private tryActionVerbSplit(text: string): ParseResult {
        const words = text.split(' ');
        const tasks: string[] = [];
        let currentTask: string[] = [];

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const twoWordVerb = `${word} ${words[i + 1] || ''}`.trim();

            // Check if this word or two-word combination is an action verb
            const isActionStart = ACTION_VERBS.includes(word.toLowerCase()) ||
                ACTION_VERBS.includes(twoWordVerb.toLowerCase());

            if (isActionStart && currentTask.length > 0) {
                // Save current task and start new one
                const taskText = this.cleanTask(currentTask.join(' '));
                if (taskText.length >= this.options.minTaskLength) {
                    tasks.push(taskText);
                }
                currentTask = [word];
            } else {
                currentTask.push(word);
            }
        }

        // Add the final task
        if (currentTask.length > 0) {
            const taskText = this.cleanTask(currentTask.join(' '));
            if (taskText.length >= this.options.minTaskLength) {
                tasks.push(taskText);
            }
        }

        if (tasks.length > 1) {
            return {
                tasks: tasks.slice(0, this.options.maxTasks),
                originalText: text,
                confidence: 0.8,
                strategy: ParseStrategy.ACTION_VERB_SPLIT,
                success: true
            };
        }

        return this.createFailureResult(text, 'No action verb splits found');
    }

    /**
     * Hybrid approach combining multiple strategies
     * 
     * @private
     */
    private tryHybridSplit(text: string): ParseResult {
        // First try conjunction split, then refine with punctuation
        const conjunctionResult = this.tryConjunctionSplit(text);

        if (conjunctionResult.success && conjunctionResult.tasks.length > 1) {
            // Try to further split tasks that contain commas
            const refinedTasks: string[] = [];

            for (const task of conjunctionResult.tasks) {
                if (task.includes(',') && !SINGLE_TASK_INDICATORS.some(indicator => task.includes(indicator))) {
                    const subTasks = task.split(',').map(t => this.cleanTask(t));
                    refinedTasks.push(...subTasks.filter(t => t.length >= this.options.minTaskLength));
                } else {
                    refinedTasks.push(task);
                }
            }

            if (refinedTasks.length > conjunctionResult.tasks.length) {
                return {
                    tasks: refinedTasks.slice(0, this.options.maxTasks),
                    originalText: text,
                    confidence: 0.85,
                    strategy: ParseStrategy.HYBRID,
                    success: true
                };
            }
        }

        return this.createFailureResult(text, 'Hybrid strategy did not improve results');
    }

    /**
     * Clean and capitalize task text
     * 
     * @private
     */
    private cleanTask(task: string): string {
        return task
            .trim()
            .replace(/^(and|then|also|plus)\s+/gi, '')
            .replace(/\s+/g, ' ')
            .replace(/^./, char => char.toUpperCase());
    }

    /**
     * Create a failure result for unsuccessful parsing attempts
     * 
     * @private
     */
    private createFailureResult(text: string, reason: string): ParseResult {
        return {
            tasks: [],
            originalText: text,
            confidence: 0,
            strategy: ParseStrategy.FALLBACK,
            success: false
        };
    }

    /**
     * Create fallback result with original text as single task
     * 
     * @private
     */
    private createFallbackResult(text: string): ParseResult {
        const cleanedText = this.cleanTask(text);

        return {
            tasks: this.options.preserveOriginalOnFailure && cleanedText.length >= this.options.minTaskLength
                ? [cleanedText]
                : [],
            originalText: text,
            confidence: 0.3,
            strategy: ParseStrategy.FALLBACK,
            success: this.options.preserveOriginalOnFailure && cleanedText.length >= this.options.minTaskLength
        };
    }
}

/**
 * Factory function to create a task parser with default settings
 * 
 * @param options - Optional configuration overrides
 * @returns TaskParser instance
 * 
 * @example
 * ```typescript
 * const parser = createTaskParser({ maxTasks: 5 });
 * const result = parser.parseTasksFromSpeech("Buy bread and milk");
 * ```
 */
export const createTaskParser = (options?: ParseOptions): TaskParser => {
    return new TaskParser(options);
};

/**
 * Quick parse function for simple use cases
 * 
 * Convenient function that creates a parser and immediately parses text
 * using default settings. Perfect for one-off parsing operations.
 * 
 * @param text - Speech text to parse
 * @param options - Optional parsing configuration
 * @returns Array of task strings
 * 
 * @example
 * ```typescript
 * const tasks = parseTasksFromSpeech("Call mom and buy groceries");
 * // Returns: ["Call mom", "Buy groceries"]
 * ```
 */
export const parseTasksFromSpeech = (text: string, options?: ParseOptions): string[] => {
    const parser = createTaskParser(options);
    const result = parser.parseTasksFromSpeech(text);
    return result.tasks;
};

/**
 * Validate if a text string could potentially contain multiple tasks
 * 
 * Quick check to determine if it's worth trying to parse multiple tasks
 * from a given text string. Useful for UI decisions.
 * 
 * @param text - Text to validate
 * @returns boolean indicating if text likely contains multiple tasks
 * 
 * @example
 * ```typescript
 * if (couldContainMultipleTasks("Buy milk and call mom")) {
 *   // Show "Split tasks?" UI option
 * }
 * ```
 */
export const couldContainMultipleTasks = (text: string): boolean => {
    if (!text?.trim()) return false;

    const lowerText = text.toLowerCase();

    // Check for conjunctions
    const hasConjunctions = CONJUNCTIONS.some(conj => lowerText.includes(` ${conj} `));

    // Check for multiple punctuation marks
    const punctuationCount = (text.match(/[,.;]/g) || []).length;

    // Check for multiple action verbs
    const actionVerbCount = ACTION_VERBS.filter(verb => lowerText.includes(verb)).length;

    return hasConjunctions || punctuationCount > 0 || actionVerbCount > 1;
};