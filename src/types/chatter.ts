export type MessageType = "NOTE" | "EMAIL_SENT" | "EMAIL_RECEIVED" | "SYSTEM" | "ACTIVITY_LOG";

export interface ChatterMessage {
  id: number;
  body: string;
  subject: string | null;
  type: MessageType;
  authorId: number | null;
  authorName: string | null;
  opportunityId: number | null;
  leadId: number | null;
  createdAt: string;
}

export interface NoteRequest {
  body: string;
  opportunityId?: number;
  leadId?: number;
}

export interface EmailLogRequest {
  subject?: string;
  body: string;
  to?: string;
  opportunityId?: number;
  leadId?: number;
  type?: MessageType;
}

export interface ChatterPanelProps {
  entityType: "opportunity" | "lead";
  entityId: number;
}
