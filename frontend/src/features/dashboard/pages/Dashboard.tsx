import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { MetricsCard } from '@/features/dashboard/components/MetricsCard';
import { AlertsPanel } from '@/features/dashboard/components/AlertsPanel';

export function Dashboard() {
  const { totalRacks, totalEquipment, criticalAlerts, warnings, isLoading } =
    useDashboardStats();

  return (
    <div className="flex-1 overflow-auto">
      <main className="p-4 lg:p-8 bg-white dark:bg-dark-bg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Racks</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {isLoading ? '--' : totalRacks}
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Equipment Active</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {isLoading ? '--' : totalEquipment}
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Critical Alerts</div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-500 mt-2">
              {isLoading ? '--' : criticalAlerts}
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Warnings</div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-500 mt-2">
              {isLoading ? '--' : warnings}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MetricsCard />
          <AlertsPanel />
        </div>
      </main>
    </div>
  );
}