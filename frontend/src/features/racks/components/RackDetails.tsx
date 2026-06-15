import { Loader2, Upload, Eye, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Rack } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/features/auth/components/RoleGuard';
import { useRackAttachments, useDeleteRackSpec } from '../hooks/useRackAttachments';
import { UploadSpecModal } from './UploadSpecModal';
import { racksApi } from '../api/index';

interface RackDetailsProps {
  rackId: number;
  onAddEquipment: (slotPosition?: number) => void;
}

export function RackDetails({
  rackId,
  onAddEquipment,
}: RackDetailsProps) {
  const [rack, setRack] = useState<Rack | null>(null);
  const [rackLoading, setRackLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { data: attachmentsResponse, isLoading: attachmentsLoading } = useRackAttachments(rackId);
  const { mutate: deleteSpec, isPending: isDeleting } = useDeleteRackSpec();

  useEffect(() => {
    const fetchRack = async () => {
      try {
        setRackLoading(true);
        const response = await racksApi.getById(rackId);
        if (response.data) {
          setRack(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch rack:', error);
      } finally {
        setRackLoading(false);
      }
    };

    fetchRack();
  }, [rackId]);

  const attachments = attachmentsResponse?.data || [];
  const latestAttachment = attachments[0] || null;

  const handleDeleteAttachment = () => {
    if (!latestAttachment) return;
    if (window.confirm('Are you sure you want to delete this specification?')) {
      deleteSpec({ rackId, attachmentId: latestAttachment.id });
    }
  };

  const handleViewAttachment = () => {
    if (!latestAttachment) return;
    const downloadUrl = `/api/racks/${rackId}/attachments/${latestAttachment.id}/download`;
    window.open(downloadUrl, '_blank');
  };

  if (rackLoading) {
    return (
      <div className="bg-white dark:bg-dark-surface flex items-center justify-center h-full">
        <Loader2 className="text-sky-600 dark:text-sky-500 animate-spin" size={24} />
      </div>
    );
  }

  if (!rack) {
    return (
      <div className="bg-white dark:bg-dark-surface flex items-center justify-center h-full">
        <p className="text-sm text-gray-500 dark:text-gray-400">Failed to load rack details</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-surface flex flex-col h-full overflow-auto">
      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Rack Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{rack.tag}</h3>
            <Badge variant="default">{rack.capacity}U</Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{rack.name}</p>
        </div>

        <div className="border-t border-gray-200 dark:border-dark-border pt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Location</span>
            <p className="font-medium text-gray-900 dark:text-white">{rack.location || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Capacity</span>
            <p className="font-medium text-gray-900 dark:text-white">{rack.capacity} U</p>
          </div>
        </div>

        {/* Specification Section */}
        <div className="border-t border-gray-200 dark:border-dark-border pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Specification</h4>
            {attachmentsLoading && <Loader2 size={14} className="animate-spin text-gray-400" />}
          </div>

          {latestAttachment ? (
            <div className="bg-gray-50 dark:bg-dark-bg p-3 rounded space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {latestAttachment.original_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Uploaded by {latestAttachment.uploaded_by_username} on{' '}
                {new Date(latestAttachment.created_at).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2 pt-2">
                {/* VIEW BUTTON - ALL ROLES */}
                <Button
                  onClick={handleViewAttachment}
                  variant="default"
                  size="sm"
                  className="flex-1 gap-1"
                >
                  <Eye size={12} />
                  View
                </Button>

                {/* DELETE BUTTON - ADMIN ONLY */}
                <RoleGuard minRole="admin">
                  <Button
                    onClick={handleDeleteAttachment}
                    disabled={isDeleting}
                    variant="destructive"
                    size="sm"
                    className="flex-1 gap-1"
                  >
                    {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Delete
                  </Button>
                </RoleGuard>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">No specification uploaded yet</p>
          )}

          {/* UPLOAD BUTTON - OPERATOR AND ADMIN */}
          <RoleGuard minRole="operator">
            <Button
              onClick={() => setShowUploadModal(true)}
              className="w-full gap-2"
            >
              <Upload size={14} />
              {latestAttachment ? 'Replace Spec' : 'Upload Spec'}
            </Button>
          </RoleGuard>
        </div>
      </div>

      {/* Modals */}
      {showUploadModal && (
        <UploadSpecModal
          rackId={rackId}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
}
