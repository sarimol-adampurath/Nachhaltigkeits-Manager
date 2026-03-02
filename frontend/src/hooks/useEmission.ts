import { useEffect, useState } from "react";
import type { ActivityLog } from "../types/emission";
import { emissionService } from "../api/emissionServices";

export const useEmission = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await emissionService.getLogs();
      setLogs(data);
    } catch (err) {
      setError("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (id: number) => {
    const previousLogs = [...logs];
    // Optimistic Update: Remove from UI immediately
    setLogs(logs.filter((log) => log.id !== id));

    try {
      await emissionService.deleteLog(id);
    } catch (err) {
      setError("Failed to delete item");
      setLogs(previousLogs); // Rollback on failure
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  return { logs, loading, error, fetchData, deleteLog  };
};