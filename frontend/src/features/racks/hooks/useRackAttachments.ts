import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { racksApi } from '../api/index';
import { toast } from 'sonner';

export function useRackAttachments(rackId: number | null) {
  return useQuery({
    queryKey: ['rack-attachments', rackId],
    queryFn: () => racksApi.getAttachments(rackId!),
    enabled: !!rackId,
  });
}

export function useUploadRackSpec() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rackId, file }: { rackId: number; file: File }) => {
      return racksApi.uploadSpec(rackId, file);
    },
    onSuccess: (_, { rackId }) => {
      queryClient.invalidateQueries({ queryKey: ['rack-attachments', rackId] });
      toast.success('Specification uploaded successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to upload specification';
      toast.error(message);
    },
  });
}

export function useDeleteRackSpec() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rackId, attachmentId }: { rackId: number; attachmentId: number }) => {
      return racksApi.deleteAttachment(rackId, attachmentId);
    },
    onSuccess: (_, { rackId }) => {
      queryClient.invalidateQueries({ queryKey: ['rack-attachments', rackId] });
      toast.success('Specification deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete specification';
      toast.error(message);
    },
  });
}
