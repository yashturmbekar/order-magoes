import React, { useEffect, useState } from "react";
import { createOrder, getOrderByPhone } from "./utils/api";

export default function LandingPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    quantity: "",
    location: "",
  });
  const [errors, setErrors] = useState({});
  const [showAnimation, setShowAnimation] = useState(true);
  const [userOrders, setUserOrders] = useState([]);
  const [phoneForDetails, setPhoneForDetails] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!/^\d{10}$/.test(form.phone))
      newErrors.phone = "Enter a valid 10-digit WhatsApp number";
    const qty = parseInt(form.quantity);
    if (!qty || qty % 2 !== 0)
      newErrors.quantity = "Enter dozens in multiples of 2";
    if (!form.location.trim())
      newErrors.location = "Delivery location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const order = {
      name: form.name,
      phone: form.phone,
      quantity: parseInt(form.quantity),
      location: form.location,
      status: "New Order",
    };

    try {
      await createOrder(order);
      const message = `Hello, I want to order ${form.quantity} dozen(s) of Ratnagiri Hapus mangoes.\n\nName: ${form.name}\nPhone: ${form.phone}\nDelivery Location: ${form.location}`;
      const url = `https://wa.me/918830997757?text=${encodeURIComponent(
        message
      )}`;
      window.open(url, "_blank");
    } catch (err) {
      alert("Something went wrong: " + err.message);
    }
  };

  const handleGetOrders = async () => {
    try {
      const orders = await getOrderByPhone(phoneForDetails);
      setUserOrders(orders.data);
    } catch (err) {
      alert("Failed to fetch orders: " + err.message);
    }
  };

  return (
    <div className="page">
      {showAnimation && (
        <div className="falling-mangoes">
          {Array.from({ length: 50 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 4;
            const duration = 4 + Math.random() * 3;
            const size = 25 + Math.random() * 20;
            return (
              <img
                key={i}
                src="/mango-icon.png"
                className="mango"
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  animationFillMode: "forwards",
                  position: "absolute",
                }}
              />
            );
          })}
        </div>
      )}

      <div className="overlay">
        <div className="hero">
          <p className="tagline">यह बात सिर्फ आम ही नहीं, काम की भी है!</p>
          <h1>
            Mangoes <span className="highlight">At</span>
            <br />
            <span className="highlight">Your Doorstep</span>
          </h1>
          <p className="subtitle">Anywhere in Pune</p>
        </div>

        <div className="form-card">
          <h2>Order Ratnagiri Hapus Mangoes</h2>

          <input
            placeholder="Your Name"
            value={form.name}
            onChange={(e) =>
              /^[a-zA-Z\s]*$/.test(e.target.value) &&
              setForm({ ...form, name: e.target.value })
            }
          />
          {errors.name && <div className="error">{errors.name}</div>}

          <input
            placeholder="WhatsApp Phone Number"
            value={form.phone}
            onChange={(e) =>
              /^\d{0,10}$/.test(e.target.value) &&
              setForm({ ...form, phone: e.target.value })
            }
          />
          {errors.phone && <div className="error">{errors.phone}</div>}

          <input
            type="number"
            placeholder="Number of Dozens (multiple of 2)"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          {errors.quantity && <div className="error">{errors.quantity}</div>}

          <textarea
            placeholder="Delivery Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          {errors.location && <div className="error">{errors.location}</div>}

          <input
            placeholder="Enter Your Mobile Number for Orders"
            value={form.phone}
            onChange={(e) => {
              if (/^\d{0,10}$/.test(e.target.value)) {
                setForm({ ...form, phone: e.target.value });
              }
            }}
          />
          <button onClick={handleSubmit}>Order on WhatsApp</button>

          <input
            placeholder="Enter Your Mobile Number to View Details"
            value={phoneForDetails}
            onChange={(e) => {
              if (/^\d{0,10}$/.test(e.target.value)) {
                setPhoneForDetails(e.target.value);
              }
            }}
          />
          <button onClick={handleGetOrders}>Get Order Details</button>

          {userOrders && userOrders.length > 0 && (
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
                  </tr>
                </thead>
                <tbody>
                  {userOrders.map((order, index) => (
                    <tr key={order.id}>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="about-mangoes">
          <h3>Why Choose Our Mangoes?</h3>
          <p>🍋 Our premium-grade Ratnagiri Hapus mangoes are handpicked...</p>
          <p>🚚 Delivered farm-fresh across Pune and nearby areas...</p>
          <p>🌱 100% Carbide-free | GI-tag Certified | Taste Guaranteed</p>
        </div>
      </div>

      <footer className="footer">
        <h4>Get in Touch</h4>
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
          © 2025 Mangoes At Your Doorstep | All rights reserved
        </p>
      </footer>
    </div>
  );
}
