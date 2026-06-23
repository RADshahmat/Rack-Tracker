import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import type { Equipment, Rack } from '@/types';

interface RackSlotsTableProps {
  rack: Rack;
  equipment: Equipment[];
  selectedEquipmentId?: number | null;
  onSelectEquipment?: (id: number) => void;
  onAssignSlot: (slotPosition: number) => void;
}

export function RackSlotsTable({ rack, equipment, onSelectEquipment, onAssignSlot }: RackSlotsTableProps) {
  const allSlots = Array.from({ length: rack.capacity }, (_, i) => i + 1);
  const occupiedSlots = new Map(equipment.map((eq) => [eq.slot_position, eq]));

  return (
    <div className="p-2 md:p-4 overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-slate-200 dark:border-slate-800">
          <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
            <TableHead className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500 w-16">Unit</TableHead>
            <TableHead className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500">Asset Identity</TableHead>
            <TableHead className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500 hidden sm:table-cell">Module Type</TableHead>
            <TableHead className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500 text-right">Status Flag</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allSlots.map((slot) => {
            const eq = occupiedSlots.get(slot);
            return (
              <TableRow
                key={slot}
                className={`border-slate-100 dark:border-slate-800/60 transition-colors ${eq
                    ? 'hover:bg-slate-50 dark:hover:bg-slate-950/40 cursor-pointer'
                    : 'hover:bg-slate-50/30 dark:hover:bg-slate-950/10'
                  }`}
                onClick={() => eq && onSelectEquipment?.(eq.id)}
              >
                {/* Slot index identifier badge marker */}
                <TableCell className="font-mono font-bold text-xs text-slate-400 dark:text-slate-500 py-2.5">
                  <span className="bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-slate-800/50">
                    {slot.toString().padStart(2, '0')}U
                  </span>
                </TableCell>

                {eq ? (
                  <>
                    <TableCell className="font-semibold text-xs text-slate-900 dark:text-slate-100 max-w-35 truncate">
                      {eq.name}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400 dark:text-slate-500 hidden sm:table-cell max-w-25 truncate font-mono">
                      {eq.type || 'GENERIC'}
                    </TableCell>
                    <TableCell className="text-right py-2.5">
                      <Badge
                        className={`text-[9px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 border ${eq.status === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/10'
                            : eq.status === 'WARNING'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/10'
                              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10'
                          }`}
                      >
                        {eq.status || 'STABLE'}
                      </Badge>
                    </TableCell>
                  </>
                ) : (
                  <TableCell colSpan={3} className="text-right sm:text-left py-2.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssignSlot(slot);
                      }}
                      className="text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 p-0 h-auto font-mono text-[11px] font-medium transition-colors flex items-center gap-1 ml-auto sm:ml-0"
                    >
                      <Plus size={12} className="opacity-60" />
                      Unallocated Slot Index
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}