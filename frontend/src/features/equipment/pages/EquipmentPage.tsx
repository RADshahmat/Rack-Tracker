import { useState } from 'react';
import { useEquipment, useDeleteEquipment } from '@/features/equipment/hooks/useEquipment';
import { EquipmentHeader } from '../components/EquipmentHeader';
import { EquipmentTable } from '../components/EquipmentTable';
import { EquipmentPreview } from '../components/EquipmentPreview';
import { CreateEquipmentModal } from '../components/CreateEquipmentModal';
import { EditEquipmentModal } from '../components/EditEquipmentModal';
import { Pagination } from '@/components/common/Pagination';
import { toast } from 'sonner';

export function EquipmentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);

  const { data, isLoading, error } = useEquipment(currentPage, 10);
  const { mutate: deleteEquipment } = useDeleteEquipment();

  const equipment = data?.data || [];
  const pagination = data?.pagination;

  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch =
      eq.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.name.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (filterStatus === 'assigned') matchesStatus = !!eq.rack_id;
    else if (filterStatus === 'unassigned') matchesStatus = !eq.rack_id;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure to delete this equipment?')) {
      deleteEquipment(id, {
        onSuccess: () => {
          toast.success('Equipment deleted successfully');
          if (selectedEquipmentId === id) setSelectedEquipmentId(null);
        },
        onError: () => {
          toast.error('Failed to delete equipment');
        },
      });
    }
  };

  return (
    <div className="flex w-full h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Left Pane: Core List/Table Module */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <EquipmentHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onCreateNew={() => setShowCreateModal(true)}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        <div className="flex-1 overflow-y-auto">
          <EquipmentTable
            equipment={filteredEquipment}
            isLoading={isLoading}
            error={!!error}
            selectedEquipmentId={selectedEquipmentId}
            onSelectEquipment={setSelectedEquipmentId}
            onDelete={handleDelete}
          />
        </div>

        {pagination && (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Right Pane: Desktop Preview Panel Only */}
      {selectedEquipmentId && (
        <div className="hidden lg:flex w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full overflow-y-auto">
          <EquipmentPreview
            equipmentId={selectedEquipmentId}
            onClose={() => setSelectedEquipmentId(null)}
          />
        </div>
      )}

      {/* Mobile/Tablet Fallback Dialog Overlay */}
      {selectedEquipmentId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 backdrop-blur-sm lg:hidden p-0 sm:p-4">
          <div className="fixed inset-0" onClick={() => setSelectedEquipmentId(null)} />
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl h-[85vh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 z-10">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 shrink-0 sm:hidden" />
            <div className="flex-1 overflow-y-auto">
              <EquipmentPreview
                equipmentId={selectedEquipmentId}
                onClose={() => setSelectedEquipmentId(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Control Modals */}
      {showCreateModal && <CreateEquipmentModal onClose={() => setShowCreateModal(false)} />}
      {editingEquipment && (
        <EditEquipmentModal equipment={editingEquipment} onClose={() => setEditingEquipment(null)} />
      )}
    </div>
  );
}