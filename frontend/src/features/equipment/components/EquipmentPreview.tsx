import { X, Edit, Loader2, Server } from 'lucide-react';
import { useState } from 'react';
import { useEquipmentById } from '../hooks/useEquipment';
import { RoleGuard } from '@/features/auth/components/RoleGuard';
import { EditEquipmentModal } from './EditEquipmentModal';
import { PlaceInRackModal } from './PlaceInRackModal';
import { Button } from '@/components/ui/button';

interface EquipmentPreviewProps {
  equipmentId: number;
  onClose: () => void;
}

export function EquipmentPreview({ equipmentId, onClose }: EquipmentPreviewProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlaceInRackModal, setShowPlaceInRackModal] = useState(false);
  const { data, isLoading, error } = useEquipmentById(equipmentId);
  const equipment = data?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] w-full bg-white dark:bg-slate-900">
        <Loader2 className="text-sky-500 animate-spin" size={24} />
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-xs tracking-wider text-slate-900 dark:text-slate-200">EQUIPMENT METRICS</h3>
          <Button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X size={16} className="text-slate-500" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
          <p className="text-xs font-medium">Failed to sync hardware telemetry bounds.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900">
        {/* Header Block */}
        <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
          <h3 className="font-bold text-xs tracking-wider text-slate-900 dark:text-slate-200 uppercase">Telemetry Preview</h3>
          <Button onClick={onClose} variant="outline">
            <X size={16} className="text-slate-500" />
          </Button>
        </div>

        {/* Content Body Space */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5">
          {/* Hardware Blueprint Hero Card */}
          <div className="bg-slate-950 rounded-xl h-36 flex flex-col items-center justify-center relative overflow-hidden border border-slate-800 shadow-inner">
            <Server size={36} className="text-slate-700 dark:text-slate-800 mb-1 absolute scale-125 opacity-20 -right-2 -bottom-4" />
            <span className="text-[10px] font-mono tracking-widest text-sky-500/70 font-semibold uppercase mb-1">SYSTEM NODE NODEID</span>
            <span className="text-sm font-mono text-slate-300 tracking-wider font-semibold">{equipment.tag}</span>
          </div>

          {/* Core Configuration Metrics */}
          <div className="grid grid-cols-1 gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-900">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Asset Label</span>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{equipment.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Type</span>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{equipment.type || '-'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Form Factor</span>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{equipment.slot_position ? `${equipment.slot_position}U Size` : '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Operational Status</span>
                <span className={`inline-flex items-center text-xs font-bold ${equipment.status === 'CRITICAL' ? 'text-rose-500' : equipment.status === 'WARNING' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                  {equipment.status || 'ONLINE'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Model Specification</span>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{equipment.model || '-'}</p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Serial Number</span>
              <p className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 break-all">{equipment.serial_number || '-'}</p>
            </div>
          </div>

          {/* Dynamic Rack Context Card */}
          {equipment.rack_id ? (
            <div className="p-4 bg-gradient-to-r from-sky-500/10 to-indigo-500/5 dark:from-sky-500/5 rounded-xl border border-sky-100 dark:border-sky-950">
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block mb-1">Assigned Rack Location</span>
              <p className="text-xs font-mono font-bold text-slate-800 dark:text-sky-300 flex items-center gap-2">
                <Server size={12} /> {equipment.rack_tag}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/10 text-center">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Hardware element is unallocated.</p>
            </div>
          )}
        </div>

        {/* Action Tray */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-2 sticky bottom-0">
          <RoleGuard minRole="operator">
            <Button
              onClick={() => setShowEditModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 h-9 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Edit size={14} /> Edit Equipment
            </Button>
          </RoleGuard>

          {!equipment.rack_id && (
            <RoleGuard minRole="operator">
              <Button
                onClick={() => setShowPlaceInRackModal(true)}
                className="w-full h-9 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-sky-600/10"
              >
                Place in Rack Mount Configuration
              </Button>
            </RoleGuard>
          )}
        </div>
      </div>

      {showEditModal && equipment && <EditEquipmentModal equipment={equipment} onClose={() => setShowEditModal(false)} />}
      {showPlaceInRackModal && equipment && (
        <PlaceInRackModal
          equipment={equipment}
          onClose={() => setShowPlaceInRackModal(false)}
          onSuccess={() => {
            const event = new Event('equipmentUpdated');
            window.dispatchEvent(event);
          }}
        />
      )}
    </>
  );
}