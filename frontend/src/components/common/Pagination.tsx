import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/60 py-3 px-4">

      {/* Informative Status Badge */}
      <div className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
        Page <span className="text-slate-900 dark:text-slate-200">{currentPage}</span> of <span className="text-slate-600 dark:text-slate-400">{totalPages}</span>
      </div>

      {/* Interactive Navigation Triggers */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={14} className="text-slate-500" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
      
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} className="text-slate-500" />
        </Button>
      </div>

    </div>
  );
}