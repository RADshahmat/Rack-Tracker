import { Trash2, Loader2 } from 'lucide-react';
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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="text-sky-600 dark:text-sky-500 animate-spin" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 rounded-lg p-4 m-4 text-center">
        <p className="text-red-600 dark:text-red-400">Failed to load equipment. Please try again.</p>
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium mb-2">No equipment found</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Table>
        <TableHeader className="sticky top-0 bg-white dark:bg-dark-surface">
          <TableRow>
            <TableHead>STATUS</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead>TYPE</TableHead>
            <TableHead>ALERT LEVEL</TableHead>
            <TableHead>CURRENT LOCATION</TableHead>
            <TableHead>SLOT</TableHead>
            <TableHead>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment.map((eq) => (
            <TableRow
              key={eq.id}
              onClick={() => onSelectEquipment(eq.id)}
              className={`cursor-pointer transition-colors ${
                selectedEquipmentId === eq.id
                  ? 'bg-sky-100 dark:bg-sky-900/30 hover:bg-sky-100 dark:hover:bg-sky-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-dark-border/50'
              }`}
            >
              <TableCell>
                <div className={`w-2 h-2 rounded-full ${eq.status === 'CRITICAL' ? 'bg-red-500' : eq.status === 'WARNING' ? 'bg-yellow-500' : 'bg-green-500'}`} />
              </TableCell>
              <TableCell className="font-medium">{eq.name}</TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">{eq.type || '-'}</TableCell>
              <TableCell>
                <Badge variant={statusColorMap[eq.status ?? 'STABLE'] || 'default'} className="text-xs">
                  {eq.status || 'STABLE'}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                {eq.rack_id ? `${eq.rack_tag}` : '-'}
              </TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">{eq.slot_position || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {/* STRICTLY ADMIN ONLY */}
                  <RoleGuard minRole="admin">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:text-red-600 dark:hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(eq.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </RoleGuard>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
