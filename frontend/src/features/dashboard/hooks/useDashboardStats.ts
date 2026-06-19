import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { queryKeys } from '@/api/queryKeys';
import type { ApiResponse, Rack, Equipment } from '@/types';

interface Warning {
  id: number;
  resolved: boolean;
}

export function useDashboardStats() {
  const racksQuery = useQuery({
    queryKey: queryKeys.racks.list(),
    queryFn: () => apiClient.get<ApiResponse<Rack[]>>('/racks'),
  });

  const equipmentQuery = useQuery({
    queryKey: queryKeys.equipment.list(1, 1000),
    queryFn: () => apiClient.get<ApiResponse<Equipment[]>>('/equipment', {
      params: { page: 1, limit: 1000 },
    }),
  });

  const warningsQuery = useQuery({
    queryKey: queryKeys.admin.warningsList(),
    queryFn: () => apiClient.get<ApiResponse<Warning[]>>('/warnings'),
  });

  const totalRacks = racksQuery.data?.data?.length ?? 0;
  const totalEquipment = equipmentQuery.data?.data?.length ?? 0;
  const allWarnings = warningsQuery.data?.data ?? [];
  const unresolvedWarnings = allWarnings.filter((w) => !w.resolved).length;
  const criticalAlerts = unresolvedWarnings; // adjust if you add severity later

  return {
    totalRacks,
    totalEquipment,
    criticalAlerts,
    warnings: unresolvedWarnings,
    isLoading:
      racksQuery.isLoading || equipmentQuery.isLoading || warningsQuery.isLoading,
  };
}