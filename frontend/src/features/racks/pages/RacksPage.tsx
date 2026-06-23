import { useState } from 'react';
import { Plus, Search, Loader2, X, SlidersHorizontal, FileText } from 'lucide-react';
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

  // Mobile UI Management State
  const [mobileTab, setMobileTab] = useState<'slots' | 'details'>('slots');

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
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Premium Header Control Console */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-30">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Rack Matrix Infrastructure
            </h2>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Search Input */}
            <div className="relative w-full sm:w-64 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
              <input
                type="text"
                placeholder="Query asset tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 h-9 bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <RoleGuard minRole="operator">
              <Button
                onClick={() => setShowCreateRackModal(true)}
                className="h-9 rounded-xl px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/10 shrink-0 gap-1.5"
              >
                <Plus size={14} />
                <span>Create Rack</span>
              </Button>
            </RoleGuard>
          </div>
        </div>
      </div>

      {/* Main Panel Frame */}
      <div className="flex-1 flex overflow-hidden p-3 md:p-4 gap-4">

        {/* Left Column: Rack Matrix Grid View */}
        <div className="w-full md:w-95 lg:w-110 shrink-0 overflow-auto border border-slate-200 dark:border-slate-800/60 rounded-2xl bg-white dark:bg-slate-900 p-3 shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center h-full py-12">
              <Loader2 className="text-amber-500 animate-spin" size={24} />
            </div>
          ) : error ? (
            <div className="text-center text-xs font-mono py-12 text-rose-500">
              CRITICAL: Failed to poll layout arrays.
            </div>
          ) : filteredRacks.length === 0 ? (
            <div className="text-center text-xs font-mono py-12 text-slate-400">
              No managed infrastructure matched query parameters.
            </div>
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3">
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

        {/* Desktop Middle Column: Slots Table Allocation Monitor */}
        <div className="hidden md:flex flex-1 min-w-0 border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 flex-col shadow-sm">
          {selectedRack ? (
            <>
              <div className="bg-slate-50/4 dark:bg-slate-950/2 border-b border-slate-200 dark:border-slate-800 p-4 shrink-0 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">{selectedRack.tag} Mapping Array</h3>
                  <p className="text-[10px] font-mono text-slate-400">Chassis spatial index allocation matrix</p>
                </div>
                <RoleGuard minRole="operator">
                  <Button
                    onClick={() => handleAddEquipment()}
                    size="sm"
                    className="h-8 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white gap-1.5"
                  >
                    <Plus size={12} />
                    Add Equipment
                  </Button>
                </RoleGuard>
              </div>
              <div className="flex-1 overflow-auto">
                {equipmentLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="text-amber-500 animate-spin" size={20} />
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
            </>
          ) : (
            <div className="flex items-center justify-center flex-1 font-mono text-xs text-slate-400">
              Select a rack to view its details.
            </div>
          )}
        </div>

        {/* Desktop Right Column: Node Profile Inspect / Blueprint Spec Contexts */}
        <div className="hidden lg:block w-80 shrink-0 border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          {selectedRack ? (
            selectedEquipmentId ? (
              <EquipmentPreview
                equipmentId={selectedEquipmentId}
                onClose={() => setSelectedEquipmentId(null)}
              />
            ) : (
              <RackDetails
                rackId={selectedRack.id}
                onAddEquipment={handleAddEquipment}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full p-4 font-mono text-xs text-slate-400 text-center">
              Awaiting operational asset allocation mapping target.
            </div>
          )}
        </div>
      </div>

      {/* MOBILE RESPONSIVE OVERLAY DRAWER PANEL                            */}
      {/* ========================================================================= */}
      {selectedRack && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 w-full rounded-t-2xl border-t border-amber-500/20 shadow-2xl flex flex-col max-h-[85vh] transition-transform animate-in slide-in-from-bottom duration-300">

            {/* Mobile Sheet Top Dragbar & Header Info Section */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    {selectedRack.tag}
                  </h3>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {selectedRack.capacity}U Console
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-95">{selectedRack.name}</p>
              </div>
              <button
                onClick={() => { setSelectedRack(null); setSelectedEquipmentId(null); }}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            {/* Premium Mobile Component Sub-Tab Controls */}
            <div className="px-4 pt-3 shrink-0">
              <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/40 h-10">
                <button
                  onClick={() => setMobileTab('slots')}
                  className={`rounded-lg text-xs font-semibold px-3 flex items-center justify-center gap-1.5 transition-all ${mobileTab === 'slots'
                      ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-sm font-bold'
                      : 'text-slate-400 dark:text-slate-500'
                    }`}
                >
                  <SlidersHorizontal size={13} />
                  Slot Space Matrix
                </button>
                <button
                  onClick={() => setMobileTab('details')}
                  className={`rounded-lg text-xs font-semibold px-3 flex items-center justify-center gap-1.5 transition-all ${mobileTab === 'details'
                      ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-sm font-bold'
                      : 'text-slate-400 dark:text-slate-500'
                    }`}
                >
                  <FileText size={13} />
                  Node Blueprints
                </button>
              </div>
            </div>

            {/* Scrollable Container for Selected Tab Content */}
            <div className="flex-1 overflow-auto p-2">
              {mobileTab === 'slots' ? (
                selectedEquipmentId ? (
                  <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                    <EquipmentPreview
                      equipmentId={selectedEquipmentId}
                      onClose={() => setSelectedEquipmentId(null)}
                    />
                  </div>
                ) : equipmentLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="text-amber-500 animate-spin" size={24} />
                  </div>
                ) : (
                  <RackSlotsTable
                    rack={selectedRack}
                    equipment={rackEquipment}
                    selectedEquipmentId={selectedEquipmentId}
                    onSelectEquipment={setSelectedEquipmentId}
                    onAssignSlot={handleAddEquipment}
                  />
                )
              ) : (
                <div className="h-full min-h-75">
                  <RackDetails
                    rackId={selectedRack.id}
                    onAddEquipment={handleAddEquipment}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Application Functional Modals */}
      {showCreateRackModal && <CreateRackModal onClose={() => setShowCreateRackModal(false)} />}
      {showEditRackModal && editingRack && (
        <EditRackModal
          rack={editingRack}
          onClose={() => { setShowEditRackModal(false); setEditingRack(null); }}
        />
      )}
      {showCreateEquipmentModal && selectedRack && (
        <CreateEquipmentModal
          onClose={() => { setShowCreateEquipmentModal(false); setSelectedSlot(undefined); }}
          rackId={selectedRack.id}
          slotPosition={selectedSlot}
        />
      )}
    </div>
  );
}