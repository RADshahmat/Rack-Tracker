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
  created_at: string;
}

interface PrometheusStatus {
  url: string;
  healthy: boolean;
}

interface PrometheusConfigPreview {
  jobCount: number;
  dynamicJobCount: number;
  yaml: string;
}

interface PrometheusReloadResult {
  jobCount: number;
  dynamicJobCount: number;
  configPath: string;
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

  
  // prometheus config endpoints
  getPrometheusStatus: () =>
    apiClient.get<ApiResponse<PrometheusStatus>>('/prometheus/status'),

  getPrometheusConfig: () =>
    apiClient.get<ApiResponse<PrometheusConfigPreview>>('/prometheus/config'),

  reloadPrometheusConfig: () =>
    apiClient.post<ApiResponse<PrometheusReloadResult>>('/prometheus/reload'),
};
