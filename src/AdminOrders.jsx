import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllOrders,
  updateOrder,
  cancelOrder,
  activateOrder,
  getDeliveryStatistics,
} from "./utils/api";
import Popup from "./utils/Popup";
import Odometer from "react-odometerjs";

function Statistics({ statistics }) {
  const [dozensDelivered, setDozensDelivered] = useState(0);
  const [paymentsCompleted, setPaymentsCompleted] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [deliveryPending, setDeliveryPending] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDozensDelivered(statistics.totalDozensDelivered);
      setPaymentsCompleted(statistics.totalPaymentsCompleted);
      setPendingPayments(statistics.totalDeliveredWithPendingPayment);
      setDeliveryPending(
        parseInt(statistics.totalDozensOutForDelivery || 0) +
          parseInt(statistics.totalDozensInProgress || 0) +
          parseInt(statistics.totalDozensOrderReceived || 0)
      );
    }, 1500); // Increased delay for slower animation effect

    return () => clearTimeout(timer);
  }, [statistics]);

  return (
  <div className="statistics-container-admin">
    <h2>Delivery Statistics</h2>
    <div className="statistics-row-admin">
      <div className="stat-item-admin">
        <p>Total Dozens Delivered</p>
        <Odometer value={dozensDelivered} format="(,ddd)" theme="default" />
      </div>
      <div className="stat-item-admin">
        <p>Pending Deliveries (Dozens)</p>
        <Odometer value={deliveryPending} format="(,ddd)" theme="default" />
      </div>
      <div className="stat-item-admin">
        <p>Total Orders with Completed Payments</p>
        <Odometer value={paymentsCompleted} format="(,ddd)" theme="default" />
      </div>
      <div className="stat-item-admin">
        <p>Orders Delivered but Awaiting Payment</p>
        <Odometer value={pendingPayments} format="(,ddd)" theme="default" />
      </div>
    </div>
  </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popupMessage, setPopupMessage] = useState(null);
  const [confirmation, setConfirmation] = useState({
    show: false,
    onConfirm: null,
  });
  const [statistics, setStatistics] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const ordersData = await getAllOrders(token);
        setOrders(ordersData.data);
      } catch (err) {
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const statsData = await getDeliveryStatistics(token);
        setStatistics(statsData.data);
      } catch (err) {
        console.error("Failed to fetch statistics", err);
      }
    };

    fetchStatistics();
  }, []);

  const handleUpdate = async (orderId, updatedFields) => {
    try {
      const token = localStorage.getItem("accessToken");
      const updatedOrder = await updateOrder(orderId, updatedFields, token);
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
        setPopupMessage("Order updated successfully");
      } else {
        setPopupMessage("Failed to retrieve updated date from the server.");
      }
    } catch (err) {
      setPopupMessage("Failed to update order");
    }
  };

  const handleCancel = async (orderId) => {
    setConfirmation({
      show: true,
      onConfirm: async () => {
        const token = localStorage.getItem("accessToken");
        try {
          await cancelOrder(orderId, token);
          setPopupMessage("Order cancelled successfully");
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === orderId
                ? {
                    ...order,
                    isActive: false,
                    lastUpdatedAt: new Date().toISOString(),
                  }
                : order
            )
          );
        } catch (err) {
          setPopupMessage("Failed to cancel order");
        } finally {
          setConfirmation({ show: false, onConfirm: null });
        }
      },
    });
  };

  const handleActivate = async (orderId) => {
    const token = localStorage.getItem("accessToken");
    try {
      await activateOrder(orderId, token);
      setPopupMessage("Order reactivated successfully");
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                isActive: true,
                lastUpdatedAt: new Date().toISOString(),
              }
            : order
        )
      );
    } catch (err) {
      setPopupMessage("Failed to activate order");
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...orders];
    updated[index][field] = value;
    setOrders(updated);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    navigate("/admin/login");
  };

  return (
    <div className="page">
      {popupMessage && (
        <Popup message={popupMessage} onClose={() => setPopupMessage(null)} />
      )}

      {confirmation.show && (
        <Popup
          message="Are you sure you want to cancel this order?"
          hideCloseButton={true}
          onClose={() => setConfirmation({ show: false, onConfirm: null })}
        >
          <button onClick={confirmation.onConfirm}>Yes</button>
          <button
            className="cancel-btn"
            onClick={() => setConfirmation({ show: false, onConfirm: null })}
          >
            No
          </button>
        </Popup>
      )}

      <div className="logout-container">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="overlay">
        <div className="hero">
          <p className="tagline">Admin Dashboard</p>
          <h1
            onClick={() => (window.location.href = "/")}
            style={{ cursor: "pointer" }}
          >
            Mangoes <span className="highlight">At</span>
            <br />
            <span className="highlight">Your Doorstep</span>
          </h1>
          <p className="subtitle">Manage Orders</p>
        </div>

        {/* Moved the statistics section below the hero subtitle */}
        <div className="statistics-wrapper">
          {statistics && <Statistics statistics={statistics} />}
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
                                  Update order
                                </button>
                                <button
                                  className="cancel-btn"
                                  onClick={() => handleCancel(order.id)}
                                >
                                  Cancel order
                                </button>
                              </>
                            ) : (
                              <button
                                className="activate-btn"
                                onClick={() => handleActivate(order.id)}
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
