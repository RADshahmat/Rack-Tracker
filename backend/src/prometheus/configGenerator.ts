import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import db from '../shared/db';

export interface ScrapeJob {
    job_name: string;
    static_configs: Array<{
        targets: string[];
        labels?: Record<string, string>;
    }>;
    metrics_path?: string;
    scrape_interval?: string;
}

export interface PrometheusConfig {
    global: {
        scrape_interval: string;
        evaluation_interval: string;
    };
    rule_files: string[];
    alerting: {
        alertmanagers: Array<{
            static_configs: Array<{ targets: string[] }>;
        }>;
    };
    scrape_configs: ScrapeJob[];
}

const CONFIG_PATH = process.env.PROMETHEUS_CONFIG_PATH ||
    path.join(process.cwd(), 'prometheus', 'prometheus.yml');

// ─── Query DB for rack-attached devices ──────────────────────────────────────

async function fetchRackDevices(): Promise<Array<{ rack_id: number; rack_tag: string; device_tag: string }>> {
    // One scrape job per rack that has at least one equipment assigned
    const query = `
        SELECT DISTINCT
            r.id    AS rack_id,
            r.tag   AS rack_tag,
            e.tag   AS device_tag
        FROM racks r
        INNER JOIN equipment e ON e.rack_id = r.id
        ORDER BY r.tag ASC, e.tag ASC
    `;
    const result = await db.getPool().query(query);
    return result.rows;
}

// ─── Build static scrape jobs (always present) ───────────────────────────────

function buildStaticJobs(): ScrapeJob[] {
    return [
        {
            job_name: 'prometheus',
            static_configs: [{ targets: ['localhost:9090'] }],
        },
        {
            job_name: 'rack-tracker-backend',
            metrics_path: '/metrics',
            scrape_interval: '15s',
            static_configs: [{ targets: ['backend:3000'] }],
        },
        {
            job_name: 'node-exporter',
            scrape_interval: '15s',
            static_configs: [{ targets: ['node-exporter:9100'] }],
        },
    ];
}

// ─── Build dynamic scrape jobs from DB ───────────────────────────────────────

function buildDynamicJobs(
    devices: Array<{ rack_id: number; rack_tag: string; device_tag: string }>
): ScrapeJob[] {
    // Group by rack — one job per rack
    const rackMap = new Map<string, string[]>();

    for (const device of devices) {
        const existing = rackMap.get(device.rack_tag) || [];
        existing.push(device.device_tag);
        rackMap.set(device.rack_tag, existing);
    }

    const jobs: ScrapeJob[] = [];

    for (const [rackTag, deviceTags] of rackMap) {

        const jobName = `rack_device_${rackTag.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

        jobs.push({
            job_name: jobName,
            metrics_path: '/metrics',
            scrape_interval: '30s',
            static_configs: [
                {

                    targets: ['backend:3000'],
                    labels: {
                        rack: rackTag,
                        environment: process.env.NODE_ENV || 'development',
                    },
                },
            ],
        });
    }

    return jobs;
}

// ─── Build full config object ─────────────────────────────────────────────────

export function buildConfig(dynamicJobs: ScrapeJob[]): PrometheusConfig {
    return {
        global: {
            scrape_interval: '15s',
            evaluation_interval: '15s',
        },
        rule_files: ['/etc/prometheus/alerts.yml'],
        alerting: {
            alertmanagers: [
                {
                    static_configs: [
                        { targets: ['alertmanager:9093'] },
                    ],
                },
            ],
        },
        scrape_configs: [
            ...buildStaticJobs(),
            ...dynamicJobs,
        ],
    };
}

// ─── Validate YAML ────────────────────────────────────────────────────────────

export function validateConfig(config: PrometheusConfig): string {
    // Serialize to YAML
    const yamlString = yaml.dump(config, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
    });

    // Parse back to verify it's valid YAML
    // Throws if invalid
    yaml.load(yamlString);

    // Check no duplicate job names
    const jobNames = config.scrape_configs.map((j) => j.job_name);
    const uniqueNames = new Set(jobNames);
    if (uniqueNames.size !== jobNames.length) {
        const dupes = jobNames.filter((name, i) => jobNames.indexOf(name) !== i);
        throw new Error(`Duplicate scrape job names detected: ${dupes.join(', ')}`);
    }

    // Validate required fields present
    if (!config.global?.scrape_interval) {
        throw new Error('Missing global.scrape_interval');
    }
    if (!config.scrape_configs?.length) {
        throw new Error('No scrape jobs defined');
    }

    return yamlString;
}

// ─── Write to disk ────────────────────────────────────────────────────────────

function writeConfig(yamlString: string): void {
    // Ensure directory exists
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(CONFIG_PATH, yamlString, 'utf-8');
    console.log(`[ConfigGenerator] Written to ${CONFIG_PATH}`);
}

// ─── Main export — called by the reload endpoint ──────────────────────────────

export async function generatePrometheusConfig(): Promise<{
    jobCount: number;
    dynamicJobCount: number;
    yaml: string;
}> {
    // 1. Fetch rack-attached devices from DB
    const devices = await fetchRackDevices();

    // 2. Build dynamic jobs
    const dynamicJobs = buildDynamicJobs(devices);

    // 3. Build full config
    const config = buildConfig(dynamicJobs);

    // 4. Validate + serialize
    // Throws on invalid YAML or duplicate jobs
    const yamlString = validateConfig(config);

    // 5. Write to disk
    writeConfig(yamlString);

    return {
        jobCount: config.scrape_configs.length,
        dynamicJobCount: dynamicJobs.length,
        yaml: yamlString,
    };
}