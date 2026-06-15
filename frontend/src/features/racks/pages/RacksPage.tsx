import { useState } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { useRacks, useDeleteRack } from '@/features/racks/hooks/useRacks';
import { useEquipmentByRackId } from '@/features/equipment/hooks/useEquipment';
import { RoleGuard } from '@/features/auth/components/RoleGuard';
import type { Rack } from '@/types';
import { RackCard } from '../components/RackCard';
import { RackDetails } from '../components/RackDetails';
import { RackSlotsTable } from '../components/RackSlotsTable';
import { EquipmentPreview } from '@/features/equipment/components/EquipmentPreview';
import { CreateRackModal } from '../components/CreateRackModal';
import { EditRackModal } from '../components/EditRackModal';
import { CreateEquipmentModal } from '@/features/equipment/components/CreateEquipmentModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function RacksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateRackModal, setShowCreateRackModal] = useState(false);
  const [showEditRackModal, setShowEditRackModal] = useState(false);
  const [editingRack, setEditingRack] = useState<Rack | null>(null);
  const [showCreateEquipmentModal, setShowCreateEquipmentModal] = useState(false);
  const [selectedRack, setSelectedRack] = useState<Rack | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | undefined>(undefined);

  const { data, isLoading, error } = useRacks();
  const { data: equipmentData, isLoading: equipmentLoading } = useEquipmentByRackId(selectedRack?.id);
  const { mutate: deleteRack } = useDeleteRack();

  const racks = data?.data || [];
  const filteredRacks = racks.filter(
    (rack) =>
      rack.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rack.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rackEquipment = equipmentData?.data || [];

  const handleAddEquipment = (slotPosition?: number) => {
    setSelectedSlot(slotPosition);
    setShowCreateEquipmentModal(true);
  };

  const handleEditRack = (rack: Rack) => {
    setEditingRack(rack);
    setShowEditRackModal(true);
  };

  const handleDeleteRack = (rackId: number) => {
    if (window.confirm('Are you sure to delete this rack?\nAll the equipment in this rack will be unassigned.')) {
      deleteRack(rackId, {
        onSuccess: () => {
          toast.success('Rack deleted successfully');
          if (selectedRack?.id === rackId) {
            setSelectedRack(null);
          }
        },
        onError: () => {
          toast.error('Failed to delete rack');
        },
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with search and create button */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
        <div className="p-4 flex items-center justify-between gap-4">

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Racks and Equipment Data View
          </h2>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search rack ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>


          {/* OPERATOR OR HIGHER CAN CREATE */}
          <RoleGuard minRole="operator">
            <Button
              onClick={() => setShowCreateRackModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white text-sm rounded transition-colors whitespace-nowrap"
            >
              <Plus size={16} />
              Create Rack
            </Button>
          </RoleGuard>
        </div>
      </div>

      {/* Main content - three column layout */}
      <div className="flex-1 flex overflow-hidden gap-4 p-4 bg-white dark:bg-dark-bg">
        {/* Left: Rack grid */}
        <div className="w-100 shrink-0 overflow-auto border border-gray-200 dark:border-dark-border rounded-lg bg-gray-50 dark:bg-dark-surface p-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="text-sky-600 dark:text-sky-500 animate-spin" size={24} />
            </div>
          ) : error ? (
            <div className="text-center text-xs text-red-600 dark:text-red-400">
              Failed to load racks
            </div>
          ) : filteredRacks.length === 0 ? (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              No racks found
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filteredRacks.map((rack) => (
                <RackCard
                  key={rack.id}
                  rack={rack}
                  isSelected={selectedRack?.id === rack.id}
                  onClick={() => setSelectedRack(rack)}
                  onEdit={handleEditRack}
                  onDelete={handleDeleteRack}
                />
              ))}
            </div>
          )}
        </div>

        {/* Middle: Rack Slots Table */}
        {selectedRack ? (
          <div className="flex-1 min-w-0 border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden flex flex-col">
            <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border p-3 shrink-0 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRack.tag} Slots</h3>
              <RoleGuard minRole="operator">
                <Button onClick={() => handleAddEquipment()} size="sm" className="gap-2">
                  <Plus size={14} />
                  Add Equipment
                </Button>
              </RoleGuard>
            </div>
            {equipmentLoading ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="text-sky-600 dark:text-sky-500 animate-spin" size={20} />
              </div>
            ) : (
              <RackSlotsTable
                rack={selectedRack}
                equipment={rackEquipment}
                selectedEquipmentId={selectedEquipmentId}
                onSelectEquipment={setSelectedEquipmentId}
                onAssignSlot={handleAddEquipment}
              />
            )}
          </div>
        ) : (
          <div className="flex-1 min-w-0 border border-gray-200 dark:border-dark-border rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">Select a rack to view slots</p>
          </div>
        )}

        {/* Right: Rack Details with Specs */}
        {selectedRack ? (
          <div className="w-80 shrink-0 border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
            {selectedEquipmentId ? (
              <EquipmentPreview
                equipmentId={selectedEquipmentId}
                onClose={() => setSelectedEquipmentId(null)}
              />
            ) : (
              <RackDetails
                rackId={selectedRack.id}
                onAddEquipment={handleAddEquipment}
              />
            )}
          </div>
        ) : (
          <div className="w-80 shrink-0 border border-gray-200 dark:border-dark-border rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
            <p className="text-sm text-center px-4">Select a rack to view details</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateRackModal && (
        <CreateRackModal onClose={() => setShowCreateRackModal(false)} />
      )}
      {showEditRackModal && editingRack && (
        <EditRackModal
          rack={editingRack}
          onClose={() => {
            setShowEditRackModal(false);
            setEditingRack(null);
          }}
        />
      )}
      {showCreateEquipmentModal && selectedRack && (
        <CreateEquipmentModal
          onClose={() => {
            setShowCreateEquipmentModal(false);
            setSelectedSlot(undefined);
          }}
          rackId={selectedRack.id}
          slotPosition={selectedSlot}
        />
      )}
    </div>
  );
}
