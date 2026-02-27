import { useEffect, useState } from "react";
import type{ ActivityLog } from "./types/emission";
import { emissionService } from "./api/emissionServices";

function App() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    emissionService.getLogs().then((data) => {
      setLogs(data);
      console.log("Fetched logs:", data);
    });
  }, []);

  return (
    <div className="App">
      <h1>Carbon Tracker</h1>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            {log.date} - {log.category_name}: {log.quantity} {log.note} (CO2: {log.co2_total})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;