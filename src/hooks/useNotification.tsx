import React, { createContext, useContext, useState, useCallback } from "react";
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
