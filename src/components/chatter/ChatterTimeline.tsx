import { MessageSquareText } from "lucide-react";
import { ChatterEntry } from "@/components/chatter/ChatterEntry";
import { ChatterSkeleton } from "@/components/chatter/ChatterSkeleton";
import type { ChatterMessage } from "@/types/chatter";

interface ChatterTimelineProps {
  messages: ChatterMessage[];
  loading: boolean;
  error: string | null;
}

export const ChatterTimeline = ({ messages, loading, error }: ChatterTimelineProps) => {
  if (loading) {
    return <ChatterSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
        <MessageSquareText className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-2 text-sm font-semibold text-slate-700">No messages yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Add a note or log an email to start tracking communications.
        </p>
      </div>
    );
  }

  return (
    <div>
      {messages.map((message, index) => (
        <ChatterEntry key={message.id} message={message} isLast={index === messages.length - 1} />
      ))}
    </div>
  );
};
