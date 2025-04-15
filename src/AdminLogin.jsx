import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "./utils/api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await loginAdmin({ username, password });
      localStorage.setItem("adminToken", response.access_token);
      navigate("/admin/orders");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="page">
      <div className="overlay">
        <div className="hero">
          <p className="tagline">यह बात सिर्फ आम ही नहीं, काम की भी है!</p>
          <h1>
            Mangoes <span className="highlight">At</span>
            <br />
            <span className="highlight">Your Doorstep</span>
          </h1>
          <p className="subtitle">Admin Panel</p>
        </div>

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

        <div className="about-mangoes">
          <h3>Empowering Admins</h3>
          <p>
            🛠️ Secure login to access all incoming mango orders in real-time.
          </p>
          <p>
            📊 Track order trends, view details, and manage customer data with
            ease.
          </p>
          <p>
            ✅ Keep the delivery process smooth and professional for every mango
            lover in Pune.
          </p>
        </div>
      </div>

      <footer className="footer">
        <h4>Contact Support</h4>
        <div className="footer-details">
          <p>
            <strong>Yash Turmbekar</strong>
          </p>
          <p>
            📞 <a href="tel:+918237381312">+91 82373 81312</a>
          </p>
          <p>
            📧{" "}
            <a href="mailto:yashturmbkar7@gmail.com">yashturmbkar7@gmail.com</a>
          </p>
          <p>📍 Pune, Maharashtra</p>
        </div>
        <p className="footer-note">
          © 2025 Mangoes At Your Doorstep | Admin Panel
        </p>
      </footer>
    </div>
  );
}
