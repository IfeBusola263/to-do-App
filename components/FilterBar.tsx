import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useTaskContext } from '../context/TaskContext';
import { Theme } from '../theme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export type TaskFilter = 'all' | 'active' | 'completed' | 'overdue' | 'today' | 'upcoming';

interface FilterOption {
    key: TaskFilter;
    label: string;
    count?: number;
}

interface FilterBarProps {
    activeFilter: TaskFilter;
    onFilterChange: (filter: TaskFilter) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
    activeFilter,
    onFilterChange,
}) => {
    const { tasks } = useTaskContext();

    // Calculate filter counts
    const filterCounts = React.useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const counts: Record<TaskFilter, number> = {
            all: tasks.length,
            active: tasks.filter(task => !task.completed).length,
            completed: tasks.filter(task => task.completed).length,
            overdue: tasks.filter(task => {
                if (task.completed || !task.dueDate) return false;
                return new Date(task.dueDate) < today;
            }).length,
            today: tasks.filter(task => {
                if (!task.dueDate) return false;
                const dueDate = new Date(task.dueDate);
                return dueDate >= today && dueDate < tomorrow;
            }).length,
            upcoming: tasks.filter(task => {
                if (task.completed || !task.dueDate) return false;
                return new Date(task.dueDate) >= tomorrow;
            }).length,
        };

        return counts;
    }, [tasks]);
    const filterOptions: FilterOption[] = [
        { key: 'all', label: 'All', count: filterCounts.all },
        { key: 'active', label: 'Active', count: filterCounts.active },
        { key: 'completed', label: 'Completed', count: filterCounts.completed },
        { key: 'overdue', label: 'Overdue', count: filterCounts.overdue },
        { key: 'today', label: 'Due Today', count: filterCounts.today },
        { key: 'upcoming', label: 'Upcoming', count: filterCounts.upcoming },
    ];

    const renderFilterButton = (option: FilterOption) => {
        const isActive = activeFilter === option.key;
        const hasCount = (option.count ?? 0) > 0;
        const scale = useSharedValue(1);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
        }));

        const handlePressIn = () => {
            scale.value = withSpring(0.95);
        };

        const handlePressOut = () => {
            scale.value = withSpring(1);
        };

        const handlePress = () => {
            onFilterChange(option.key);
        };

        return (
            <AnimatedTouchableOpacity
                key={option.key}
                style={[
                    styles.filterButton,
                    isActive && styles.activeFilterButton,
                    !hasCount && !isActive && styles.disabledFilterButton,
                    animatedStyle,
                ]}
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.7}
                disabled={!hasCount && !isActive}
            >
                <Text style={[
                    styles.filterText,
                    isActive && styles.activeFilterText,
                    !hasCount && !isActive && styles.disabledFilterText,
                ]}>
                    {option.label}
                </Text>
                {hasCount && (
                    <View style={[
                        styles.countBadge,
                        isActive && styles.activeCountBadge
                    ]}>
                        <Text style={[
                            styles.countText,
                            isActive && styles.activeCountText
                        ]}>
                            {option.count}
                        </Text>
                    </View>
                )}
            </AnimatedTouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
            >
                {filterOptions.map(renderFilterButton)}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Theme.light.colors.background,
        paddingVertical: Theme.light.spacing.small,
        borderBottomWidth: 1,
        borderBottomColor: Theme.light.colors.border,
    },
    scrollView: {
        flexGrow: 0,
    },
    scrollContent: {
        paddingHorizontal: Theme.light.spacing.medium,
        gap: Theme.light.spacing.small,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Theme.light.spacing.medium,
        paddingVertical: Theme.light.spacing.small,
        borderRadius: Theme.light.borderRadius.large,
        backgroundColor: Theme.light.colors.surface,
        borderWidth: 1,
        borderColor: Theme.light.colors.border,
        marginRight: Theme.light.spacing.small,
    },
    activeFilterButton: {
        backgroundColor: Theme.light.colors.primary,
        borderColor: Theme.light.colors.primary,
    },
    disabledFilterButton: {
        opacity: 0.5,
    },
    filterText: {
        fontSize: Theme.light.typography.caption.fontSize,
        fontWeight: '500',
        color: Theme.light.colors.text,
    },
    activeFilterText: {
        color: Theme.light.colors.surface,
        fontWeight: '600',
    },
    disabledFilterText: {
        color: Theme.light.colors.textSecondary,
    },
    countBadge: {
        backgroundColor: Theme.light.colors.primary,
        borderRadius: Theme.light.borderRadius.large,
        paddingHorizontal: Theme.light.spacing.xs,
        paddingVertical: 2,
        marginLeft: Theme.light.spacing.xs,
        minWidth: 18,
        alignItems: 'center',
    },
    activeCountBadge: {
        backgroundColor: Theme.light.colors.surface,
    },
    countText: {
        fontSize: Theme.light.typography.caption.fontSize * 0.85,
        fontWeight: '600',
        color: Theme.light.colors.surface,
    },
    activeCountText: {
        color: Theme.light.colors.primary,
    },
});

export default FilterBar;