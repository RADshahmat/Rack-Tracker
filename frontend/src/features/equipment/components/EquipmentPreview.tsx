import { X, Edit, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useEquipmentById } from '../hooks/useEquipment';
import { RoleGuard } from '@/features/auth/components/RoleGuard';
import { EditEquipmentModal } from './EditEquipmentModal';
import { PlaceInRackModal } from './PlaceInRackModal';

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
      <div className="bg-white dark:bg-dark-surface flex flex-col items-center justify-center h-full">
        <Loader2 className="text-sky-600 dark:text-sky-500 animate-spin" size={24} />
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="bg-white dark:bg-dark-surface flex flex-col overflow-hidden h-full">
        <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">EQUIPMENT PREVIEW</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-border rounded transition-colors"
          >
            <X size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">Failed to load equipment</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-dark-surface flex flex-col overflow-hidden h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">EQUIPMENT PREVIEW</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-dark-border rounded transition-colors"
          >
            <X size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Image placeholder */}
          <div className="bg-gray-100 dark:bg-dark-bg rounded-lg h-40 flex items-center justify-center overflow-hidden">
            <img
              src="/rack.png"
              alt="Equipment"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Equipment Details */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tag</label>
              <p className="text-sm text-gray-900 dark:text-white font-semibold">{equipment.tag}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</label>
              <p className="text-sm text-gray-900 dark:text-white font-semibold">{equipment.name}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</label>
              <p className={`text-sm font-medium ${equipment.status === 'CRITICAL' ? 'text-red-600 dark:text-red-500' : equipment.status === 'WARNING' ? 'text-yellow-600 dark:text-yellow-500' : 'text-green-600 dark:text-green-500'}`}>
                {equipment.status || 'STABLE'}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Type</label>
              <p className="text-sm text-gray-900 dark:text-white">{equipment.type || '-'}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Model</label>
              <p className="text-sm text-gray-900 dark:text-white">{equipment.model || '-'}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Slot Position</label>
              <p className="text-sm text-gray-900 dark:text-white">{equipment.slot_position ? `${equipment.slot_position}U` : '-'}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Serial Number</label>
              <p className="text-xs text-gray-900 dark:text-white font-mono break-all">{equipment.serial_number || '-'}</p>
            </div>

            {equipment.rack_id && (
              <div className="p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-600">
                <label className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase block mb-1">Assigned to</label>
                <p className="text-sm text-sky-900 dark:text-sky-200">
                 {equipment.rack_tag}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-border space-y-2 shrink-0">
          {/* OPERATOR OR HIGHER CAN EDIT */}
          <RoleGuard minRole="operator">
            <button
              onClick={() => setShowEditModal(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-dark-border hover:bg-gray-200 dark:hover:bg-dark-border/80 text-gray-900 dark:text-white text-xs rounded transition-colors"
            >
              <Edit size={14} />
              Edit
            </button>
          </RoleGuard>

          {/* OPERATOR OR HIGHER CAN PLACE IN RACK */}
          {!equipment.rack_id && (
            <RoleGuard minRole="operator">
              <button
                onClick={() => setShowPlaceInRackModal(true)}
                className="w-full px-3 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white text-xs rounded transition-colors font-semibold"
              >
                Place in Rack
              </button>
            </RoleGuard>
          )}
        </div>
      </div>

      {showEditModal && equipment && (
        <EditEquipmentModal
          equipment={equipment}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showPlaceInRackModal && equipment && (
        <PlaceInRackModal
          equipment={equipment}
          onClose={() => setShowPlaceInRackModal(false)}
          onSuccess={() => {
            // Refresh the equipment data
            const event = new Event('equipmentUpdated');
            window.dispatchEvent(event);
          }}
        />
      )}
    </>
  );
}

