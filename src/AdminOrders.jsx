import React, { useState, useEffect } from "react";
import {
  getAllOrders,
  updateOrder,
  cancelOrder,
  activateOrder,
} from "./utils/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const ordersData = await getAllOrders(token);
        setOrders(ordersData);
      } catch (err) {
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleUpdate = async (orderId, updatedFields) => {
    try {
      const token = localStorage.getItem("adminToken");
      const updatedOrder = await updateOrder(orderId, updatedFields, token);
      console.log("Updated Order:", updatedOrder); // Log the updated order for debugging
      if (updatedOrder && updatedOrder.lastUpdatedAt) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  ...updatedFields,
                  lastUpdatedAt: updatedOrder.lastUpdatedAt,
                }
              : order
          )
        );
      } else {
        alert("Failed to retrieve updated date from the server.");
      }
    } catch (err) {
      alert("Failed to update order");
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...orders];
    updated[index][field] = value;
    setOrders(updated);
  };

  return (
    <div className="page">
      <div className="overlay">
        <div className="hero">
          <p className="tagline">Admin Dashboard</p>
          <h1>
            Mangoes <span className="highlight">At</span>
            <br />
            <span className="highlight">Your Doorstep</span>
          </h1>
          <p className="subtitle">Manage Orders</p>
        </div>

        <div className="form-card">
          <h2>All Orders</h2>

          {loading && <p>Loading orders...</p>}
          {error && <div className="error">{error}</div>}

          {!loading && !error && (
            <div className="table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Order Id</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Qty</th>
                    <th>Delivery Location</th>
                    <th>Order Date</th>
                    <th>Last Updated</th>
                    <th>Order Status</th>
                    <th>Payment Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => {
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
                          order.isActive === false ? "inactive" : ""
                        }`}
                      >
                        <td>{index + 1}</td>
                        <td>{order.orderId}</td>
                        <td>{order.name}</td>
                        <td>{order.phone}</td>
                        <td>{order.quantity}</td>
                        <td>{order.location}</td>
                        <td>{`${new Date(
                          order.created_at
                        ).toLocaleDateString()} ${new Date(
                          order.created_at
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
                          <select
                            value={order.orderStatus || "order_received"}
                            onChange={(e) => {
                              handleChange(
                                index,
                                "orderStatus",
                                e.target.value
                              );
                            }}
                            disabled={!order.isActive}
                          >
                            <option value="order_received">
                              Order Received
                            </option>
                            <option value="in_progress">In Progress</option>
                            <option value="out_for_delivery">
                              Out for Delivery
                            </option>
                            <option value="delivered">
                              Delivered Successfully
                            </option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={order.paymentStatus || "pending"}
                            onChange={(e) =>
                              handleChange(
                                index,
                                "paymentStatus",
                                e.target.value
                              )
                            }
                            disabled={!order.isActive}
                          >
                            <option value="pending">Payment Pending</option>
                            <option value="completed">Payment Completed</option>
                          </select>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {order.isActive ? (
                              <>
                                <button
                                  className="update-btn"
                                  onClick={() =>
                                    handleUpdate(order.id, {
                                      orderStatus: order.orderStatus,
                                      paymentStatus: order.paymentStatus,
                                    })
                                  }
                                >
                                  Update
                                </button>
                                <button
                                  className="cancel-btn"
                                  onClick={async () => {
                                    const token =
                                      localStorage.getItem("adminToken");
                                    if (
                                      window.confirm(
                                        "Are you sure you want to cancel this order?"
                                      )
                                    ) {
                                      try {
                                        await cancelOrder(order.id, token);
                                        alert("Order cancelled successfully");
                                        setOrders((prev) =>
                                          prev.map((o) =>
                                            o.id === order.id
                                              ? { ...o, isActive: false }
                                              : o
                                          )
                                        );
                                      } catch (err) {
                                        alert("Failed to cancel order");
                                      }
                                    }
                                  }}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                className="activate-btn"
                                onClick={async () => {
                                  const token =
                                    localStorage.getItem("adminToken");
                                  try {
                                    await activateOrder(order.id, token);
                                    alert("Order reactivated successfully");
                                    setOrders((prev) =>
                                      prev.map((o) =>
                                        o.id === order.id
                                          ? { ...o, isActive: true }
                                          : o
                                      )
                                    );
                                  } catch (err) {
                                    alert("Failed to activate order");
                                  }
                                }}
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <footer className="footer">
        <h4>Admin Access</h4>
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
        </div>
        <p className="footer-note">
          © 2025 Mangoes At Your Doorstep | Admin Panel
        </p>
      </footer>
    </div>
  );
}
