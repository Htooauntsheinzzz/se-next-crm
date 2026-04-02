export interface ApiResponse<T> {
  status: "success" | "error" | string;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  currentPage: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last?: boolean;
}
