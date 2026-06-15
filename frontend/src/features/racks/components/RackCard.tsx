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
      className={`rounded-lg overflow-hidden cursor-pointer transition-all group border-2 ${isSelected
          ? 'border-sky-500 shadow-lg bg-sky-50 dark:bg-sky-900/20'
          : 'border-gray-200 dark:border-dark-border hover:border-sky-500 dark:hover:border-sky-500'
        }`}
    >
      {/* Rack image - top */}
      <div className="relative overflow-hidden bg-gray-100 dark:bg-dark-bg h-28">
        <img
          src="/rack.png"
          alt={rack.tag}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {/* Icons overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          {/* OPERATOR OR HIGHER CAN EDIT */}
          <RoleGuard minRole="operator">
            <button
              onClick={handleEditClick}
              className="p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
              title="Edit rack"
            >
              <Edit size={18} />
            </button>
          </RoleGuard>

          {/* STRICTLY ADMIN ONLY */}
          <RoleGuard minRole="admin">
            <button
              onClick={handleDeleteClick}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              title="Delete rack"
            >
              <Trash2 size={18} />
            </button>
          </RoleGuard>
        </div>
      </div>

      {/* Rack info - bottom */}
      <div className="p-3 space-y-2">
        <div>
          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{rack.tag}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{rack.name}</p>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Total Slots:</span>
          <span className="font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-dark-bg px-2 py-1 rounded">
            {rack.capacity}U
          </span>
        </div>
      </div>
    </div>
  );
}

