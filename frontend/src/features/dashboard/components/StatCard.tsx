import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/utils';

interface StatCardProps {
    label: string;
    value: number | string;
    icon: LucideIcon;
    accent: 'blue' | 'violet' | 'rose' | 'amber';
    isLoading?: boolean;
}

const accentStyles: Record<StatCardProps['accent'], { icon: string; glow: string }> = {
    blue: {
        icon: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
        glow: 'group-hover:shadow-blue-500/10',
    },
    violet: {
        icon: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40',
        glow: 'group-hover:shadow-violet-500/10',
    },
    rose: {
        icon: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40',
        glow: 'group-hover:shadow-rose-500/10',
    },
    amber: {
        icon: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
        glow: 'group-hover:shadow-amber-500/10',
    },
};

export function StatCard({ label, value, icon: Icon, accent, isLoading }: StatCardProps) {
    const styles = accentStyles[accent];

    return (
        <div
            className={cn(
                'group relative bg-white dark:bg-dark-surface border border-gray-200/80 dark:border-dark-border rounded-xl px-4 py-3.5 transition-all duration-200',
                'hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm',
                styles.glow
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                        {label}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-0.5 tabular-nums">
                        {isLoading ? (
                            <span className="inline-block h-7 w-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                        ) : (
                            value.toLocaleString()
                        )}
                    </p>
                </div>
                <div className={cn('rounded-lg p-2 shrink-0', styles.icon)}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
        </div>
    );
}