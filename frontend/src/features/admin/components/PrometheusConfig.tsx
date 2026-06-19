import { useState } from 'react';
import { Loader2, RefreshCw, Eye, EyeOff, Activity, FileCode, CheckCircle2, AlertTriangle, Terminal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePrometheusStatus, usePrometheusConfig, usePrometheusReload } from '@/features/admin/hooks/usePremetheusControl';
import { toast } from 'sonner';

export function PrometheusConfig() {
    const [showPreview, setShowPreview] = useState(false);

    const { data: statusData, isLoading: statusLoading } = usePrometheusStatus();
    const {
        data: configData,
        isLoading: configLoading,
        refetch: fetchConfig,
    } = usePrometheusConfig(showPreview);
    const { mutate: reload, isPending: isReloading } = usePrometheusReload();

    const healthy = statusData?.healthy ?? false;
    const config = configData;

    const handlePreviewToggle = () => {
        if (!showPreview) {
            fetchConfig();
        }
        setShowPreview((prev) => !prev);
    };

    const handleReload = () => {
        reload(undefined, {
            onSuccess: (res) => {
                toast.success('Configuration hot-reload complete', {
                    description: `${res.data?.jobCount ?? 0} active scrape targets (${res.data?.dynamicJobCount ?? 0} database-driven) compiled successfully.`,
                });
            },
            onError: () => {
                toast.error('Hot-Reload Failed', {
                    description: 'The internal API orchestrator could not reach Prometheus. Check runtime container status logs.',
                });
            },
        });
    };

    return (
        <Card className="m-3 overflow-hidden border-slate-200/80 dark:border-slate-800/80 shadow-xl rounded-xl ">
            {/* 🌟 Premium Header with Gradient Top Accent Accent */}
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-linear-to-r from-slate-50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
                            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                <Activity className="h-4 w-4" />
                            </div>
                            Prometheus Orchestrator Pipeline
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                            Hot-reloads and recompiles global scrape runtime architectures straight out of real-time server rack assets.
                        </CardDescription>
                    </div>

                    {statusLoading ? (
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
                            <Loader2 size={12} className="animate-spin text-indigo-500" />
                            Verifying lifecycle...
                        </div>
                    ) : (
                        /* 🟢 Core Link Active Pulse Badge Layout */
                        <Badge
                            variant="outline"
                            className={`gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider shadow-sm transition-all duration-500 ${healthy
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                }`}
                        >
                            <span className="relative flex h-2 w-2">
                                {healthy && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                )}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${healthy ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            </span>
                            {healthy ? 'Link Reachable' : 'Pipeline Broken'}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {/* Main Action Grid Split Panel Layout */}
            <CardContent className="p-6 space-y-6 bg-white dark:bg-slate-950">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Deployment System Directives
                        </div>
                        <div className="text-[11px] text-slate-400">
                            Preview runtime generation tokens or flush memory matrices directly downstream.
                        </div>
                    </div>

                    {/* Interactive Action Control Triggers */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviewToggle}
                            className={`gap-2 h-9 border-slate-200 dark:border-slate-800 font-medium text-xs transition-all ${showPreview
                                    ? 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-50'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            {showPreview ? <EyeOff className="h-3.5 w-3.5 text-indigo-500" /> : <Eye className="h-3.5 w-3.5 text-slate-400" />}
                            {showPreview ? 'Hide Target Token' : 'Dry Run Preview'}
                        </Button>

                        <Button
                            onClick={handleReload}
                            disabled={isReloading || !healthy}
                            size="sm"
                            className="gap-2 h-9 font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-indigo-500/10 transition-all active:scale-[0.98]"
                        >
                            {isReloading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin stroke-[3]" />
                            ) : (
                                <RefreshCw className="h-3.5 w-3.5 stroke-[3]" />
                            )}
                            Recompile & Hot-Reload
                        </Button>
                    </div>
                </div>

                {/* Exception Handling Panel */}
                {!healthy && !statusLoading && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-800 dark:text-rose-400 text-xs">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                        <div className="space-y-0.5">
                            <span className="font-bold block">Engine Reachability Interrupted</span>
                            <span>The daemon cannot establish an outbound link hook to the database metrics stream. Synchronization controls locked.</span>
                        </div>
                    </div>
                )}

                {/* 💻 Config Terminal Rendering Workspace */}
                {showPreview && (
                    <div className="space-y-2.5 animate-in fade-in-50 slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                <FileCode className="h-3.5 w-3.5 text-indigo-500" />
                                Compiled Script Target Output
                            </span>
                            {config && !configLoading && (
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 text-[10px] font-mono px-2 py-0.5">
                                        Total: {config.jobCount} Jobs
                                    </Badge>
                                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono px-2 py-0.5">
                                        Dynamic: {config.dynamicJobCount}
                                    </Badge>
                                </div>
                            )}
                        </div>

                        {/* Terminal Box Shell Frame */}
                        <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-slate-900/50">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                                </div>
                                <span className="text-[10px] font-mono tracking-wider text-slate-500 select-none flex items-center gap-1">
                                    <Terminal size={10} /> prometheus.yml
                                </span>
                            </div>

                            {configLoading ? (
                                <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                                    <span className="text-[11px] font-mono tracking-wide text-slate-600">Compiling dataset stream...</span>
                                </div>
                            ) : (
                                <div className="w-full overflow-x-auto max-h-72 overflow-y-auto">
                                    <pre className="p-4 text-xs font-mono text-slate-300 whitespace-pre scrollbar-thin scrollbar-thumb-slate-800">
                                        <code>{config?.yaml || '# No metrics payload compiled yet.'}</code>
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}