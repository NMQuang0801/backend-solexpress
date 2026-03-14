import { AxiosError } from 'axios';

export interface ApiResponse<T = unknown> {
  status: number;
  messages: string | null;
  errorMessages: string[] | null;
  data: T | null;
}

export function getErrorMessages(
  error: unknown,
  fallback = 'Có lỗi xảy ra, vui lòng thử lại'
): string[] {
  const axiosErr = error as AxiosError<ApiResponse>;
  const msgs = axiosErr?.response?.data?.errorMessages;
  if (Array.isArray(msgs) && msgs.length > 0) return msgs;
  return [fallback];
}
