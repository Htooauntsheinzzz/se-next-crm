import api from "@/lib/api";
import type { ApiResponse } from "@/types/common";
import type { LeadScoreResultDto, LeadScoringRuleDto } from "@/types/lead";

export const leadScoringService = {
  getScoreBreakdown: async (leadId: number): Promise<LeadScoreResultDto> => {
    const response = await api.get<ApiResponse<LeadScoreResultDto>>(
      `/crm/v1/lead-scoring/leads/${leadId}/score`,
    );
    return response.data.data;
  },

  getRules: async (): Promise<LeadScoringRuleDto[]> => {
    const response = await api.get<ApiResponse<LeadScoringRuleDto[]>>("/crm/v1/lead-scoring/rules");
    return response.data.data;
  },
};
