import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Use Routes instead of Switch
import LandingPage from './LandingPage';
import AdminLogin from './AdminLogin';
import AdminOrders from './AdminOrders';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} /> {/* For home/landing page */}
        <Route path="/admin/login" element={<AdminLogin />} /> {/* Admin login page */}
        <Route path="/admin/orders" element={<AdminOrders />} /> {/* Admin orders page */}
      </Routes>
    </Router>
  );
}
