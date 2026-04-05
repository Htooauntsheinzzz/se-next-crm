"use client";

import { useCallback, useEffect, useState } from "react";
import { contactService } from "@/services/contactService";
import type { Contact, ContactHistoryDto } from "@/types/contact";
import { getApiMessage } from "@/lib/utils";

interface UseContactResult {
  contact: Contact | null;
  history: ContactHistoryDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useContact = (id: number | null): UseContactResult => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [history, setHistory] = useState<ContactHistoryDto | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const fetchContact = useCallback(async () => {
    if (!id) {
      setContact(null);
      setHistory(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [contactResponse, historyResponse] = await Promise.all([
        contactService.getById(id),
        contactService.getHistory(id),
      ]);

      setContact(contactResponse);
      setHistory(historyResponse);
    } catch (err) {
      setError(getApiMessage(err, "Failed to load contact"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchContact();
  }, [fetchContact]);

  return { contact, history, loading, error, refetch: fetchContact };
};
