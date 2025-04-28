// Create a new component for GetOrderDetails
import React, { useState, useEffect } from "react";
import { getOrderByPhone } from "../utils/api";
import {
  validatePhoneNumber,
  formatOrderDate,
  getOrderRowClass,
  getOrderStatusText,
  getPaymentStatusText,
  storeTokens,
} from "../utils/helpers";

export default function GetOrderDetails({
  phoneForDetails,
  setPhoneForDetails,
  userOrders,
  setUserOrders,
  errors,
  setErrors,
  searchTerm,
  setSearchTerm,
  sortConfig,
  setSortConfig,
  handleSort,
  sortedAndFilteredOrders,
  setPopupMessage,
}) {
  useEffect(() => {
    if (!sortConfig.key) {
      setSortConfig({ key: "Id", direction: "asc" });
    }
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleGetOrders = async () => {
    const newErrors = {};
    if (!validatePhoneNumber(phoneForDetails)) {
      setUserOrders([]); // Clear old orders from the UI
      newErrors.phoneForGetOrderDetails =
        "Please enter a valid 10-digit number used to place your order.";
      setErrors(newErrors);
      return;
    } else {
      setErrors({});
    }
    try {
      const orders = await getOrderByPhone(phoneForDetails);
      if (orders.data.orderDetails.length === 0) {
        setUserOrders([]); // Clear old orders from the UI
        setPopupMessage(
          "0 active orders found for this mobile number. Please use a different mobile number."
        );
        return;
      } else {
        storeTokens(orders.data.access_token, orders.data.refresh_token);
        setUserOrders(orders.data.orderDetails);
      }
    } catch (err) {
      alert("Failed to fetch orders: " + err.message);
    }
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? "▲" : "▼";
    }
    return "▲▼"; // Default indicator for unsorted columns
  };

  return (
    <div className="form-card">
      <h2>Get Order Details</h2>
      <input
        placeholder="Enter Your Mobile Number Used To Place Your Order"
        value={phoneForDetails}
        onChange={(e) => {
          if (/^\d{0,10}$/.test(e.target.value)) {
            setPhoneForDetails(e.target.value);
          }
        }}
      />
      {errors.phoneForGetOrderDetails && (
        <div className="error">{errors.phoneForGetOrderDetails}</div>
      )}
      <button onClick={handleGetOrders}>Get Order Details</button>

      {userOrders && userOrders.length > 0 && (
        <>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />

          <div className="table-wrapper" style={{ background: "#fff8dc" }}>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th onClick={() => handleSort("orderId")}>
                    Order Id {getSortIndicator("orderId")}
                  </th>
                  <th onClick={() => handleSort("name")}>
                    Name {getSortIndicator("name")}
                  </th>
                  <th onClick={() => handleSort("phone")}>
                    Phone {getSortIndicator("phone")}
                  </th>
                  <th onClick={() => handleSort("quantity")}>
                    Qty {getSortIndicator("quantity")}
                  </th>
                  <th onClick={() => handleSort("location")}>
                    Delivery Location {getSortIndicator("location")}
                  </th>
                  <th onClick={() => handleSort("createdAt")}>
                    Order Date {getSortIndicator("createdAt")}
                  </th>
                  <th onClick={() => handleSort("lastUpdatedAt")}>
                    Last Updated {getSortIndicator("lastUpdatedAt")}
                  </th>
                  <th onClick={() => handleSort("orderStatus")}>
                    Order Status {getSortIndicator("orderStatus")}
                  </th>
                  <th onClick={() => handleSort("paymentStatus")}>
                    Payment Status {getSortIndicator("paymentStatus")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredOrders.map((order, index) => {
                  const rowClass = getOrderRowClass(order);

                  return (
                    <tr
                      key={order.id}
                      className={`${rowClass} ${
                        order.isActive === false ? "inactive-row" : ""
                      }`}
                      style={{
                        backgroundColor:
                          order.isActive === false ? "#D3D3D3" : "", // Light gray
                        color: order.isActive === false ? "red" : "",
                      }}
                    >
                      <td>{index + 1}</td>
                      <td>{order.orderId}</td>
                      <td>{order.name}</td>
                      <td>{order.phone}</td>
                      <td>{order.quantity}</td>
                      <td>{order.location}</td>
                      <td>{formatOrderDate(order.createdAt)}</td>
                      <td>
                        {order.lastUpdatedAt &&
                        !isNaN(new Date(order.lastUpdatedAt).getTime())
                          ? formatOrderDate(order.lastUpdatedAt)
                          : "N/A"}
                      </td>
                      <td>{getOrderStatusText(order.orderStatus)}</td>
                      <td>{getPaymentStatusText(order.paymentStatus)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
