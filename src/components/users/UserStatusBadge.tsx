interface UserStatusBadgeProps {
  active: boolean;
}

export const UserStatusBadge = ({ active }: UserStatusBadgeProps) => {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
      <span
        className={`h-2 w-2 rounded-full ${active ? "bg-green-500" : "bg-red-500"}`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
};
