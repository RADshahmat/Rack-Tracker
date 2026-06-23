import { Loader2, Mail, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWarnings, useResolveWarning } from '../hooks/useAdmin';

export function Warnings() {
  const [activeTab, setActiveTab] = useState('unresolved');
  
  const { data: warningsData, isLoading: warningsLoading } = useWarnings(activeTab === 'unresolved' ? false : undefined);
  const { mutate: resolveWarning, isPending: isResolving } = useResolveWarning();

  const warnings = warningsData?.data || [];
  const unresolvedCount = warnings.filter((w) => !w.resolved).length;

  const handleResolveWarning = (warningId: number) => {
    resolveWarning(warningId);
  };

  return (
    <Card className=" bg-white dark:bg-slate-900 shadow-lg shadow-amber-500/3 rounded-xl overflow-hidden">
      {/* Header Info Panel */}
      <CardHeader className="p-2 md:p-4 border-b border-amber-500/10 bg-amber-500/2 dark:bg-amber-500/1">
        <CardTitle className="flex items-center justify-between">
          <div>
            <span className="text-base font-bold tracking-wide text-slate-900 dark:text-slate-100">System Warnings Logs</span>
          </div>
          <Badge 
            variant={unresolvedCount > 0 ? "destructive" : "outline"} 
            className={`text-xs px-2.5 py-0.5 font-bold tracking-wide uppercase ${
              unresolvedCount === 0 ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : ''
            }`}
          >
            {unresolvedCount} Active Alerts
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Design */}
          <TabsList className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/40 h-10">
            <TabsTrigger 
              value="unresolved" 
              className="rounded-lg text-sm font-semibold px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-sm transition-all"
            >
              Unresolved Matrix
            </TabsTrigger>
            <TabsTrigger 
              value="all"
              className="rounded-lg text-sm font-semibold px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-sm transition-all"
            >
              All Events History
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 focus-visible:ring-0 outline-none">
            {warningsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 w-full">
                <Loader2 size={26} className="animate-spin text-amber-500" />
              </div>
            ) : warnings.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-amber-500/20 rounded-xl bg-amber-500/1">
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                  {activeTab === 'unresolved' ? 'No unresolved network faults detected.' : 'No historic logging alerts located.'}
                </p>
              </div>
            ) : (
              /* Card Matrix Grid View */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-150 overflow-y-auto pr-1">
                {warnings.map((warning) => (
                  <div
                    key={warning.id}
                    className={`p-4 rounded-md border border-yellow-200 dark:border-yellow-900/40 bg-red-50 dark:bg-yellow-900/10 ${
                      !warning.resolved 
                        ? 'border-amber-500 shadow-amber-500/0.06 dark:shadow-amber-500/0.04 bg-linear-to-br from-amber-500/2 to-transparent' 
                        : 'border-amber-500/30 shadow-amber-500/2 opacity-80'
                    }`}
                  >
                    <div>
                      {/* Card Header Segment */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Badge 
                            className="text-[9px] px-1.5 py-0.5 uppercase tracking-wider font-bold" 
                            variant={warning.resolved ? 'default' : 'destructive'}
                          >
                            {warning.resolved ? 'Resolved' : 'Unresolved'}
                          </Badge>
                        </div>

                        {/* Inline Resolution Option */}
                        {!warning.resolved && (
                          <Button
                            onClick={() => handleResolveWarning(warning.id)}
                            disabled={isResolving}
                            size="sm"
                            variant="secondary">
                            {isResolving ? <Loader2 size={12} className="animate-spin" /> : 'Resolve'}
                          </Button>
                        )}
                      </div>

                      {/* Diagnostic Alert Core Context Body */}
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed wrap-break-words">
                        {warning.message}
                      </p>
                    </div>

                    {/* Metadata Grid Floor */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px] md:text-[12px] text-slate-400 dark:text-slate-500 font-medium font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        <span>
                          {new Date(warning.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <Mail size={12} className={warning.emailed ? 'text-sky-500' : 'text-slate-300 dark:text-slate-700'} />
                        <span className={warning.emailed ? 'text-sky-500' : 'text-slate-300 dark:text-slate-700'}>
                          {warning.emailed ? 'Sent' : 'No Email'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}