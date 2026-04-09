"use client";

import { useCallback, useEffect, useState } from "react";
import { chatterService } from "@/services/chatterService";
import { getApiMessage } from "@/lib/utils";
import type { ChatterMessage } from "@/types/chatter";

interface UseChatterOptions {
  enabled?: boolean;
  refreshIntervalMs?: number;
}

interface UseChatterResult {
  messages: ChatterMessage[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useChatter = (
  entityType: "opportunity" | "lead",
  entityId: number,
  options: UseChatterOptions = {},
): UseChatterResult => {
  const { enabled = true, refreshIntervalMs = 30000 } = options;
  const [messages, setMessages] = useState<ChatterMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!enabled || !entityId) {
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response =
        entityType === "opportunity"
          ? await chatterService.getForOpportunity(entityId)
          : await chatterService.getForLead(entityId);

      const sorted = [...response].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setMessages(sorted);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load chatter"));
    } finally {
      setLoading(false);
    }
  }, [enabled, entityId, entityType]);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!enabled || !refreshIntervalMs || refreshIntervalMs <= 0) {
      return;
    }

    const timer = setInterval(() => {
      void fetchMessages();
    }, refreshIntervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [enabled, fetchMessages, refreshIntervalMs]);

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
  };
};
