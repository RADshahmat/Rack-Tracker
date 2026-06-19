import { usePrometheusStatus } from '../hooks/usePrometheus';
import { Badge } from '@/components/ui/badge';
import { Activity, Loader2 } from 'lucide-react';

export function PrometheusStatusCard() {
    const { data, isLoading } = usePrometheusStatus();
    const healthy = data?.data?.healthy ?? false;

    return (
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Prometheus
                </div>
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                    <Badge variant={healthy ? 'default' : 'destructive'} className="gap-1.5">
                        <span
                            className={`h-2 w-2 rounded-full ${healthy ? 'bg-green-400' : 'bg-red-400'
                                }`}
                        />
                        {healthy ? 'Reachable' : 'Unreachable'}
                    </Badge>
                )}
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {healthy ? '✓' : '✗'}
            </div>
        </div>
    );
}