import { decodeJwt } from "jose"; // ✅ Replaces jwt-decode
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LandingPage from "./LandingPage";
import AdminLogin from "./AdminLogin";
import AdminOrders from "./AdminOrders";

function PrivateRoute({ children, requiredRole }) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ new

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = decodeJwt(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error("Failed to decode token", error);
      }
    }
    setLoading(false); // ✅ mark as loaded regardless
  }, []);

  if (loading) return <div>Loading...</div>; // ⏳ Wait before checking anything

  if (!userRole) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
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
            <PrivateRoute requiredRole="admin">
              <AdminOrders />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
