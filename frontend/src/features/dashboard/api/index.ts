import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/types';

// ─── Types ──────────────────────────────────────────────

export interface PrometheusStatus {
    url: string;
    healthy: boolean;
}

export interface PrometheusConfigPreview {
    jobCount: number;
    dynamicJobCount: number;
    yaml: string;
}

export interface PrometheusReloadResult {
    jobCount: number;
    dynamicJobCount: number;
    configPath: string;
}

export interface PromInstantResult {
    metric: Record<string, string>;
    value: [number, string]; // [timestamp, value]
}

export interface PromRangeResult {
    metric: Record<string, string>;
    values: [number, string][]; // [[timestamp, value], ...]
}

export interface PromQueryResponse {
    resultType: 'vector' | 'matrix' | 'scalar' | 'string';
    result: PromInstantResult[] | PromRangeResult[];
}

// ─── API ────────────────────────────────────────────────

export const prometheusApi = {
    getStatus: () =>
        apiClient.get<ApiResponse<PrometheusStatus>>('/prometheus/status'),

    getConfig: () =>
        apiClient.get<ApiResponse<PrometheusConfigPreview>>('/prometheus/config'),

    reload: () =>
        apiClient.post<ApiResponse<PrometheusReloadResult>>('/prometheus/reload'),

    query: async (promql: string, range: boolean = false) => {
        // 1. Resolve the base url and target endpoint
        const baseUrl = import.meta.env.VITE_PROMETHEUS_URL || 'http://localhost:9090/api/v1';
        const endpoint = range ? '/query_range' : '/query';

        // 2. Build out the query parameters manually
        const params = new URLSearchParams({
            query: promql
        });

        if (range) {
            params.append('start', String(Math.floor(Date.now() / 1000) - 3600)); // 1 hour ago
            params.append('end', String(Math.floor(Date.now() / 1000)));        // Now
            params.append('step', '1m');                                         // 1 minute resolution
        }

        // 3. Fire the direct fetch request
        const response = await fetch(`${baseUrl}${endpoint}?${params.toString()}`, {
            method: 'GET',
            credentials: 'omit'
        });

        if (!response.ok) {
            const error = await response.json();
            throw error;
        }

        return response.json();
    }
};