import { useQuery } from '@tanstack/react-query';
import { useWarnings } from '@/features/admin/hooks/useAdmin';
import { queryKeys } from '@/api/queryKeys';
import { prometheusApi } from '../api';


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


export function useDashboardStats() {
  const racksCreated = usePromQuery('racks_created_total');
  const equipmentCreated = usePromQuery('equipment_created_total');
  const httpRequests = usePromQuery('http_requests_total');
  const warningsQuery = useWarnings();
  const allWarnings = warningsQuery.data?.data ?? [];
  const unresolvedWarnings = allWarnings.filter((w) => !w.resolved).length;

  //Helper function to parse Prometheus instant vector results securely
  const parsePromValue = (queryResult: any): number => {
    const resultElement = queryResult?.data?.result?.[0];
    if (!resultElement) return 0;
    const rawValue = resultElement.value?.[1];
    return rawValue ? parseInt(rawValue, 10) : 0;
  };


  return {
    //Extracted metric calculations
    racksCreated: parsePromValue(racksCreated.data),
    equipmentCreated: parsePromValue(equipmentCreated.data),
    httpRequests: parsePromValue(httpRequests.data),
    warnings: unresolvedWarnings,

    isLoading:
      racksCreated.isLoading ||
      equipmentCreated.isLoading ||
      httpRequests.isLoading ||
      warningsQuery.isLoading,
  };
}