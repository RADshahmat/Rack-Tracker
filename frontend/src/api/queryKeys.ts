/**
 * Centralized TanStack Query Key Factory
 * Manages all query keys to ensure consistency and ease of invalidation
 */

export const queryKeys = {
  all: ['all'] as const,

  // Racks
  racks: {
    all: ['racks'] as const,
    lists: () => [...queryKeys.racks.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.racks.lists(), { filters }] as const,
    details: () => [...queryKeys.racks.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.racks.details(), id] as const,
  },

  // Equipment
  equipment: {
    all: ['equipment'] as const,
    lists: () => [...queryKeys.equipment.all, 'list'] as const,
    list: (page: number = 1, limit: number = 10) =>
      [...queryKeys.equipment.lists(), { page, limit }] as const,
    details: () => [...queryKeys.equipment.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.equipment.details(), id] as const,
    byRack: (rackId: number) => [...queryKeys.equipment.all, 'by-rack', rackId] as const,
  },

  // Admin
  admin: {
    all: ['admin'] as const,
    cron: () => [...queryKeys.admin.all, 'cron'] as const,
    cronStatus: () => [...queryKeys.admin.cron(), 'status'] as const,
    warnings: () => [...queryKeys.admin.all, 'warnings'] as const,
    warningsList: (resolved?: boolean) =>
      resolved === undefined
        ? [...queryKeys.admin.warnings(), 'list'] as const
        : [...queryKeys.admin.warnings(), 'list', { resolved }] as const,
  },

  // Prometheus / Metrics 
  prometheus: {
    all: ['prometheus'] as const,
    status: () => [...queryKeys.prometheus.all, 'status'] as const,
    config: () => [...queryKeys.prometheus.all, 'config'] as const,
    query: (promql: string, range: boolean) =>
      [...queryKeys.prometheus.all, 'query', { promql, range }] as const,
  },
} as const;
