import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './core/theme';
import { AuthProvider } from './core/auth';
import { AppRouter } from './core/router';
import { queryClient } from './core/query';
import { ToastProvider } from './hooks';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import './styles/theme.css';

export const App: React.FC = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
