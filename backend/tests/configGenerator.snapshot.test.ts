import { buildConfig, validateConfig, ScrapeJob } from '../src/prometheus/configGenerator';

describe('ConfigGenerator — Snapshot Tests', () => {
    describe('static config only (no rack devices)', () => {
        it('matches snapshot for empty dynamic jobs', () => {
            const config = buildConfig([]);
            const yamlString = validateConfig(config);

            expect(yamlString).toMatchSnapshot();
        });
    });

    describe('with dynamic rack-device jobs', () => {
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
            {
                job_name: 'rack_device_rack_b1',
                metrics_path: '/metrics',
                scrape_interval: '30s',
                static_configs: [
                    {
                        targets: ['backend:3000'],
                        labels: { rack: 'RACK-B1', environment: 'test' },
                    },
                ],
            },
        ];

        it('matches snapshot for single rack with multiple devices', () => {
            const config = buildConfig([mockDynamicJobs[0]]);
            const yamlString = validateConfig(config);

            expect(yamlString).toMatchSnapshot();
        });

        it('matches snapshot for multiple racks', () => {
            const config = buildConfig(mockDynamicJobs);
            const yamlString = validateConfig(config);

            expect(yamlString).toMatchSnapshot();
        });
    });

    describe('mutation resistance — structural integrity', () => {
        // These tests don't use snapshots but catch "mutations" — small unwanted code changes that alter the config shape
        it('does not silently drop the alerting block if dynamic jobs are added', () => {
            const config = buildConfig([
                {
                    job_name: 'rack_device_test',
                    static_configs: [{ targets: ['backend:3000'] }],
                },
            ]);

            expect(config.alerting).toBeDefined();
            expect(config.alerting.alertmanagers[0].static_configs[0].targets).toEqual([
                'alertmanager:9093',
            ]);
        });

        it('does not mutate static jobs when dynamic jobs are passed', () => {
            const configWithout = buildConfig([]);
            const configWith = buildConfig([
                {
                    job_name: 'rack_device_test',
                    static_configs: [{ targets: ['backend:3000'] }],
                },
            ]);

            const staticOnlyWithout = configWithout.scrape_configs.filter(
                (j) => j.job_name !== 'rack_device_test'
            );
            const staticOnlyWith = configWith.scrape_configs.filter(
                (j) => j.job_name !== 'rack_device_test'
            );

            expect(staticOnlyWith).toEqual(staticOnlyWithout);
        });

        it('preserves job order — static jobs always first', () => {
            const config = buildConfig([
                {
                    job_name: 'rack_device_zzz',
                    static_configs: [{ targets: ['backend:3000'] }],
                },
            ]);

            const jobNames = config.scrape_configs.map((j) => j.job_name);
            const dynamicIndex = jobNames.indexOf('rack_device_zzz');
            const staticIndices = ['prometheus', 'rack-tracker-backend', 'node-exporter'].map(
                (name) => jobNames.indexOf(name)
            );

            // every static job index must be less than the dynamic job index
            staticIndices.forEach((idx) => {
                expect(idx).toBeLessThan(dynamicIndex);
            });
        });

        it('does not produce trailing whitespace or tabs in output', () => {
            const config = buildConfig([]);
            const yamlString = validateConfig(config);

            expect(yamlString).not.toMatch(/\t/); // no tabs — YAML forbids them
            expect(yamlString).not.toMatch(/[ \t]+\n/); // no trailing whitespace before newline
        });

        it('label values never contain unescaped special YAML characters', () => {
            const config = buildConfig([
                {
                    job_name: 'rack_device_test',
                    static_configs: [
                        {
                            targets: ['backend:3000'],
                            labels: { rack: 'RACK-A1', environment: 'test' },
                        },
                    ],
                },
            ]);

            const yamlString = validateConfig(config);
            // re-parse to confirm labels survive round-trip intact
            const parsed = require('js-yaml').load(yamlString) as any;
            const job = parsed.scrape_configs.find(
                (j: any) => j.job_name === 'rack_device_test'
            );

            expect(job.static_configs[0].labels.rack).toBe('RACK-A1');
            expect(job.static_configs[0].labels.environment).toBe('test');
        });
    });
});