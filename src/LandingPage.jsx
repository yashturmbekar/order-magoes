import React, { useEffect, useState } from "react";
import { createOrder, getOrderByPhone, fetchAllStatistics } from "./utils/api";
import Popup from "./utils/Popup";
import Odometer from "react-odometerjs";
import "odometer/themes/odometer-theme-default.css";
import Header from "./sections/Header";

// Statistics Component
function Statistics({ statistics }) {
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
        <span> dozen of mangoes shared with </span>

        <Odometer value={ordersReceived} format="(,ddd)" theme="default" />
        <span> + mango lovers.</span>
      </div>
    </div>
  );
}

// LandingPage Component
export default function LandingPage() {
  // State Management
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
  const [popupMessage, setPopupMessage] = useState("");
  const [activeSection, setActiveSection] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isTransitioning] = useState(true);
  const [statistics, setStatistics] = useState({
    totalMangoesDelivered: 0,
    totalOrdersReceived: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Constants
  const photos = [
    "/real-mango-1.jpg",
    "/real-mango-2.jpg",
    "/real-mango-3.JPG",
    "/real-mango-4.jpg",
  ];

  const photosWithDuplicates = [
    photos[photos.length - 1], // Add the last photo at the beginning for smooth looping
    ...photos,
    photos[0], // Add the first photo at the end for smooth looping
  ];

  // Effects
  useEffect(() => {
    async function fetchStatistics() {
      try {
        const statisticsData = await fetchAllStatistics();
        setStatistics(statisticsData.data);
      } catch (error) {
        console.error("Failed to fetch statistics", error);
      }
    }

    fetchStatistics();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 3000); // Automatically move to the next photo every 3 seconds

    return () => clearInterval(interval);
  }, [photos.length]);

  // Validation
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

  // Handlers
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
      setPopupMessage(
        "✅ Order placed successfully! Click 'Proceed' to send details on WhatsApp, or 'Cancel' to close this message."
      );
    } catch (err) {
      alert("Something went wrong: " + err.message);
    }
  };

  const handleProceed = () => {
    const message = `Hello, I want to order ${form.quantity} dozen(s) of Ratnagiri Hapus mangoes.\n\nName: ${form.name}\nPhone: ${form.phone}\nDelivery Location: ${form.location}`;
    const url = `https://wa.me/918830997757?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
    setPopupMessage(""); // Close the popup after proceeding
  };

  const handleCancel = () => {
    setPopupMessage(""); // Close the popup
  };

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Define sortedAndFilteredOrders based on userOrders, searchTerm, and sortConfig
  const sortedAndFilteredOrders = userOrders
    .filter((order) => {
      // Filter orders based on the search term
      return (
        order.name.toLowerCase().includes(searchTerm) ||
        order.phone.includes(searchTerm) ||
        order.location.toLowerCase().includes(searchTerm)
      );
    })
    .sort((a, b) => {
      // Sort orders based on the sortConfig
      if (!sortConfig.key) return 0;
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  // Render Section
  const renderSection = () => {
    if (activeSection === "order") {
      return (
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

          <button onClick={handleSubmit}>Order on WhatsApp</button>
        </div>
      );
    } else if (activeSection === "details") {
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
                        Order Id{" "}
                        {sortConfig.key === "orderId"
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : "▲▼"}
                      </th>
                      <th onClick={() => handleSort("name")}>
                        Name{" "}
                        {sortConfig.key === "name"
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : "▲▼"}
                      </th>
                      <th onClick={() => handleSort("phone")}>
                        Phone{" "}
                        {sortConfig.key === "phone"
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : "▲▼"}
                      </th>
                      <th onClick={() => handleSort("quantity")}>
                        Qty{" "}
                        {sortConfig.key === "quantity"
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : "▲▼"}
                      </th>
                      <th onClick={() => handleSort("location")}>
                        Delivery Location{" "}
                        {sortConfig.key === "location"
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : "▲▼"}
                      </th>
                      <th onClick={() => handleSort("createdAt")}>
                        Order Date{" "}
                        {sortConfig.key === "createdAt"
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : "▲▼"}
                      </th>
                      <th onClick={() => handleSort("lastUpdatedAt")}>
                        Last Updated{" "}
                        {sortConfig.key === "lastUpdatedAt"
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : "▲▼"}
                      </th>
                      <th onClick={() => handleSort("orderStatus")}>
                        Order Status{" "}
                        {sortConfig.key === "orderStatus"
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : "▲▼"}
                      </th>
                      <th onClick={() => handleSort("paymentStatus")}>
                        Payment Status{" "}
                        {sortConfig.key === "paymentStatus"
                          ? sortConfig.direction === "asc"
                            ? "▲"
                            : "▼"
                          : "▲▼"}
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
    return null;
  };

  // Main Render
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
        <Header />

        <div
          className="button-group"
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <button
            className={`fancy-button mango-button ${
              activeSection === "order" ? "active" : ""
            }`}
            onClick={() => setActiveSection("order")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 1.2s ease", // This transition will apply to the button itself (and its children)
            }}
            onMouseEnter={() => {
              // Apply scale to both the image and text when mouse enters button
              document.getElementById("order-image").style.transform =
                "scale(1.5)";
              document.getElementById("order-text").style.transform =
                "scale(1.5)";
            }}
            onMouseLeave={() => {
              // Reset scale for both image and text when mouse leaves button
              document.getElementById("order-image").style.transform =
                "scale(1)";
              document.getElementById("order-text").style.transform =
                "scale(1)";
            }}
          >
            <img
              id="order-image"
              src="/order-magoes.png"
              alt="Order Mangoes"
              style={{
                width: "150px",
                height: "150px",
                transition: "transform 1.2s ease", // Smooth scaling transition for image
              }}
            />
            <div
              id="order-text"
              style={{
                textAlign: "center",
                marginTop: "10px",
                transition: "transform 1.2s ease", // Smooth scaling transition for text
              }}
            >
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#ff4500", // Updated button text color to a vibrant orange-red
                  fontFamily: "'Nunito', sans-serif", // Updated font for button text
                  animation: "fadeInText 1.2s ease-in-out",
                  marginTop: "10px",
                }}
              >
                Order Mangoes
              </p>
            </div>
          </button>

          <button
            className={`fancy-button mango-button ${
              activeSection === "details" ? "active" : ""
            }`}
            onClick={() => setActiveSection("details")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 1.2s ease", // This transition will apply to the button itself (and its children)
            }}
            onMouseEnter={() => {
              // Apply scale to both the image and text when mouse enters button
              document.getElementById("details-image").style.transform =
                "scale(1.5)";
              document.getElementById("details-text").style.transform =
                "scale(1.5)";
            }}
            onMouseLeave={() => {
              // Reset scale for both image and text when mouse leaves button
              document.getElementById("details-image").style.transform =
                "scale(1)";
              document.getElementById("details-text").style.transform =
                "scale(1)";
            }}
          >
            <img
              id="details-image"
              src="/get-order-details.png"
              alt="Get Order Details"
              style={{
                width: "150px",
                height: "150px",
                transition: "transform 1.2s ease", // Smooth scaling transition for image
              }}
            />
            <div
              id="details-text"
              style={{
                textAlign: "center",
                marginTop: "10px",
                transition: "transform 1.2s ease", // Smooth scaling transition for text
              }}
            >
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#ff4500", // Updated button text color to a vibrant orange-red
                  fontFamily: "'Nunito', sans-serif", // Updated font for button text
                  animation: "fadeInText 1.2s ease-in-out",
                  marginTop: "10px",
                }}
              >
                Get Order Details
              </p>
            </div>
          </button>
        </div>

        {renderSection()}

        <div className="about-mangoes">
          <h3>Why Choose Our Mangoes?</h3>
          <p>🍋 Our premium-grade Ratnagiri Hapus mangoes are handpicked...</p>
          <p>🚚 Delivered farm-fresh across Pune and nearby areas...</p>
          <p>🌱 100% Carbide-free | GI-tag Certified | Taste Guaranteed</p>

          <Statistics statistics={statistics} />

          <div
            className="photo-carousel"
            style={{
              display: "flex",
              overflow: "hidden",
              width: "100%",
              maxWidth: "900px",
              margin: "20px auto 0",
            }}
          >
            <div
              className="carousel-track"
              style={{
                display: "flex",
                transition: isTransitioning
                  ? "transform 0.5s ease-in-out"
                  : "none",
                transform: `translateX(-${
                  (currentPhotoIndex % photosWithDuplicates.length) * 33.33
                }%)`, // Ensures looping effect
              }}
            >
              {photosWithDuplicates.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Mango photo ${index + 1}`}
                  style={{
                    width: "33.33%",
                    flexShrink: 0,
                    height: "auto",
                    borderRadius: "10px",
                    marginTop: "20px", // Added space between text and images
                    margin: "0 10px", // Added horizontal space between images
                    border: "1px solid #ccc", // Updated to a lighter and more subtle border
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)", // Enhanced shadow for a more refined look
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {popupMessage && (
        <Popup message={popupMessage} hideCloseButton={true}>
          <div
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
          >
            <button
              onClick={handleProceed}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Proceed
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: "10px 20px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </Popup>
      )}

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
