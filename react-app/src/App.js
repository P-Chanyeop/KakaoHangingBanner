import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import MapSearch from './pages/MapSearch';
import StandForm from './pages/StandForm';
import AdminButtons from './pages/AdminButtons';
import './assets/css/common.css';

function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname === '/map';

  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapSearch />} />
        <Route path="/stands/new" element={<StandForm />} />
        <Route path="/admin/buttons" element={<AdminButtons />} />
      </Routes>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
}

export default App;
