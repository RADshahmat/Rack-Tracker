import { Loader2, RefreshCw, Clock, HelpCircle, Terminal } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCronStatus, useRestartCron } from '../hooks/useAdmin';
import { toast } from 'sonner';

const COMMON_EXPRESSIONS = [
  { label: 'Every 5 min', value: '*/5 * * * *' },
  { label: 'Every 10 min', value: '*/10 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day', value: '0 0 * * *' },
];

export function CronStatus() {
  const [draftExpression, setDraftExpression] = useState('');

  const { data: cronData, isLoading: cronLoading } = useCronStatus();
  const { mutate: restartCron, isPending: isRestarting } = useRestartCron();

  const cronStatus = cronData?.data;
  const isActive = cronStatus?.isRunning;

  const handleRestartCron = () => {
    const expression = draftExpression.trim() || undefined;

    restartCron(expression, {
      onSuccess: () => {
        toast.success('Scheduler updated', {
          description: expression
            ? `Interval successfully set to: ${expression}`
            : `Restarted with active interval: ${cronStatus?.expression}`,
        });
        setDraftExpression('');
      },
      onError: () => {
        toast.error('Syntax Validation Failed', {
          description: 'Please verify your cron expression parameters match the linux spec.',
        });
      },
    });
  };

  return (
    <Card className="m-3 overflow-y-auto border-slate-200/80 dark:border-slate-800/80 shadow-xl rounded-xl">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-linear-to-r from-slate-50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Clock className="h-4 w-4" />
              </div>
              Cron Infrastructure Engine
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Automated system utility that checks for unassigned racks and registers system anomaly triggers.
            </CardDescription>
          </div>

          {cronLoading ? (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
              <Loader2 size={12} className="animate-spin text-indigo-500" />
              Fetching instance...
            </div>
          ) : (
            /* 🟢 Dynamic Status Pill Badge */
            <Badge
              variant="outline"
              className={`gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider shadow-sm transition-all duration-500 ${isActive
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                }`}
            >
              <span className="relative flex h-2 w-2">
                {isActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </span>
              {isActive ? 'Engine Running' : 'Engine Halted'}
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Grid Display Grid Layout */}
      <CardContent className="p-0 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">

        {/* 📋 LEFT: Telemetry & Parameter Structure Summary */}
        <div className="md:col-span-5 p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-3">
              <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              Active Runtime Expression
            </label>
            <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 text-slate-100 shadow-md group">
              <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Terminal size={40} className="text-slate-400" />
              </div>
              <div className="font-mono text-xl font-bold tracking-wider bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                {cronLoading ? (
                  <span className="text-slate-700 animate-pulse">***</span>
                ) : (
                  cronStatus?.expression || '—'
                )}
              </div>
            </div>
          </div>

          {/* Syntax Helper Grid */}
          <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 p-4 bg-white dark:bg-slate-950/40 shadow-sm space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <HelpCircle size={14} className="text-indigo-500" />
              Expression Parameter Maps
            </div>
            <div className="grid grid-cols-5 gap-1 text-center font-mono text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800/50">
              <div>min</div>
              <div>hr</div>
              <div>day</div>
              <div>mon</div>
              <div>wk</div>
            </div>
          </div>
        </div>

        {/* ⚙️ RIGHT: Deployment Action Core Controls */}
        <div className="md:col-span-7 p-6 space-y-6 bg-white dark:bg-slate-950 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="cron-draft" className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                Modify Schedule Cadence String
              </Label>
              <Input
                id="cron-draft"
                placeholder={cronStatus?.expression || '*/5 * * * *'}
                value={draftExpression}
                onChange={(e) => setDraftExpression(e.target.value)}
                className="font-mono text-sm h-11 border-slate-200 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-900/50"
              />
            </div>

            {/* Quick Presets Micro Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">
                Quick Action Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {COMMON_EXPRESSIONS.map((preset) => {
                  const isSelected = draftExpression === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setDraftExpression(preset.value)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all duration-200 ${isSelected
                        ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm scale-[0.97]'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50'
                        }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Container Footer Block */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button
              onClick={handleRestartCron}
              disabled={isRestarting || cronLoading}
              className="w-full sm:w-auto h-9 px-5 gap-2 font-semibold text-white bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-500/10 transition-all active:scale-[0.98]"
            >
              {isRestarting ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Rebuilding Task Pipeline...
                </>
              ) : (
                <>
                  <RefreshCw size={12}  />
                  Commit & Restart Engine
                </>
              )}
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}