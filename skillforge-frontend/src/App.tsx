import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { store, useAppSelector, useAppDispatch } from './store/store';
import { lightTheme, darkTheme } from './styles/theme';
import { fetchCurrentUser } from './features/auth';
import { Header, Sidebar, ErrorBoundary, Loading } from './components/common';
import { AppRoutes } from './routes';

// Layout wrapper that uses Redux state
const AppLayout: React.FC<{ children: React.ReactNode; darkMode: boolean; onToggleTheme: () => void }> = ({
  children,
  darkMode,
  onToggleTheme,
}) => {
  const { isAuthenticated, loading, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  // Fetch current user on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  if (loading) {
    return <Loading variant="page" message="Loading..." />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {isAuthenticated && user && (
        <>
          <Header darkMode={darkMode} onToggleTheme={onToggleTheme} onToggleSidebar={handleToggleSidebar} />
          <Sidebar open={sidebarOpen} onClose={handleCloseSidebar} />
        </>
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: isAuthenticated && user ? '88px' : 0,
          px: isAuthenticated && user ? { xs: 2, sm: 3, md: 3 } : 0,
          pb: isAuthenticated && user ? '24px' : 0,
          minHeight: '100vh',
          backgroundColor: 'background.default',
          transition: 'padding 0.3s ease-in-out',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

// Main App with theme toggle
const AppContent: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  const handleToggleTheme = () => {
    setDarkMode((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newValue));
      return newValue;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <BrowserRouter>
          <AppLayout darkMode={darkMode} onToggleTheme={handleToggleTheme}>
            <AppRoutes />
          </AppLayout>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

// Root App with Redux Provider
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
