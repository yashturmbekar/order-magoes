import React, { useState } from "react";
import { createOrder, getOrderByPhone } from "../../utils/api";
import Popup from "../../utils/Popup";

export default function OrderMangoes({
  form,
  setForm,
  errors,
  setErrors,
  popupMessage, // Added popupMessage prop
  setPopupMessage,
}) {
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
      setPopupMessage(
        "✅ Order placed successfully! Click 'Proceed' to send details on WhatsApp, or 'Cancel' to close this message."
      );
    } catch (err) {
      alert("Something went wrong: " + err.message);
    }
  };

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
    </div>
  );
}
