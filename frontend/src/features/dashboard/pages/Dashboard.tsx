import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { MetricsCard } from '@/features/dashboard/components/MetricsCard';
import { AlertsPanel } from '@/features/dashboard/components/AlertsPanel';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { Server, Cpu, Activity, AlertTriangle } from 'lucide-react';

export function Dashboard() {
  const { racksCreated, equipmentCreated, httpRequests, warnings, isLoading } =
    useDashboardStats();

  return (
    <div className="flex-1 overflow-auto">
      <main className="p-4 lg:p-8 bg-white dark:bg-dark-bg">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard
            label="Racks Created"
            value={racksCreated}
            icon={Server}
            accent="blue"
            isLoading={isLoading}
          />
          <StatCard
            label="Equipment Created"
            value={equipmentCreated}
            icon={Cpu}
            accent="violet"
            isLoading={isLoading}
          />
          <StatCard
            label="HTTP Requests"
            value={httpRequests}
            icon={Activity}
            accent="amber"
            isLoading={isLoading}
          />
          <StatCard
            label="Warnings"
            value={warnings}
            icon={AlertTriangle}
            accent="rose"
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MetricsCard />
          <AlertsPanel />
        </div>
      </main>
    </div>
  );
}