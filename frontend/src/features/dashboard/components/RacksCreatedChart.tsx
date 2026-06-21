import { useMemo } from 'react';
import { LineChart, Line, XAxis,YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
import { usePromQuery } from '../hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';
import type{ PromRangeResult } from '../api';
import { AlertCircle } from 'lucide-react';

export function RacksCreatedChart() {
    const { data, isLoading, isError } = usePromQuery(
        'racks_created_total',
        true
    );

    const chartData = useMemo(() => {
        const result = data?.data?.result as PromRangeResult[] | undefined;
        if (!result || result.length === 0) return [];

        return result[0].values.map(([timestamp, value]) => ({
            time: new Date(timestamp * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
            value: parseFloat(value),
        }));
    }, [data]);

    if (isLoading) {
        return <Skeleton className="h-64 w-full" />;
    }

    if (isError || chartData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400 gap-2">
                <AlertCircle className="h-6 w-6" />
                <span className="text-sm">No data available yet</span>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={256}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    className="text-gray-500 dark:text-gray-400"
                />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="Racks Created"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}