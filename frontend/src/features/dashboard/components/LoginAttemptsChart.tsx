import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    ResponsiveContainer,
} from 'recharts';
import { usePromQuery } from '../hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';
import type { PromInstantResult } from '../api';
import { AlertCircle } from 'lucide-react';

export function LoginAttemptsChart() {
    const { data, isLoading, isError } = usePromQuery('auth_login_total', false, {
        refetchInterval: 15_000,
    });

    const chartData = useMemo(() => {
        const result = data?.data?.result as PromInstantResult[] | undefined;
        if (!result) return [];

        return result.map((item) => ({
            status: item.metric.status === 'success' ? 'Success' : 'Failure',
            count: parseFloat(item.value[1]),
        }));
    }, [data]);

    if (isLoading) {
        return <Skeleton className="h-64 w-full" />;
    }

    if (isError || chartData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400 gap-2">
                <AlertCircle className="h-6 w-6" />
                <span className="text-sm">No login attempts recorded yet</span>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={256}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                    }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell
                            key={index}
                            fill={entry.status === 'Success' ? '#10b981' : '#ef4444'}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}