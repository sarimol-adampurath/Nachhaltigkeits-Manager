import apiClient from "./client";
import type {ActivityLog} from "../types/emission";  

export const emissionService = {
    // get all the logs from backend (optionally filtered by date range)
  getLogs:async (startDate?: string, endDate?: string): Promise<ActivityLog[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const url = params.toString() ? `logs/?${params.toString()}` : 'logs/';
    const response = await apiClient.get<ActivityLog[]>(url);
    return response.data;
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
    return response.data;
  },
};