import React from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer
      className="footer"
      style={{ background: "linear-gradient(to right, #fff8dc, #ffbe5c)" }}
    >
      <h4>Get in Touch</h4>
      <div className="footer-details">
        <p>
          <strong>Yash Turmbekar</strong>
        </p>
        <p>
          <FaPhoneAlt /> <a href="tel:+918237381312">+91 82373 81312</a>
        </p>
        <p>
          <FaEnvelope />{" "}
          <a href="mailto:yashturmbkar7@gmail.com">yashturmbkar7@gmail.com</a>
        </p>
        <p>
          <FaMapMarkerAlt /> Pune, Maharashtra
        </p>
      </div>
      <p className="footer-note">
        © 2025 Mangoes At Your Doorstep | All rights reserved
      </p>
    </footer>
  );
};

export default Footer;
