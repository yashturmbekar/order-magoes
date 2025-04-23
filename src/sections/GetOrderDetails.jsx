// Create a new component for GetOrderDetails
import React, { useState, useEffect } from "react";
import { getOrderByPhone } from "../utils/api";
import Popup from "../utils/api";

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
  // Ensure sorting indicators are displayed for all columns on page load
  useEffect(() => {
    if (!sortConfig.key) {
      setSortConfig({ key: "orderId", direction: "asc" });
    }
  }, []);

  const handleGetOrders = async () => {
    const newErrors = {};
    if (!/^\d{10}$/.test(phoneForDetails)) {
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
      if (orders.data.length === 0) {
        setUserOrders([]); // Clear old orders from the UI
        setPopupMessage(
          "0 active orders found for this mobile number. Please use a different mobile number."
        );
        return;
      }
      setUserOrders(orders.data);
    } catch (err) {
      alert("Failed to fetch orders: " + err.message);
    }
  };

  const handleProceed = async () => {
    const message = `Hello, I want to order ${form.quantity} dozen(s) of Ratnagiri Hapus mangoes.\n\nName: ${form.name}\nPhone: ${form.phone}\nDelivery Location: ${form.location}`;
    const url = `https://wa.me/918830997757?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
    setPopupMessage(""); // Close the popup after proceeding
    await handleGetOrdersAfterPlacedOrder();
  };

  const handleCancel = async () => {
    setPopupMessage(""); // Close the popup
    await handleGetOrdersAfterPlacedOrder();
  };

  const handleGetOrdersAfterPlacedOrder = async () => {
    const phone = form.phone;
    if (!/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number to fetch your orders.");
      return;
    }

    try {
      const orders = await getOrderByPhone(phone);
      if (orders.data.length === 0) {
        setUserOrders([]); // Clear old orders from the UI
        setPopupMessage(
          "0 active orders found for this mobile number. Please use a different mobile number."
        );
        return;
      }
      setUserOrders(orders.data);
      setActiveSection("details"); // Navigate to the order details section
    } catch (err) {
      alert("Failed to fetch orders: " + err.message);
    }
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
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

          <div className="table-wrapper">
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
                  const getRowClass = () => {
                    if (
                      order.orderStatus === "delivered" &&
                      order.paymentStatus === "completed"
                    )
                      return "order-received-payment-completed";
                    if (order.orderStatus === "order_received")
                      return "order-received";
                    if (order.orderStatus === "in_progress")
                      return "in-progress";
                    if (order.orderStatus === "out_for_delivery")
                      return "out-for-delivery";
                    if (
                      order.orderStatus === "delivered" &&
                      order.paymentStatus !== "completed"
                    )
                      return "delivered";
                    return "";
                  };

                  const rowClass = getRowClass();

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
                      <td>{`${new Date(
                        order.createdAt
                      ).toLocaleDateString()} ${new Date(
                        order.createdAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`}</td>
                      <td>
                        {order.lastUpdatedAt &&
                        !isNaN(new Date(order.lastUpdatedAt).getTime())
                          ? `${new Date(
                              order.lastUpdatedAt
                            ).toLocaleDateString()} ${new Date(
                              order.lastUpdatedAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : "N/A"}
                      </td>
                      <td>
                        {(() => {
                          switch (order.orderStatus) {
                            case "order_received":
                              return "Order Received";
                            case "in_progress":
                              return "In Progress";
                            case "out_for_delivery":
                              return "Out for Delivery";
                            case "delivered":
                              return "Delivered Successfully";
                            default:
                              return "Unknown";
                          }
                        })()}
                      </td>
                      <td>
                        {(() => {
                          switch (order.paymentStatus) {
                            case "pending":
                              return "Payment Pending";
                            case "completed":
                              return "Payment Completed";
                            default:
                              return "Unknown";
                          }
                        })()}
                      </td>
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
