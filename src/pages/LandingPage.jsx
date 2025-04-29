import React, { useEffect, useState, useCallback, useMemo } from "react";
import Popup from "../utils/Popup";
import "odometer/themes/odometer-theme-default.css";
import Header from "../components/Header";
import GetOrderDetails from "../components/GetOrderDetails";
import OrderMangoes from "../components/OrderMangoes";
import WhyChooseOurMangoes from "../components/WhyChooseOurMangoes";
import Statistics from "../components/Statistics";
import Footer from "../components/Footer";
import PhotoCarousel from "../components/PhotoCarousel";
import { useSearchParams } from "react-router-dom";
import {
  getSortedAndFilteredOrders,
  generateWhatsAppMessage,
  calculatePhotoIndex,
  storeTokens,
} from "../utils/helpers";
import { createOrder, getOrderByPhone, fetchAllStatistics } from "../utils/api";

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
  const [popupMessage, setPopupMessage] = useState("");
  const [activeSection, setActiveSection] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [statistics, setStatistics] = useState({
    totalMangoesDelivered: 0,
    totalOrdersReceived: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchParams] = useSearchParams();

  const photos = useMemo(
    () => [
      "/src/assets/images/real-mango-1.jpg",
      "/src/assets/images/real-mango-2.jpg",
      "/src/assets/images/real-mango-3.JPG",
      "/src/assets/images/real-mango-4.jpg",
    ],
    []
  );

  const photosWithDuplicates = useMemo(
    () => [photos[photos.length - 1], ...photos, photos[0]],
    [photos]
  );

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const statisticsData = await fetchAllStatistics();
        setStatistics(statisticsData.data);
      } catch (error) {
        console.error("Failed to fetch statistics", error);
      }
    };

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
      setPhoneForDetails(mobileNumber);
      setActiveSection("details");
      handleGetOrdersAfterPlacedOrder(mobileNumber);
    }
  }, [searchParams]);

  const handleGetOrdersAfterPlacedOrder = useCallback(
    async (mobileNumber) => {
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
    },
    [form.phone]
  );

  const handleProceed = useCallback(async () => {
    const message = generateWhatsAppMessage(form);
    const url = `https://wa.me/918830997757?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
    setPopupMessage("");
    await handleGetOrdersAfterPlacedOrder();
  }, [form, handleGetOrdersAfterPlacedOrder]);

  const handleCancel = useCallback(async () => {
    setPopupMessage("");
    await handleGetOrdersAfterPlacedOrder();
  }, [handleGetOrdersAfterPlacedOrder]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value.toLowerCase());
  }, []);

  const handleSort = useCallback((key) => {
    setSortConfig((prevConfig) => {
      const direction =
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc";
      return { key, direction };
    });
  }, []);

  const handleClose = useCallback(() => {
    setPopupMessage("");
  }, []);

  const sortedAndFilteredOrders = useMemo(
    () => getSortedAndFilteredOrders(userOrders, searchTerm, sortConfig),
    [userOrders, searchTerm, sortConfig]
  );

  const renderSection = useCallback(() => {
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
  }, [
    activeSection,
    form,
    errors,
    phoneForDetails,
    userOrders,
    searchTerm,
    sortConfig,
    handleSort,
    sortedAndFilteredOrders,
    handleGetOrdersAfterPlacedOrder,
  ]);

  return (
    <div>
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
                  src="/src/assets/images/mango-icon.png"
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
                  "scale(1.3)";
                document.getElementById("order-text").style.transform =
                  "scale(1.3)";
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
                src="/src/assets/images/order-magoes.png"
                alt="Order Mangoes"
                style={{
                  width: "150px",
                  height: "150px",
                  transition: "transform 1.2s ease",
                }}
              />
              <div
                id="order-text"
                style={{
                  textAlign: "center",
                  marginTop: "10px",
                  transition: "transform 1.2s ease",
                }}
              >
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#ff4500",
                    fontFamily: "'Nunito', sans-serif",
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
                  "scale(1.3)";
                document.getElementById("details-text").style.transform =
                  "scale(1.3)";
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
                src="/src/assets/images/get-order-details.png"
                alt="Get Order Details"
                style={{
                  width: "150px",
                  height: "150px",
                  transition: "transform 1.2s ease",
                }}
              />
              <div
                id="details-text"
                style={{
                  textAlign: "center",
                  marginTop: "10px",
                  transition: "transform 1.2s ease",
                }}
              >
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#ff4500",
                    fontFamily: "'Nunito', sans-serif",
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
            <PhotoCarousel />
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
            {popupMessage !==
              "0 active orders found for this mobile number. Please use a different mobile number." && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                }}
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
    </div>
  );
}
