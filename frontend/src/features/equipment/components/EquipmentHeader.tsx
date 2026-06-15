import { Search, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleGuard } from '@/features/auth/components/RoleGuard';
import { useState } from 'react';

interface EquipmentHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateNew: () => void;
  filterStatus?: 'all' | 'assigned' | 'unassigned';
  onFilterChange?: (filter: 'all' | 'assigned' | 'unassigned') => void;
}

export function EquipmentHeader({ 
  searchTerm, 
  onSearchChange, 
  onCreateNew,
  filterStatus = 'all',
  onFilterChange 
}: EquipmentHeaderProps) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filterOptions = [
    { value: 'all' as const, label: 'All' },
    { value: 'assigned' as const, label: 'Assigned' },
    { value: 'unassigned' as const, label: 'Unassigned' },
  ];

  return (
    <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border p-4">
      <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Global Equipment Inventory</h2>
          {/* Search and Filter Row */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
              <Input
                type="text"
                placeholder="Filter: SYR-X100"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 pr-3 py-1.5"
              />
            </div>

            {/* Filter Button with Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <Filter size={16} />
                {filterStatus === 'all' ? 'All' : filterStatus === 'assigned' ? 'Assigned' : 'Unassigned'}
              </Button>

              {/* Filter Dropdown Menu */}
              {showFilterMenu && (
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg z-10 min-w-40">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onFilterChange?.(option.value);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        filterStatus === option.value
                          ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-900 dark:text-sky-200 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
       

        {/* OPERATOR OR HIGHER CAN CREATE */}
        <RoleGuard minRole="operator">
          <Button onClick={onCreateNew} className="gap-2 whitespace-nowrap">
            <Plus size={16} />
            Add New Equipment
          </Button>
        </RoleGuard>
      </div>
    </div>
  );
}
