import { Registry, Counter, Histogram, collectDefaultMetrics } from 'prom-client';

// Single registry — import this everywhere, never create another
const registry = new Registry();

// Collect default Node.js metrics (memory, CPU, event loop, etc.)
collectDefaultMetrics({ register: registry });

// ─── Custom Metrics ───────────────────────────────────────────────────────────

// Counter — total racks created since server start
// Naming convention: noun_verb_total
export const racksCreatedTotal = new Counter({
    name: 'racks_created_total',
    help: 'Total number of racks created',
    registers: [registry],
});

// Counter — total equipment created
export const equipmentCreatedTotal = new Counter({
    name: 'equipment_created_total',
    help: 'Total number of equipment items created',
    registers: [registry],
});

// Counter — HTTP requests by method, route, status code
// ⚠️ Only use static label values — no rack tags, no user ids
// Unbounded label cardinality will OOM Prometheus
export const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'] as const,
    registers: [registry],
});

// Histogram — HTTP request duration in seconds
export const httpRequestDurationSeconds = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route'] as const,
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [registry],
});

// Counter — auth login attempts
export const authLoginTotal = new Counter({
    name: 'auth_login_total',
    help: 'Total number of login attempts',
    labelNames: ['status'] as const,    // 'success' | 'failure'
    registers: [registry],
});

// Counter — warnings created by cron scheduler
export const warningsCreatedTotal = new Counter({
    name: 'warnings_created_total',
    help: 'Total number of warnings created by the scheduler',
    registers: [registry],
});

export default registry;