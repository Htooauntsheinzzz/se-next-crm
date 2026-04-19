import { MoreVertical, Pencil, UserX, UserPlus, Crown, Eye } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { SalesTeam } from "@/types/team";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { canEditTeam, canDeleteTeam, canManageMembers } from "@/lib/auth/rbac";

interface TeamCardActionsProps {
  team: SalesTeam;
  onEdit: (team: SalesTeam) => void;
  onDelete: (team: SalesTeam) => void;
  onAddMember: (team: SalesTeam) => void;
  onChangeLeader: (team: SalesTeam) => void;
}

export const TeamCardActions = ({
  team,
  onEdit,
  onDelete,
  onAddMember,
  onChangeLeader,
}: TeamCardActionsProps) => {
  const { currentUser } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const editAllowed = canEditTeam(currentUser);
  const deleteAllowed = canDeleteTeam(currentUser);
  const manageMembersAllowed = canManageMembers(currentUser, team);
  // Change leader is admin only, same as editTeam
  const changeLeaderAllowed = canEditTeam(currentUser);

  useEffect(() => {
    if (!open || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY + 4,
      left: rect.right - 180, // roughly menu width
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const renderButton = (
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    allowed: boolean,
    danger = false
  ) => {
    return (
      <button
        type="button"
        disabled={!allowed}
        onClick={() => {
          if (!allowed) return;
          setOpen(false);
          onClick();
        }}
        title={!allowed ? "You don't have permission to do this." : undefined}
        className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium transition ${
          allowed
            ? danger
              ? "text-red-500 hover:bg-red-50"
              : "text-slate-700 hover:bg-slate-50"
            : "text-slate-400 cursor-not-allowed"
        }`}
      >
        {icon}
        {label}
      </button>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen((prev) => !prev);
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: menuPosition?.top ?? 0,
                left: menuPosition?.left ?? 0,
              }}
              className="z-[80] min-w-[180px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg"
            >
              <Link
                href={`/teams/${team.id}`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-4 w-4" />
                View details
              </Link>

              {renderButton("Edit team", <Pencil className="h-4 w-4" />, () => onEdit(team), editAllowed)}
              {renderButton("Change leader", <Crown className="h-4 w-4" />, () => onChangeLeader(team), changeLeaderAllowed)}
              {renderButton("Add member", <UserPlus className="h-4 w-4" />, () => onAddMember(team), manageMembersAllowed)}
              {renderButton("Delete team", <UserX className="h-4 w-4" />, () => onDelete(team), deleteAllowed, true)}
            </div>,
            document.body
          )
        : null}
    </div>
  );
};
