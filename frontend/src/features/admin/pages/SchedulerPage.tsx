import { CronStatus } from '../components/CronStatus';
import { PrometheusConfig } from '../components/PrometheusConfig';

export function SchedulerPage() {
  return (
    <div className="flex-1 overflow-auto">
      <CronStatus />
      <PrometheusConfig />
    </div>
  );
}
