import apiClient from "./client";
import type {ActivityLog} from "../types/emission";  

export const emissionService = {
    // get all the logs from backend
  getLogs:async (): Promise<ActivityLog[]> => {
    const response = await apiClient.get<ActivityLog[]>('logs/');
    return response.data;
  },

  // delete a log by id
  deleteLog: async (id: number) => {
  const response = await fetch(`http://127.0.0.1:8000/api/logs/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error("Delete failed");
  return true;
},
};