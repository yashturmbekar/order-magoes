import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "./utils/api";
import { storeTokens } from "./utils/helpers";
import Header from "./sections/Header";
import Footer from "./sections/Footer";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await loginAdmin({ username, password });
      storeTokens(response.access_token, response.refresh_token);
      navigate("/admin/orders");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div>
      <div className="page">
        <div className="overlay">
          <Header />

          <div className="form-card">
            <h2>Admin Login</h2>
            {error && <div className="error">{error}</div>}

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>Login</button>
            <div style={{ marginTop: "2rem" }}></div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
