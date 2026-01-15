import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import MapSearch from './pages/MapSearch';
import StandForm from './pages/StandForm';
import AdminButtons from './pages/AdminButtons';
import AdminPopupMessages from './pages/AdminPopupMessages';
import Login from './pages/Login';
import Register from './pages/Register';
import './assets/css/common.css';

// 보호된 라우트 컴포넌트
function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname === '/map';

  return (
    <div className="App">
      <Header />
      <Routes>
        {/* 공개 경로 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 보호된 경로 */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/map" element={
          <ProtectedRoute>
            <MapSearch />
          </ProtectedRoute>
        } />
        <Route path="/stands/new" element={
          <ProtectedRoute>
            <StandForm />
          </ProtectedRoute>
        } />

        {/* 관리자 전용 경로 */}
        <Route path="/admin/buttons" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminButtons />
          </ProtectedRoute>
        } />
        <Route path="/admin/popup-messages" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPopupMessages />
          </ProtectedRoute>
        } />
      </Routes>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
