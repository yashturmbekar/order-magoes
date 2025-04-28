import React, { useEffect, useState } from "react";
import Odometer from "react-odometerjs";
import "odometer/themes/odometer-theme-default.css";

const Statistics = ({ statistics }) => {
  const [mangoesDelivered, setMangoesDelivered] = useState(0);
  const [ordersReceived, setOrdersReceived] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMangoesDelivered(statistics.totalMangoesDelivered);
      setOrdersReceived(statistics.totalOrdersReceived);
    }, 1500); // Increased delay for slower animation effect

    return () => clearTimeout(timer);
  }, [statistics]);

  return (
    <div className="statistics-container">
      <div
        className="stat-info"
        style={{ textAlign: "center", fontSize: "1.2rem", color: "#4e342e" }}
      >
        <Odometer value={mangoesDelivered} format="(,ddd)" theme="default" />
        <span> dozen of mangoes delivered to </span>

        <Odometer value={ordersReceived} format="(,ddd)" theme="default" />
        <span> + mango lovers.</span>
      </div>
    </div>
  );
};

export default Statistics;
