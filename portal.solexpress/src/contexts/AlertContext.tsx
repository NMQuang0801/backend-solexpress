import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

type AlertType = 'success' | 'error';

type AlertItem = {
  id: number;
  type: AlertType;
  messages: string[];
};

type AlertContextType = {
  showAlert: (type: AlertType, messages: string | string[]) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

let nextId = 0;

const VARIANT_MAP: Record<AlertType, string> = {
  success: 'success',
  error: 'danger',
};

const ICON_MAP: Record<AlertType, string> = {
  success: 'bi-check-circle-fill',
  error: 'bi-exclamation-triangle-fill',
};

const TITLE_MAP: Record<AlertType, string> = {
  success: 'Thành công',
  error: 'Lỗi',
};

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const showAlert = useCallback((type: AlertType, messages: string | string[]) => {
    const id = ++nextId;
    const msgs = Array.isArray(messages) ? messages : [messages];
    setAlerts((prev) => [...prev, { id, type, messages: msgs }]);
  }, []);

  const removeAlert = useCallback((id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const value = useMemo(() => ({ showAlert }), [showAlert]);

  return (
    <AlertContext.Provider value={value}>
      {children}
      <ToastContainer position="top-end" className="global-toast-container p-3">
        {alerts.map((alert) => (
          <Toast
            key={alert.id}
            bg={VARIANT_MAP[alert.type]}
            onClose={() => removeAlert(alert.id)}
            autohide
            delay={alert.type === 'error' ? 6000 : 4000}
          >
            <Toast.Header>
              <i className={`bi ${ICON_MAP[alert.type]} me-2`} />
              <strong className="me-auto">{TITLE_MAP[alert.type]}</strong>
            </Toast.Header>
            <Toast.Body className={alert.type === 'error' ? 'text-white' : ''}>
              {alert.messages.map((msg, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <br />}
                  {msg}
                </React.Fragment>
              ))}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
