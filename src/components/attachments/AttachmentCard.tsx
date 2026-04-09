import { formatDistanceToNow } from "date-fns";
import {
  Archive,
  Download,
  File,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { mergeClassNames } from "@/lib/utils";
import type { Attachment } from "@/types/attachment";

interface AttachmentCardProps {
  attachment: Attachment;
  onDelete: (id: number) => void;
  onDownload: (id: number, originalName: string) => void;
  canDelete: boolean;
}

interface FileIconMeta {
  icon: typeof File;
  colorClassName: string;
  backgroundClassName: string;
}

export const getFileIcon = (contentType: string): FileIconMeta => {
  if (contentType === "application/pdf") {
    return {
      icon: FileText,
      colorClassName: "text-red-500",
      backgroundClassName: "bg-red-50",
    };
  }

  if (contentType.startsWith("image/")) {
    return {
      icon: ImageIcon,
      colorClassName: "text-blue-500",
      backgroundClassName: "bg-blue-50",
    };
  }

  if (
    contentType.includes("spreadsheet") ||
    contentType.includes("excel") ||
    contentType === "text/csv"
  ) {
    return {
      icon: FileSpreadsheet,
      colorClassName: "text-green-600",
      backgroundClassName: "bg-green-50",
    };
  }

  if (
    contentType.includes("word") ||
    contentType.includes("document") ||
    contentType.includes("presentation") ||
    contentType.includes("powerpoint")
  ) {
    return {
      icon: FileText,
      colorClassName: "text-blue-600",
      backgroundClassName: "bg-blue-50",
    };
  }

  if (
    contentType.includes("zip") ||
    contentType.includes("archive") ||
    contentType.includes("compressed")
  ) {
    return {
      icon: Archive,
      colorClassName: "text-amber-600",
      backgroundClassName: "bg-amber-50",
    };
  }

  return {
    icon: File,
    colorClassName: "text-slate-400",
    backgroundClassName: "bg-slate-50",
  };
};

const getDateLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "just now";
  }
  return formatDistanceToNow(date, { addSuffix: true });
};

export const AttachmentCard = ({
  attachment,
  onDelete,
  onDownload,
  canDelete,
}: AttachmentCardProps) => {
  const fileIcon = getFileIcon(attachment.contentType);
  const Icon = fileIcon.icon;

  return (
    <article className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={mergeClassNames(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            fileIcon.backgroundClassName,
          )}
        >
          <Icon className={mergeClassNames("h-5 w-5", fileIcon.colorClassName)} />
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p
              className="max-w-[42ch] truncate text-sm font-semibold text-slate-900"
              title={attachment.originalName}
            >
              {attachment.originalName}
            </p>
            <span className="text-xs text-slate-500">{attachment.fileSizeFormatted}</span>
          </div>

          <p className="mt-0.5 text-xs text-slate-500">
            Uploaded by {attachment.createdBy} · {getDateLabel(attachment.createdAt)}
          </p>

          {attachment.description ? (
            <p className="mt-1 text-xs italic text-slate-500">{attachment.description}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onDownload(attachment.id, attachment.originalName)}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </button>

        {canDelete ? (
          <button
            type="button"
            onClick={() => onDelete(attachment.id)}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        ) : null}
      </div>
    </article>
  );
};
