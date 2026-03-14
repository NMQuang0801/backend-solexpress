import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';

type LoadingContextType = {
  showLoading: () => void;
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const countRef = useRef(0);

  const showLoading = useCallback(() => {
    countRef.current += 1;
    setVisible(true);
  }, []);

  const hideLoading = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1);
    if (countRef.current === 0) {
      setVisible(false);
    }
  }, []);

  const value = useMemo(() => ({ showLoading, hideLoading }), [showLoading, hideLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {visible && (
        <div className="loading-overlay">
          <Spinner animation="border" variant="light" />
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
