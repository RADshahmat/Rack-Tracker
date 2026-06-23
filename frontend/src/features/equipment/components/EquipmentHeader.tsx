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
    { value: 'all' as const, label: 'All Components' },
    { value: 'assigned' as const, label: 'Assigned Status' },
    { value: 'unassigned' as const, label: 'Unassigned Status' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/60 p-3 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        {/* Left Side: Contextual Title */}

          <h2 className="text-base font-bold tracking-wide text-slate-900 dark:text-slate-100">
            Global Equipment Inventory
          </h2>
  
        {/* Right Side: Responsive Actions Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">

          {/* Combined Search & Filter Compound Input Group */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            {/* Search Input Container */}
            <div className="relative w-full sm:w-64 md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={15} />
              <Input
                type="text"
                placeholder="Search index tag or asset name..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 pr-3 h-9 bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder:text-slate-400 focus-visible:ring-sky-500/30 focus-visible:border-sky-500/50 transition-all"
              />
            </div>

            {/* Premium Dropdown Toggle Anchor */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-9 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <Filter size={14} className="text-slate-400" />
                <span className="capitalize">{filterStatus}</span>
              </Button>

              {/* Context Menu Dropdown Overlays */}
              {showFilterMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowFilterMenu(false)} />
                  <div className="absolute top-full right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-xl z-30 min-w-40 overflow-hidden p-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          onFilterChange?.(option.value);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg font-medium transition-colors ${filterStatus === option.value
                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950/60 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Trigger Node */}
          <RoleGuard minRole="operator">
            <Button
              onClick={onCreateNew}
              className="gap-2 h-9 px-4 rounded-xl bg-linear-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white text-xs font-bold shadow-sm shadow-sky-600/10 transition-all w-full sm:w-auto"
            >
              <Plus size={15} />
              Add Equipment
            </Button>
          </RoleGuard>

        </div>

      </div>
    </div>
  );
}