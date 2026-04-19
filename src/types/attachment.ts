export type AttachmentEntityType = "CONTACT" | "LEAD" | "OPPORTUNITY";

export interface Attachment {
  id: number;
  fileName: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  fileSizeFormatted: string;
  entityType: AttachmentEntityType;
  entityId: number;
  description: string | null;
  createdAt: string;
  createdBy: string;
}

export interface UploadAttachmentPayload {
  file: File;
  entityType: AttachmentEntityType;
  entityId: number;
  description?: string;
}
