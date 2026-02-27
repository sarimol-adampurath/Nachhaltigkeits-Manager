import apiClient from "./client";
import type {ActivityLog} from "../types/emission";  

export const emissionService = {
    // get all the logs from backend
  getLogs:async (): Promise<ActivityLog[]> => {
    const response = await apiClient.get<ActivityLog[]>('logs/');
    return response.data;
  },
};