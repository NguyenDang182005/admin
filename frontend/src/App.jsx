import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import Settings from './pages/Settings';
import Bookings from './pages/Bookings';
import Users from './pages/Users';
import DataManagement from './pages/DataManagement';
import { ConfigProvider } from 'antd';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const muiTheme = createTheme({
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  palette: {
    primary: {
      main: '#006ce4',
    },
    background: {
      default: '#f2f2f2',
    }
  },
  shape: {
    borderRadius: 8,
  }
});

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#006ce4',
          fontFamily: '"Inter", sans-serif',
          borderRadius: 8,
          controlHeight: 40, // Tăng size input mặc định
          colorBgContainer: '#ffffff',
        },
        components: {
          Button: {
            borderRadius: 12,
            controlHeight: 40,
            fontWeight: 600,
          },
          Input: {
            borderRadius: 12,
          },
          Select: {
            borderRadius: 12,
          },
          Menu: {
            darkItemBg: '#003580',
            darkItemSelectedBg: '#006ce4',
          },
          Table: {
            headerBg: '#ffffff',
            headerColor: '#1a1a1a',
            rowHoverBg: 'rgba(0, 108, 228, 0.05)',
            borderColor: '#e5e7eb',
          }
        }
      }}
    >
      <ThemeProvider theme={muiTheme}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/gallery" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Gallery />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Settings />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/bookings" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Bookings />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Users />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/data" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <DataManagement />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
};

export default App;