import React, { useState, useEffect } from "react";
import "./UnSubscribe.css";

const UnSubscribe = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [unsubscribeImages, setUnsubscribeImages] = useState([]);

  // Fetch unsubscribe images from backend
  useEffect(() => {
    const fetchUnsubscribeImages = async () => {
      try {
        const res = await fetch("https://inoptics.in/api/get_unsubscribe_images.php");
        const data = await res.json();
        setUnsubscribeImages(data || []);
      } catch (err) {
        console.error("Failed to fetch Unsubscribe Images", err);
      }
    };

    fetchUnsubscribeImages();
  }, []);

  // Handle unsubscribe form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email before unsubscribing.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://inoptics.in/api/unsubscribe.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ email }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Your unsubscribe request has been submitted.");
        setEmail("");
      } else {
        alert("⚠️ Failed to process request: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Unsubscribe request failed:", err);
      alert("❌ Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="unsubscribe-container">
      <div className="unsubscribe-box">
        {/* Dynamic Image from API */}
      <div className="unsubscribe-image">
  {unsubscribeImages.length > 0 ? (
    <img
      src={`https://inoptics.in/api/uploads/${unsubscribeImages[0].image}`}
      alt="Unsubscribe"
      style={{ maxWidth: "100%", height: "auto" }}
    />
  ) : (
    <p>Loading image...</p>
  )}
</div>

        {/* Unsubscribe content */}
        <form onSubmit={handleSubmit} className="unsubscribe-text">
          <h2>UnSubscribe</h2>
          <p>We’re sorry to see you go!</p>
          <p>
            Are you sure you want to unsubscribe your account from{" "}
            <strong>InOptics</strong>?
          </p>

          {/* Email Input */}
          <label className="unsubscribe-label">
            Enter Your Email:
            <input
              type="email"
              className="unsubscribe-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          {/* Button */}
          <div className="btn-row">
            <button type="submit" className="unsubscribe-btn" disabled={loading}>
              {loading ? "Submitting..." : "UnSubscribe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnSubscribe;
