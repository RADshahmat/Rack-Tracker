import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCronStatus, useRestartCron } from '../hooks/useAdmin';

export function CronStatus() {
  const [cronExpression, setCronExpression] = useState('');
  
  const { data: cronData, isLoading: cronLoading } = useCronStatus();
  const { mutate: restartCron, isPending: isRestarting } = useRestartCron();

  const cronStatus = cronData?.data;

  const handleRestartCron = () => {
    restartCron(cronExpression || undefined);
    setCronExpression('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Cron Status</span>
          {cronLoading && <Loader2 size={20} className="animate-spin text-sky-600" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
          <Badge variant={cronStatus?.isRunning ? 'default' : 'destructive'}>
            {cronStatus?.isRunning ? 'Running' : 'Stopped'}
          </Badge>
        </div>

        {/* Current Expression */}
        {cronStatus?.expression && (
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Expression:</span>
            <div className="mt-2 p-3 bg-gray-900 dark:bg-gray-950 rounded font-mono text-sm text-green-400 overflow-x-auto">
              {cronStatus.expression}
            </div>
          </div>
        )}

        {/* Input for new expression */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            New Cron Expression (optional)
          </label>
          <Input
            placeholder="e.g., 0 0 * * *"
            value={cronExpression}
            onChange={(e) => setCronExpression(e.target.value)}
            className="font-mono text-xs"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Leave empty to restart with current expression
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleRestartCron}
            disabled={isRestarting}
            className="gap-2"
          >
            {isRestarting && <Loader2 size={16} className="animate-spin" />}
            Restart Scheduler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
