import React from "react";
import { useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  const getSubtitle = () => {
    switch (location.pathname) {
      case "/admin/orders":
        return "Manage Orders";
      case "/admin/login":
        return "Admin Panel";
      case "/":
        return "Anywhere in Pune, Excluding Muslims";
      default:
        return "";
    }
  };

  const getTagline = () => {
    if (location.pathname === "/admin/orders") {
      return "Admin Dashboard";
    }
    return "यह बात सिर्फ आम ही नहीं, काम की भी है";
  };

  return (
    <header>
      <div className="hero">
        <p className="tagline">{getTagline()}</p>
        <h1
          onClick={() => (window.location.href = "/")}
          style={{ cursor: "pointer" }}
        >
          Mangoes <span className="highlight">At</span>
          <br />
          <span className="highlight">Your Doorstep</span>
        </h1>
        <p className="subtitle">{getSubtitle()}</p>
      </div>
    </header>
  );
};

export default Header;
