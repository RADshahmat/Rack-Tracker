import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type CronStatus, type Warning } from '../api/index';
import { queryKeys } from '@/api/queryKeys';
import { toast } from 'sonner';

export function useCronStatus() {
  return useQuery({
    queryKey: queryKeys.admin.cronStatus(),
    queryFn: () => adminApi.getCronStatus(),
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });
}

export function useRestartCron() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expression: string | undefined) => adminApi.restartCron(expression),
    onSuccess: () => {
      toast.success('Cron scheduler restarted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.cronStatus() });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to restart cron scheduler');
    },
  });
}

export function useWarnings(resolved?: boolean) {
  return useQuery({
    queryKey: queryKeys.admin.warningsList(resolved),
    queryFn: () => resolved === false ? adminApi.getUnresolvedWarnings() : adminApi.getWarnings(),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}

export function useResolveWarning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (warningId: number) => adminApi.resolveWarning(warningId),
    onSuccess: () => {
      toast.success('Warning resolved successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.warnings() });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to resolve warning');
    },
  });
}
