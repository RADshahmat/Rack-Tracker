import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { usePromQuery } from '../hooks/usePrometheus';
import { Skeleton } from '@/components/ui/skeleton';
import type { PromRangeResult } from '../api';
import { AlertCircle } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function HttpRequestRateChart() {
    const { data, isLoading, isError } = usePromQuery(
        'rate(http_requests_total[5m])',
        true
    );

    const { chartData, seriesKeys } = useMemo(() => {
        const result = data?.data?.result as PromRangeResult[] | undefined;
        if (!result || result.length === 0) {
            return { chartData: [], seriesKeys: [] };
        }

        // Build a label per series e.g. "GET /api/racks"
        const labeled = result.map((series) => ({
            key: `${series.metric.method ?? '?'} ${series.metric.route ?? '?'}`,
            values: series.values,
        }));

        // Merge into one array keyed by timestamp
        const timeMap = new Map<number, Record<string, any>>();

        labeled.forEach(({ key, values }) => {
            values.forEach(([timestamp, value]) => {
                const entry = timeMap.get(timestamp) || { timestamp };
                entry[key] = parseFloat(value);
                timeMap.set(timestamp, entry);
            });
        });

        const merged = Array.from(timeMap.values())
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((entry) => ({
                ...entry,
                time: new Date(entry.timestamp * 1000).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            }));

        return { chartData: merged, seriesKeys: labeled.map((l) => l.key) };
    }, [data]);

    if (isLoading) {
        return <Skeleton className="h-64 w-full" />;
    }

    if (isError || chartData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400 gap-2">
                <AlertCircle className="h-6 w-6" />
                <span className="text-sm">No request traffic recorded yet</span>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={256}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                    }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {seriesKeys.slice(0, 5).map((key, i) => (
                    <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}