import cron, { ScheduledTask } from 'node-cron';
import warningRepository from '../modules/warnings/warning.repository';
import { warningsCreatedTotal } from '../metrics/registry';
import { sendWarningEmail } from './mailer';
import { EmptyRack } from '../modules/warnings/warning.types';

class CronScheduler {
    private task: ScheduledTask | null = null;
    private expression: string;
    private isRunning: boolean = false;

    constructor(expression: string = '*/5 * * * *') {
        this.expression = expression;
    }

    start(): void {
        if (this.isRunning) {
            console.log('[Scheduler] Already running — stop first before restarting');
            return;
        }

        if (!cron.validate(this.expression)) {
            throw new Error(`Invalid cron expression: ${this.expression}`);
        }

        this.task = cron.schedule(this.expression, async () => {
            await this.runJob();
        });

        this.isRunning = true;
        console.log(`[Scheduler] Started with expression: "${this.expression}"`);
    }

    stop(): void {
        if (this.task) {
            this.task.stop();
            this.task = null;
        }
        this.isRunning = false;
        console.log('[Scheduler] Stopped');
    }

    restart(expression?: string): void {
        if (expression) {
            if (!cron.validate(expression)) {
                throw new Error(`Invalid cron expression: ${expression}`);
            }
            this.expression = expression;
        }
        this.stop();
        this.start();
        console.log(`[Scheduler] Restarted with expression: "${this.expression}"`);
    }

    getStatus(): { isRunning: boolean; expression: string } {
        return {
            isRunning: this.isRunning,
            expression: this.expression,
        };
    }

    // Core job logic
    private async runJob(): Promise<void> {
        console.log(`[Scheduler] Running empty rack check at ${new Date().toISOString()}`);

        try {
            const emptyRacks = await warningRepository.findEmptyRacks();

            if (emptyRacks.length === 0) {
                console.log('[Scheduler] No empty racks found — all good');
                return;
            }

            console.log(`[Scheduler] Found ${emptyRacks.length} empty rack(s)`);

            const newlyWarned: EmptyRack[] = [];

            for (const rack of emptyRacks) {
                // Skip if a warning already exists for this rack in the last 10 minutes — prevents spam
                const recent = await warningRepository.findRecentWarningByRackId(rack.id, 10);
                if (recent) {
                    console.log(`[Scheduler] Skipping ${rack.tag} — recent warning exists`);
                    continue;
                }

                const warning = await warningRepository.createWarning({
                    rack_id: rack.id,
                    rack_tag: rack.tag,
                    message: `Rack ${rack.tag} (${rack.name}) has no equipment assigned`,
                });
                warningsCreatedTotal.inc(); 
                console.log(`[Scheduler] Warning created for rack ${rack.tag} — ID: ${warning.id}`);
                newlyWarned.push(rack);
            }

            // send email for newly warned racks
            if (newlyWarned.length > 0) {
                await sendWarningEmail(newlyWarned);
            }
        } catch (error) {
            console.error('[Scheduler] Job failed:', error);
        }
    }
}

//for test
export { CronScheduler }; 
// Export a single instance — used across the app
export const scheduler = new CronScheduler('*/5 * * * *');