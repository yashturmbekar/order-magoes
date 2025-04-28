import React from "react";
import ReactDOM from "react-dom/client"; // ✅ Updated import
import AppRouter from "./routes/AppRouter";
import "./styles/style.css";

const root = ReactDOM.createRoot(document.getElementById("root")); // ✅ React 18 method
root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
