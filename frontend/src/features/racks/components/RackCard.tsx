import type { Rack } from '@/types';
import { Edit, Trash2 } from 'lucide-react';
import { RoleGuard } from '@/features/auth/components/RoleGuard';

interface RackCardProps {
  rack: Rack;
  isSelected?: boolean;
  onClick?: () => void;
  onEdit?: (rack: Rack) => void;
  onDelete?: (id: number) => void;
}

export function RackCard({ rack, isSelected, onClick, onEdit, onDelete }: RackCardProps) {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(rack);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(rack.id);
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group border flex flex-col justify-between ${isSelected
          ? 'border-amber-500 bg-amber-500/2 dark:bg-amber-500/1 shadow-md shadow-amber-500/4'
          : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-amber-500/40'
        }`}
    >
      {/* Top Graphic Section */}
      <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 h-20 sm:h-24 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/60 p-2">
        <img
          src="/rack.png"
          alt={rack.tag}
          className="max-h-full max-w-[80%] object-contain opacity-75 group-hover:opacity-100 dark:invert dark:opacity-40 dark:group-hover:opacity-60 transition-all duration-300 group-hover:scale-105"
        />

        {/* Interactive Controls Layer Overlay */}
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <RoleGuard minRole="operator">
            <button
              onClick={handleEditClick}
              className="p-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-colors"
              title="Modify Node Config"
            >
              <Edit size={14} />
            </button>
          </RoleGuard>

          <RoleGuard minRole="admin">
            <button
              onClick={handleDeleteClick}
              className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors"
              title="Decommission Node Array"
            >
              <Trash2 size={14} />
            </button>
          </RoleGuard>
        </div>
      </div>

      {/* Asset Identifier Frame */}
      <div className="p-3 space-y-2 bg-white dark:bg-slate-900">
        <div>
          <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate tracking-wide uppercase">
            {rack.tag}
          </p>
          <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">
            {rack.name}
          </p>
        </div>
        <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-slate-400 font-mono">CAPACITY:</span>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded">
            {rack.capacity}U
          </span>
        </div>
      </div>
    </div>
  );
}