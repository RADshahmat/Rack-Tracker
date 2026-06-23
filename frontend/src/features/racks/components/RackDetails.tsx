import { Loader2, Upload, Eye, Trash2, MapPin, Layers } from 'lucide-react';
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

export function RackDetails({ rackId, onAddEquipment }: RackDetailsProps) {
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
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <Loader2 className="text-amber-500 animate-spin" size={20} />
      </div>
    );
  }

  if (!rack) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-xs font-mono text-slate-400">
        Telemetry failure context frame data missing.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto p-4 space-y-4 bg-white dark:bg-slate-900">
      {/* Node Profile Header Context */}
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h3 className="text-base font-black tracking-wide text-slate-900 dark:text-white uppercase">{rack.tag}</h3>
          <Badge className="bg-amber-500/10 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono text-[10px] py-0.5 px-2">
            {rack.capacity}U MAX
          </Badge>
        </div>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate">{rack.name}</p>
      </div>

      {/* Structural Allocation Properties */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <MapPin size={10} className="text-amber-500" /> Site Zone
          </span>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{rack.location || 'UNASSIGNED'}</p>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Layers size={10} className="text-amber-500" /> Index Span
          </span>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{rack.capacity} U-Units</p>
        </div>
      </div>

      {/* Blueprint Blueprint Spec File Manager Box */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Documentary Specifications</h4>
          {attachmentsLoading && <Loader2 size={12} className="animate-spin text-amber-500" />}
        </div>

        {latestAttachment ? (
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 space-y-2">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 break-all font-mono">
              {latestAttachment.original_name}
            </p>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              Dispatched by {latestAttachment.uploaded_by_username} on{' '}
              {new Date(latestAttachment.created_at).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric'
              })}
            </p>
            <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
              <Button
                onClick={handleViewAttachment}
                size="sm"
                className="flex-1 h-7 text-[11px] font-bold uppercase bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg gap-1 transition-colors"
              >
                <Eye size={12} />
                View
              </Button>

              <RoleGuard minRole="admin">
                <Button
                  onClick={handleDeleteAttachment}
                  disabled={isDeleting}
                  variant="destructive"
                  size="sm"
                  className="flex-1 h-7 text-[11px] font-bold uppercase rounded-lg gap-1 transition-colors"
                >
                  {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  Wipe
                </Button>
              </RoleGuard>
            </div>
          </div>
        ) : (
          <p className="text-xs font-mono text-slate-400 dark:text-slate-500 py-3 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            No hardware profile data blueprint allocated.
          </p>
        )}

        <RoleGuard minRole="operator">
          <Button
            onClick={() => setShowUploadModal(true)}
            className="w-full h-9 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm gap-2 mt-1"
          >
            <Upload size={13} />
            {latestAttachment ? 'Replace Spec Asset' : 'Upload Spec Blueprint'}
          </Button>
        </RoleGuard>
      </div>
    </div>
  );
}