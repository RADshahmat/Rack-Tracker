import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { ApiResponse } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Warning {
    id: number;
    rack_id: number;
    rack_tag: string;
    message: string;
    resolved: boolean;
    emailed: boolean;
    created_at: string;
}

function useUnresolvedWarnings() {
    return useQuery({
        queryKey: queryKeys.admin.warningsList(false),
        queryFn: () =>
            apiClient.get<ApiResponse<Warning[]>>('/warnings/unresolved'),
        refetchInterval: 30_000,
    });
}

export function AlertsPanel() {
    const { data, isLoading } = useUnresolvedWarnings();
    const warnings = data?.data ?? [];

    return (
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Alerts & Notifications
            </h3>

            {isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : warnings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400 gap-2">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                    <span className="text-sm">No active warnings</span>
                </div>
            ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {warnings.map((warning) => (
                        <div
                            key={warning.id}
                            className="flex items-start gap-3 p-3 rounded-md border border-yellow-200 dark:border-yellow-900/40 bg-yellow-50 dark:bg-yellow-900/10"
                        >
                            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {warning.rack_tag}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                        Unresolved
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                    {warning.message}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}