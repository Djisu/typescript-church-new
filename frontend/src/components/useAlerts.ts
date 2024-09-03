import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const useAlerts = () => {
  const [alerts, setAlerts] = useState<
    { id: string; type: 'success' | 'error' | 'warning'; message: string; timeout: number | null }[]
  >([]);

  useEffect(() => {
    const timers: { [key: string]: ReturnType<typeof setTimeout> } = {};

    alerts.forEach((alert) => {
      if (alert.timeout !== null) {
        timers[alert.id] = setTimeout(() => {
          setAlerts((prevAlerts) => prevAlerts.filter((a) => a.id !== alert.id));
        }, alert.timeout);
      }
    });

    return () => {
      Object.values(timers).forEach((timer) => clearTimeout(timer));
    };
  }, [alerts, setAlerts]);

  const addAlert = (type: 'success' | 'error' | 'warning', message: string, timeout: number | null = 5000) => {
    const id =  uuidv4();
    setAlerts((prevAlerts) => [...prevAlerts, { id, type, message, timeout }]);
  };

  return { alerts, addAlert };
};

export default useAlerts;