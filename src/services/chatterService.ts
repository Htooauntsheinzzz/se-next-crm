import api from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type { ChatterMessage, EmailLogRequest, NoteRequest } from "@/types/chatter";

export const chatterService = {
  getForOpportunity: async (id: number): Promise<ChatterMessage[]> => {
    const response = await api.get<ApiResponse<ChatterMessage[]>>(`/crm/v1/chatter/opportunity/${id}`);
    return response.data.data ?? [];
  },

  getForLead: async (id: number): Promise<ChatterMessage[]> => {
    const response = await api.get<ApiResponse<ChatterMessage[]>>(`/crm/v1/chatter/lead/${id}`);
    return response.data.data ?? [];
  },

  addNote: async (data: NoteRequest): Promise<ChatterMessage> => {
    const response = await api.post<ApiResponse<ChatterMessage>>("/crm/v1/chatter/note", data);
    return response.data.data;
  },

  logEmail: async (data: EmailLogRequest): Promise<ChatterMessage> => {
    const response = await api.post<ApiResponse<ChatterMessage>>("/crm/v1/chatter/email-log", data);
    return response.data.data;
  },
};
