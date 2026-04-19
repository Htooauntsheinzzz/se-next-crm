import api from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type { Attachment, AttachmentEntityType, UploadAttachmentPayload } from "@/types/attachment";

const BASE = "/crm/v1/attachments";

export const attachmentService = {
  upload: async (payload: UploadAttachmentPayload): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("entityType", payload.entityType);
    formData.append("entityId", String(payload.entityId));

    if (payload.description) {
      formData.append("description", payload.description);
    }

    const response = await api.post<ApiResponse<Attachment>>(`${BASE}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },

  getByEntity: async (entityType: AttachmentEntityType, entityId: number): Promise<Attachment[]> => {
    const response = await api.get<ApiResponse<Attachment[]>>(`${BASE}/entity/${entityType}/${entityId}`);
    return response.data.data ?? [];
  },

  getById: async (id: number): Promise<Attachment> => {
    const response = await api.get<ApiResponse<Attachment>>(`${BASE}/${id}`);
    return response.data.data;
  },

  download: async (id: number, originalName: string) => {
    const response = await api.get(`${BASE}/${id}/download`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", originalName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`${BASE}/${id}`);
    return response.data;
  },
};
