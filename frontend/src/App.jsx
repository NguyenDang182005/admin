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

const App = () => {
  return (
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
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;