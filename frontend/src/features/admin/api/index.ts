import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/types/index';

export interface CronStatus {
  isRunning: boolean;
  expression: string;
}

export interface Warning {
  id: number;
  rackId: number;
  rackTag: string;
  message: string;
  resolved: boolean;
  emailed: boolean;
  createdAt: string;
}

export const adminApi = {
  // Cron endpoints
  getCronStatus: () =>
    apiClient.get<ApiResponse<CronStatus>>('/admin/cron-status'),

  restartCron: (expression?: string) => {
    const url = expression 
      ? `/admin/restart-cron?expression=${encodeURIComponent(expression)}`
      : '/admin/restart-cron';
    return apiClient.get<ApiResponse<CronStatus>>(url);
  },

  // Warning endpoints
  getWarnings: () =>
    apiClient.get<ApiResponse<Warning[]>>('/warnings'),

  getUnresolvedWarnings: () =>
    apiClient.get<ApiResponse<Warning[]>>('/warnings/unresolved'),

  resolveWarning: (id: number) =>
    apiClient.patch<ApiResponse<void>>(`/warnings/${id}/resolve`),
};
