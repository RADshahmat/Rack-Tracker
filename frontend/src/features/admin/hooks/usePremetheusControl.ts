import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { adminApi } from '../api/index';



export const usePrometheusStatus = () => {
    return useQuery({
        queryKey: queryKeys.prometheus.status(),
        queryFn: () => adminApi.getPrometheusStatus(),
        refetchInterval: 10_000,
        retry: false,
        select: (res) => res.data,
    });
};

export const usePrometheusConfig = (enabled: boolean = false) => {
    return useQuery({
        queryKey: queryKeys.prometheus.config(),
        queryFn: () =>
            adminApi.getPrometheusConfig(),
        enabled,
        select: (res) => res.data,
    });
};

export const usePrometheusReload = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            adminApi.reloadPrometheusConfig(),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.prometheus.all });
            return res.data;
        },
    });
};