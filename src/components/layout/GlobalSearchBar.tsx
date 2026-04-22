"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  Briefcase,
  CalendarCheck2,
  Loader2,
  Search,
  Target,
  Users,
  Users2,
  UserSquare2,
} from "lucide-react";
import { globalSearchService } from "@/services/globalSearchService";
import type { GlobalSearchGroup, GlobalSearchItem } from "@/types/globalSearch";
import type { User } from "@/types/user";

interface GlobalSearchBarProps {
  currentUser?: User | null;
}

const iconMap = {
  user: UserSquare2,
  contact: Users2,
  lead: Target,
  opportunity: Briefcase,
  team: Users,
  activity: CalendarCheck2,
} as const;

const flattenItems = (groups: { items: GlobalSearchItem[] }[]) => groups.flatMap((group) => group.items);

export const GlobalSearchBar = ({ currentUser }: GlobalSearchBarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<GlobalSearchGroup[]>([]);

  const allItems = useMemo(() => flattenItems(groups), [groups]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setGroups([]);
      setError(null);
      setLoading(false);
      return;
    }

    let isActive = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);

      globalSearchService
        .search({ query: trimmed, currentUser, limitPerGroup: 5 })
        .then((result) => {
          if (!isActive) {
            return;
          }
          setGroups(result.groups);
        })
        .catch(() => {
          if (!isActive) {
            return;
          }
          setGroups([]);
          setError("Failed to search. Please try again.");
        })
        .finally(() => {
          if (isActive) {
            setLoading(false);
          }
        });

    }, 300);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [query, currentUser]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "Enter" && allItems.length > 0) {
      router.push(allItems[0].href);
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative max-w-[520px] flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search users, contacts, leads, opportunities..."
        className="h-10 w-full rounded-lg border border-slate-200 bg-[#F9FAFB] pl-10 pr-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] transition focus:ring-2"
      />

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          {query.trim().length < 2 ? (
            <p className="px-3 py-2 text-xs text-slate-500">Type at least 2 characters to search.</p>
          ) : loading ? (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Searching...
            </div>
          ) : error ? (
            <p className="px-3 py-2 text-xs text-red-600">{error}</p>
          ) : groups.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-500">No results found.</p>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => (
                <div key={group.key} className="rounded-lg border border-slate-100">
                  <p className="bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {group.label}
                  </p>
                  <ul>
                    {group.items.map((item) => {
                      const ItemIcon = iconMap[item.type];

                      return (
                        <li key={`${item.type}-${item.id}`}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="flex items-start gap-2.5 px-3 py-2 text-sm text-slate-700 transition hover:bg-[#F6F3FF]"
                          >
                            <ItemIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#8B6FD0]" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-800">{item.title}</p>
                              {item.subtitle ? (
                                <p className="truncate text-xs text-slate-500">{item.subtitle}</p>
                              ) : null}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
