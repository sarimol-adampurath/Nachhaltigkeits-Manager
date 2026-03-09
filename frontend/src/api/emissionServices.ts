import apiClient from "./client";
import type {ActivityLog, PaginatedResponse} from "../types/emission";  

export const emissionService = {
  // get paginated logs from backend (optionally filtered by date range)
  getLogs: async (startDate?: string, endDate?: string, page?: number): Promise<PaginatedResponse<ActivityLog>> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (page) params.append('page', page.toString());
    
    const url = params.toString() ? `logs/?${params.toString()}` : 'logs/';
    const response = await apiClient.get<PaginatedResponse<ActivityLog>>(url);
    return response.data;
  },

  // get all logs (fetch all pages) - for exports and charts
  getAllLogs: async (startDate?: string, endDate?: string): Promise<ActivityLog[]> => {
    let allLogs: ActivityLog[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await emissionService.getLogs(startDate, endDate, page);
      allLogs = [...allLogs, ...response.results];
      hasMore = response.next !== null;
      page++;
    }

    return allLogs;
  },

  // delete a log by id
  deleteLog: async (id: number): Promise<void> => {
    await apiClient.delete(`logs/${id}/`); 
    // Axios throws automatically if status is not 2xx, no need for manual 'if (!ok)'
  },

  // create a new log
  createLog: async (data: { date: string; category: number; quantity: number; note?: string }): Promise<ActivityLog> => {
    const response = await apiClient.post<ActivityLog>('logs/', data);
    return response.data;
  },

  // get all emission factors
  getFactors: async () => {
    const response = await apiClient.get('factors/');
    const payload = response.data;

    // Backward/forward compatible: handle both plain arrays and paginated payloads.
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload && Array.isArray(payload.results)) {
      return payload.results;
    }
    return [];
  },
};