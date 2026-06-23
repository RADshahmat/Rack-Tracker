import { Trash2, Loader2, ArrowUpRight } from 'lucide-react';
import type { Equipment } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/features/auth/components/RoleGuard';

interface EquipmentTableProps {
  equipment: Equipment[];
  isLoading: boolean;
  error: boolean;
  selectedEquipmentId: number | null;
  onSelectEquipment: (id: number) => void;
  onDelete: (id: number) => void;
}

const statusColorMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CRITICAL: 'destructive',
  WARNING: 'secondary',
  STABLE: 'default',
};

export function EquipmentTable({
  equipment,
  isLoading,
  error,
  selectedEquipmentId,
  onSelectEquipment,
  onDelete,
}: EquipmentTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full">
        <Loader2 className="text-sky-500 animate-spin" size={28} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 m-4 text-center">
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Failed to sync infrastructure matrix state.</p>
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 dark:text-slate-500">
        <p className="text-sm font-medium">No system components found matching constraints</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-4">
      {/* 1. Desktop UI View Module */}
      <div className="hidden md:block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow className="border-slate-200 dark:border-slate-800">
              <TableHead className="w-15 text-[11px] font-bold tracking-wider">HEALTH</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wider">NAME</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wider">TYPE</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wider">ALERT LEVEL</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wider">RACK LOCATION</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wider">SLOT</TableHead>
              <TableHead className="text-right text-[11px] font-bold tracking-wider pr-6">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.map((eq) => {
              const isSelected = selectedEquipmentId === eq.id;
              return (
                <TableRow
                  key={eq.id}
                  onClick={() => onSelectEquipment(eq.id)}
                  className={`cursor-pointer transition-colors border-slate-200 dark:border-slate-800/60 ${isSelected
                      ? 'bg-sky-500/10 hover:bg-sky-500/15'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                >
                  <TableCell>
                    <div className={`w-2 h-2 rounded-full shadow-sm ml-2 ${eq.status === 'CRITICAL' ? 'bg-rose-500 animate-pulse' : eq.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-slate-900 dark:text-slate-100">{eq.name}</TableCell>
                  <TableCell className="text-xs text-slate-500 dark:text-slate-400 font-medium">{eq.type || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={statusColorMap[eq.status ?? 'STABLE'] || 'default'} className="text-xs uppercase tracking-wide font-semibold px-2 py-0.5">
                      {eq.status || 'STABLE'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    {eq.rack_id ? eq.rack_tag : <span className="text-slate-400 dark:text-slate-600 italic">Unassigned</span>}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-600 dark:text-slate-400">{eq.slot_position ? `${eq.slot_position}U` : '-'}</TableCell>
                  <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                    <RoleGuard minRole="admin">
                      <Button variant="outline" onClick={() => onDelete(eq.id)} >
                        <Trash2 size={14} />
                      </Button>
                    </RoleGuard>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {/* 2. Mobile Responsive Matrix View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {equipment.map((eq) => (
          <div
            key={eq.id}
            onClick={() => onSelectEquipment(eq.id)}
            className={`p-4 rounded-xl border transition-all bg-white dark:bg-slate-900 active:scale-[0.99] ${selectedEquipmentId === eq.id
                ? 'border-sky-500 ring-1 ring-sky-500 bg-sky-500/5'
                : 'border-slate-200 dark:border-slate-800'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${eq.status === 'CRITICAL' ? 'bg-rose-500' : eq.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{eq.name}</h4>
              </div>

              {/* Added onClick stop propagation handling to this action wrapper */}
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <RoleGuard minRole="admin">
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                    onClick={() => onDelete(eq.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </RoleGuard>
                <ArrowUpRight size={16} className="text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-xs uppercase font-semibold">Location</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                  {eq.rack_id ? eq.rack_tag : 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs uppercase font-semibold">Specs</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {eq.type || '-'} {eq.slot_position ? `(${eq.slot_position}U)` : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}