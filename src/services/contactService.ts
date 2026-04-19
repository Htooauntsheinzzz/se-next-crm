import api from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type {
  Contact,
  ContactCreateRequest,
  ContactFilters,
  ContactHistoryDto,
  ContactListResponse,
  ContactUpdateRequest,
  MergeContactRequest,
  TagDto,
} from "@/types/contact";

const cleanParams = (params: ContactFilters) => {
  const normalized: Record<string, string | number> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    normalized[key] = value;
  });

  return normalized;
};

export const contactService = {
  getAll: async (params: ContactFilters): Promise<ContactListResponse> => {
    const response = await api.get<ApiResponse<ContactListResponse>>("/crm/v1/contacts", {
      params: cleanParams(params),
    });
    return response.data.data;
  },

  getById: async (id: number): Promise<Contact> => {
    const response = await api.get<ApiResponse<Contact>>(`/crm/v1/contacts/${id}`);
    return response.data.data;
  },

  getHistory: async (id: number): Promise<ContactHistoryDto> => {
    const response = await api.get<ApiResponse<ContactHistoryDto>>(`/crm/v1/contacts/${id}/history`);
    return response.data.data;
  },

  create: async (data: ContactCreateRequest): Promise<Contact> => {
    const response = await api.post<ApiResponse<Contact>>("/crm/v1/contacts", data);
    return response.data.data;
  },

  update: async (id: number, data: ContactUpdateRequest): Promise<Contact> => {
    const response = await api.put<ApiResponse<Contact>>(`/crm/v1/contacts/${id}`, data);
    return response.data.data;
  },

  deactivate: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/crm/v1/contacts/${id}`);
    return response.data;
  },

  getCompanies: async (params: ContactFilters): Promise<ContactListResponse> => {
    const response = await api.get<ApiResponse<ContactListResponse>>("/crm/v1/contacts/companies", {
      params: cleanParams(params),
    });
    return response.data.data;
  },

  getPersonsInCompany: async (id: number): Promise<Contact[]> => {
    const response = await api.get<ApiResponse<Contact[]>>(`/crm/v1/contacts/${id}/persons`);
    return response.data.data;
  },

  merge: async (primaryId: number, data: MergeContactRequest): Promise<Contact> => {
    const response = await api.post<ApiResponse<Contact>>(`/crm/v1/contacts/${primaryId}/merge`, data);
    return response.data.data;
  },

  search: async (q: string): Promise<Contact[]> => {
    const response = await api.get<ApiResponse<Contact[]>>("/crm/v1/contacts/search", {
      params: { q },
    });
    return response.data.data;
  },

  getTags: async (): Promise<TagDto[]> => {
    const response = await api.get<ApiResponse<TagDto[]>>("/crm/v1/tags");
    return response.data.data;
  },
};
