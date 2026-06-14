import { CronStatus } from '../components/CronStatus';
import { Warnings } from '../components/Warnings';

export function SchedulerPage() {
  return (
    <div className="space-y-6">
      <CronStatus />
      <Warnings />
    </div>
  );
}
