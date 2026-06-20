import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prometheusApi } from '../api';
import { queryKeys } from '@/api/queryKeys';

export const usePrometheusStatus = () => {
    return useQuery({
        queryKey: queryKeys.prometheus.status(),
        queryFn: () => prometheusApi.getStatus(),
        refetchInterval: 10_000,
        retry: false,
    });
};

export const usePrometheusConfig = (enabled: boolean = false) => {
    return useQuery({
        queryKey: queryKeys.prometheus.config(),
        queryFn: () => prometheusApi.getConfig(),
        enabled,
    });
};

export const usePrometheusReload = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => prometheusApi.reload(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.prometheus.all });
        },
    });
};

export const usePromQuery = (
    promql: string,
    range: boolean = false,
    options?: { refetchInterval?: number; enabled?: boolean }
) => {
    return useQuery({
        queryKey: queryKeys.prometheus.query(promql, range),
        queryFn: () => prometheusApi.query(promql, range),
        refetchInterval: options?.refetchInterval ?? 15_000,
        enabled: options?.enabled ?? true,
        retry: false,
    });
};