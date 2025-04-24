import React, { useEffect, useState } from "react";
import { createOrder, getOrderByPhone, fetchAllStatistics } from "./utils/api";
import Popup from "./utils/Popup";
import "odometer/themes/odometer-theme-default.css";
import Header from "./sections/Header";
import GetOrderDetails from "./sections/GetOrderDetails";
import OrderMangoes from "./sections/OrderMangoes";
import WhyChooseOurMangoes from "./sections/WhyChooseOurMangoes";
import Statistics from "./sections/Statistics";
import Footer from "./sections/Footer";
import { useSearchParams } from "react-router-dom";
import {
  getSortedAndFilteredOrders,
  generateWhatsAppMessage,
  calculatePhotoIndex,
  storeTokens,
} from "./utils/helpers";

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
  const [searchParams] = useSearchParams();

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
      setCurrentPhotoIndex((prevIndex) =>
        calculatePhotoIndex(prevIndex, photos.length)
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [photos.length]);

  useEffect(() => {
    const mobileNumber = searchParams.get("mobilenumber");
    if (mobileNumber) {
      console.log("Mobile number from URL:", mobileNumber);
      setPhoneForDetails(mobileNumber);
      setActiveSection("details");
      handleGetOrdersAfterPlacedOrder(mobileNumber);
    }
  }, [searchParams]);

  const handleProceed = async () => {
    const message = generateWhatsAppMessage(form);
    const url = `https://wa.me/918830997757?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
    setPopupMessage("");
    await handleGetOrdersAfterPlacedOrder();
  };

  const handleCancel = async () => {
    setPopupMessage("");
    await handleGetOrdersAfterPlacedOrder();
  };

  const handleGetOrdersAfterPlacedOrder = async (mobileNumber) => {
    const phone = form.phone || mobileNumber;
    try {
      const orders = await getOrderByPhone(phone);
      storeTokens(orders.data.access_token, orders.data.refresh_token);
      setUserOrders(orders.data.orderDetails);
      setActiveSection("details");
      setPhoneForDetails(phone);
    } catch (err) {
      setPopupMessage("Failed to fetch orders");
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

  const handleClose = () => {
    setPopupMessage(""); // Close the popup
  };

  const sortedAndFilteredOrders = getSortedAndFilteredOrders(
    userOrders,
    searchTerm,
    sortConfig
  );

  // Render Section
  const renderSection = () => {
    if (activeSection === "order") {
      return (
        <OrderMangoes
          form={form}
          setForm={setForm}
          errors={errors}
          setErrors={setErrors}
          setPopupMessage={setPopupMessage}
          handleGetOrdersAfterPlacedOrder={handleGetOrdersAfterPlacedOrder}
        />
      );
    } else if (activeSection === "details") {
      return (
        <GetOrderDetails
          phoneForDetails={phoneForDetails}
          setPhoneForDetails={setPhoneForDetails}
          userOrders={userOrders}
          setUserOrders={setUserOrders}
          errors={errors}
          setErrors={setErrors}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          handleSort={handleSort}
          sortedAndFilteredOrders={sortedAndFilteredOrders}
          setPopupMessage={setPopupMessage}
        />
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
          <WhyChooseOurMangoes />
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
        <Popup
          message={popupMessage}
          hideCloseButton={
            popupMessage ===
            "✅ Order placed successfully! Click 'Proceed' to send details on WhatsApp, or 'Cancel' to close this message."
          }
          onClose={handleClose}
        >
          {popupMessage ===
          "0 active orders found for this mobile number. Please use a different mobile number." ? null : (
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
          )}
        </Popup>
      )}

      <Footer />
    </div>
  );
}
