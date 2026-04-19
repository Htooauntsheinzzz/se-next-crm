import { Sparkles } from "lucide-react";

interface LeadScoreBadgeProps {
  score: number;
}

const scoreClass = (score: number) => {
  if (score >= 80) {
    return "bg-green-100 text-green-700";
  }

  if (score >= 50) {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-100 text-slate-700";
};

export const LeadScoreBadge = ({ score }: LeadScoreBadgeProps) => {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${scoreClass(score)}`}>
      <Sparkles className="h-3 w-3" />
      {score}
    </span>
  );
};
