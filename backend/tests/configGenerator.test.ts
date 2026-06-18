import {
    buildConfig,
    validateConfig,
    ScrapeJob,
} from '../src/prometheus/configGenerator';

describe('ConfigGenerator', () => {
    const mockDynamicJobs: ScrapeJob[] = [
        {
            job_name: 'rack_device_rack_a1',
            metrics_path: '/metrics',
            scrape_interval: '30s',
            static_configs: [
                {
                    targets: ['backend:3000'],
                    labels: { rack: 'RACK-A1', environment: 'test' },
                },
            ],
        },
    ];

    describe('buildConfig()', () => {
        it('always includes static jobs', () => {
            const config = buildConfig([]);
            const jobNames = config.scrape_configs.map((j) => j.job_name);

            expect(jobNames).toContain('prometheus');
            expect(jobNames).toContain('rack-tracker-backend');
            expect(jobNames).toContain('node-exporter');
        });

        it('appends dynamic jobs after static jobs', () => {
            const config = buildConfig(mockDynamicJobs);
            const jobNames = config.scrape_configs.map((j) => j.job_name);

            expect(jobNames).toContain('rack_device_rack_a1');
            expect(jobNames.length).toBe(4); // 3 static + 1 dynamic
        });

        it('includes alertmanager config', () => {
            const config = buildConfig([]);
            expect(config.alerting.alertmanagers[0].static_configs[0].targets)
                .toContain('alertmanager:9093');
        });

        it('includes alert rule files', () => {
            const config = buildConfig([]);
            expect(config.rule_files).toContain('/etc/prometheus/alerts.yml');
        });
    });

    describe('validateConfig()', () => {
        it('returns valid YAML string', () => {
            const config = buildConfig(mockDynamicJobs);
            const yamlString = validateConfig(config);

            expect(typeof yamlString).toBe('string');
            expect(yamlString).toContain('scrape_configs');
            expect(yamlString).toContain('rack_device_rack_a1');
        });

        it('throws on duplicate job names', () => {
            const config = buildConfig([
                ...mockDynamicJobs,
                ...mockDynamicJobs, // duplicate
            ]);

            expect(() => validateConfig(config)).toThrow(
                'Duplicate scrape job names detected'
            );
        });

        it('generates idempotent output', () => {
            const config1 = buildConfig(mockDynamicJobs);
            const config2 = buildConfig(mockDynamicJobs);

            const yaml1 = validateConfig(config1);
            const yaml2 = validateConfig(config2);

            // Same input → same output every time
            expect(yaml1).toBe(yaml2);
        });

        it('throws on missing scrape_interval', () => {
            const config = buildConfig([]);
            // @ts-ignore — intentional for testing
            delete config.global.scrape_interval;

            expect(() => validateConfig(config)).toThrow(
                'Missing global.scrape_interval'
            );
        });

        it('output contains correct prometheus naming', () => {
            const config = buildConfig(mockDynamicJobs);
            const yamlString = validateConfig(config);

            expect(yamlString).toContain('scrape_interval');
            expect(yamlString).toContain('evaluation_interval');
            expect(yamlString).toContain('static_configs');
        });
    });
});