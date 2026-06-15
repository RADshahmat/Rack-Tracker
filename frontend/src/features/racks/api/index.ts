import { apiClient } from '@/api/client';
import type { Rack, ApiResponse, Attachment } from '@/types/index';
import type { RackFormInput } from '@/types/schemas';

export const racksApi = {
  getAll: () =>
    apiClient.get<ApiResponse<Rack[]>>('/racks'),

  getById: (id: number) =>
    apiClient.get<ApiResponse<Rack>>(`/racks/${id}`),

  create: (data: RackFormInput) =>
    apiClient.post<ApiResponse<Rack>>('/racks', data),

  update: (id: number, data: Partial<RackFormInput>) =>
    apiClient.put<ApiResponse<Rack>>(`/racks/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/racks/${id}`),

  // Attachment methods
  uploadSpec: (rackId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<ApiResponse<Attachment>>(`/racks/${rackId}/upload`, formData);
  },

  getAttachments: (rackId: number) =>
    apiClient.get<ApiResponse<Attachment[]>>(`/racks/${rackId}/attachments`),

  deleteAttachment: (rackId: number, attachmentId: number) =>
    apiClient.delete<ApiResponse<void>>(`/racks/${rackId}/attachments/${attachmentId}`),
};
