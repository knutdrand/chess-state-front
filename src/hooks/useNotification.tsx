import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

interface Notification {
  message: string;
  severity: AlertColor;
}

interface NotificationContextType {
  notify: (message: string, severity?: AlertColor) => void;
  notifyError: (message: string) => void;
  notifySuccess: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notify: () => {},
  notifyError: () => {},
  notifySuccess: () => {},
});

// Module-level handle so non-React code (axios interceptors, the QueryClient)
// can raise notifications through the mounted NotificationProvider.
let globalNotify: ((message: string, severity?: AlertColor) => void) | null = null;

export function notifyGlobal(message: string, severity: AlertColor = "info") {
  if (globalNotify) {
    globalNotify(message, severity);
  } else {
    console.warn(`[notification] ${message}`);
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);

  const notify = useCallback((message: string, severity: AlertColor = "info") => {
    setNotification({ message, severity });
  }, []);

  const notifyError = useCallback((message: string) => {
    setNotification({ message, severity: "error" });
  }, []);

  const notifySuccess = useCallback((message: string) => {
    setNotification({ message, severity: "success" });
  }, []);

  useEffect(() => {
    globalNotify = notify;
    return () => {
      if (globalNotify === notify) globalNotify = null;
    };
  }, [notify]);

  const handleClose = () => setNotification(null);

  return (
    <NotificationContext.Provider value={{ notify, notifyError, notifySuccess }}>
      {children}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {notification ? (
          <Alert onClose={handleClose} severity={notification.severity} variant="filled" sx={{ width: "100%" }}>
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
