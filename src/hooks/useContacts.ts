"use client";

import { useCallback, useEffect, useState } from "react";
import { contactService } from "@/services/contactService";
import type { Contact, ContactFilters, ContactListResponse } from "@/types/contact";
import { getApiMessage } from "@/lib/utils";

interface UseContactsResult {
  contacts: Contact[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  counts: {
    all: number;
    people: number;
    companies: number;
  };
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseContactsParams {
  page: number;
  size: number;
  search?: string;
  country?: string;
  industry?: string;
  type?: "PERSON" | "COMPANY";
}

const getPageNumber = (page: ContactListResponse, fallback: number) => {
  if (typeof page.currentPage === "number") {
    return page.currentPage;
  }

  if (typeof page.page === "number") {
    return page.page;
  }

  return fallback;
};

export const useContacts = ({
  page,
  size,
  search,
  country,
  industry,
  type,
}: UseContactsParams): UseContactsResult => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currentPage, setCurrentPage] = useState(page);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [counts, setCounts] = useState({ all: 0, people: 0, companies: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    const sharedFilters: ContactFilters = {
      search: search?.trim() || undefined,
      country: country || undefined,
      industry: industry || undefined,
    };

    try {
      setLoading(true);
      setError(null);

      const [listResult, allResult, peopleResult, companiesResult] = await Promise.all([
        contactService.getAll({
          ...sharedFilters,
          type,
          page,
          size,
        }),
        contactService.getAll({
          ...sharedFilters,
          page: 0,
          size: 1,
        }),
        contactService.getAll({
          ...sharedFilters,
          type: "PERSON",
          page: 0,
          size: 1,
        }),
        contactService.getAll({
          ...sharedFilters,
          type: "COMPANY",
          page: 0,
          size: 1,
        }),
      ]);

      setContacts(listResult.content ?? []);
      setCurrentPage(getPageNumber(listResult, page));
      setTotalPages(listResult.totalPages ?? 0);
      setTotalElements(listResult.totalElements ?? 0);
      setCounts({
        all: allResult.totalElements ?? 0,
        people: peopleResult.totalElements ?? 0,
        companies: companiesResult.totalElements ?? 0,
      });
    } catch (err) {
      setError(getApiMessage(err, "Failed to load contacts"));
    } finally {
      setLoading(false);
    }
  }, [country, industry, page, search, size, type]);

  useEffect(() => {
    void fetchContacts();
  }, [fetchContacts]);

  return {
    contacts,
    currentPage,
    totalPages,
    totalElements,
    counts,
    loading,
    error,
    refetch: fetchContacts,
  };
};
