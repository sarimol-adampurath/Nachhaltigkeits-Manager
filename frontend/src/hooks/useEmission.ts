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
  useEffect(() => {
    fetchData();
  }, []);

  return { logs, loading, error, fetchData };
};