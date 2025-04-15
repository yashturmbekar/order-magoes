import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LandingPage from "./LandingPage";
import AdminLogin from "./AdminLogin";
import AdminOrders from "./AdminOrders";

function PrivateRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem("adminToken");
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

export default function AppRouter() {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/orders"
          element={
            <PrivateRoute>
              <AdminOrders />
            </PrivateRoute>
          }
        />

        {/* Optional fallback route (404 handling) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
