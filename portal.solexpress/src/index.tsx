import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AlertProvider, LoadingProvider } from '@/contexts';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LoadingProvider>
        <AlertProvider>
          <App />
        </AlertProvider>
      </LoadingProvider>
    </BrowserRouter>
  </React.StrictMode>
);
