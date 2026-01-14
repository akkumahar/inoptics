import React, { useState, useEffect } from "react";
import QRCode from "qrcode"; // Install: npm install qrcode
import "./ExhibitorBadgeForm.css";

const ExhibitorBadgeForm = () => {
  const [exhibitors, setExhibitors] = useState([]);
  const [stallList, setStallList] = useState([]);
  const [generatedBadges, setGeneratedBadges] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    candidate_photo: null,
    exhibitor_company_name: "",
    stall_no: "",
    state: "",
    city: "",
    exhibitor_id: "",
    exhibitor_email: "",
    free_badges: 0,
    extra_badges: 0,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [freeBadges, setFreeBadges] = useState(0);
  const [remainingBadges, setRemainingBadges] = useState(0); // ✅ YE ADD KARO
  const [usedBadges, setUsedBadges] = useState(0); // optional, agar dikhana ho

  const [extraBadges, setExtraBadges] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    checkLoginAndFetchData();
  }, []);

  // free badges fetch api call
  //  localStorage merge

  useEffect(() => {
    if (!formData.exhibitor_company_name) return;
    const company = formData.exhibitor_company_name;

    fetch(
      `https://inoptics.in/api/get_Exhibitor_badges.php?company_name=${encodeURIComponent(
        company
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;

        setFreeBadges(parseInt(data.free_badges, 10) || 0);
        setExtraBadges(parseInt(data.extra_badges, 10) || 0);
        setUsedBadges(parseInt(data.used_badges, 10) || 0);
        setRemainingBadges(parseInt(data.remaining_badges, 10) || 0);
        setIsLocked(data.is_locked == 1);
      });
  }, [formData.exhibitor_company_name]);

 
  const checkLoginAndFetchData = () => {
    const isLoggedIn = localStorage.getItem("isExhibitorLoggedIn");
    const exhibitorInfo = localStorage.getItem("exhibitorInfo");

    if (!isLoggedIn || isLoggedIn !== "true") {
      setLoading(false);
      setMessage({
        type: "error",
        text: "Please login first to access this page",
      });
      return;
    }

    if (!exhibitorInfo) {
      setLoading(false);
      setMessage({
        type: "error",
        text: "Session expired. Please login again.",
      });
      return;
    }

    try {
      const parsedInfo = JSON.parse(exhibitorInfo);
      const email = parsedInfo.email;

      if (email) {
        fetchExhibitorData(email);
      } else {
        setLoading(false);
        setMessage({
          type: "error",
          text: "Invalid session data. Please login again.",
        });
      }
    } catch (err) {
      setLoading(false);
      setMessage({
        type: "error",
        text: "Session data corrupted. Please login again.",
      });
    }
  };

  const fetchExhibitorData = async (email) => {
    setLoading(true);

    try {
      const res = await fetch("https://inoptics.in/api/get_exhibitors.php");
      const data = await res.json();

      if (Array.isArray(data)) {
        const matched = data.find(
          (ex) => ex.email.toLowerCase() === email.toLowerCase()
        );

        if (matched) {
          setExhibitors([matched]);

          setFormData((prev) => ({
            ...prev,
            exhibitor_company_name: matched.company_name || "",
            state: matched.state || "",
            city: matched.city || "",
            exhibitor_id: matched.id || "",
            exhibitor_email: matched.email || "",
          }));

          if (matched.company_name) {
            fetchStallsByCompany(matched.company_name);
          }

          setMessage({
            type: "success",
            text: `Welcome, ${matched.company_name}!`,
          });
        } else {
          setExhibitors([]);
          setMessage({ type: "error", text: "Exhibitor data not found" });
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const fetchStallsByCompany = async (companyName) => {
    try {
      const response = await fetch("https://inoptics.in/api/get_stalls.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName }),
      });

      if (response.ok) {
        const data = await response.json();
        const stalls = Array.isArray(data) ? data : [data];
        setStallList(stalls);

        if (stalls.length > 0) {
          const firstStall = stalls[0].stall_no || stalls[0].stall_number || "";
          setFormData((prev) => ({
            ...prev,
            stall_no: firstStall,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching stall data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "Image size should be less than 2MB",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "Please upload a valid image file" });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        candidate_photo: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Generate QR Code in Frontend
  // ✅ QR generate karne ka helper
  const generateQRCode = async (badgeData) => {
    try {
      console.log("🎨 Generating QR code for:", badgeData);

      const qrData = JSON.stringify({
        name: badgeData.name,
        company: badgeData.company,
        stall: badgeData.stall,
        city: badgeData.city,
        state: badgeData.state,
        exhibitor_id: badgeData.exhibitor_id,
        timestamp: new Date().toISOString(),
      });

      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error("💥 QR generation error:", error);
      throw new Error("Failed to generate QR code");
    }
  };

  // ✅ DataURL → Blob helper
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // ✅ Tumhara handleSubmit QR ke saath
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Free badge limit check
    if (remainingBadges <= 0) {
      setMessage({
        type: "error",
        text: "You have used all your free badges. Please contact admin for extra badges.",
      });
      return;
    }

    // Client-side validation
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Please enter candidate name" });
      return;
    }

    if (!formData.candidate_photo) {
      setMessage({ type: "error", text: "Please upload candidate photo" });
      return;
    }

    if (formData.candidate_photo.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size should be less than 2MB" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    console.log("📤 Starting badge submission...");

    try {
      // Step 1: Generate QR Code in frontend
      console.log("🎨 Step 1: Generating QR code...");
      const qrCodeDataUrl = await generateQRCode({
        name: formData.name.trim(),
        company: formData.exhibitor_company_name,
        stall: formData.stall_no,
        city: formData.city,
        state: formData.state,
        exhibitor_id: formData.exhibitor_id,
      });

      // Step 2: Convert QR to Blob → File
      console.log("🔄 Step 2: Converting QR to file...");
      const qrBlob = dataURLtoBlob(qrCodeDataUrl);
      const qrFile = new File([qrBlob], `qr_${Date.now()}.png`, {
        type: "image/png",
      });

      // Step 3: Prepare FormData
      console.log("📦 Step 3: Preparing form data...");
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("candidate_photo", formData.candidate_photo);
      formDataToSend.append("company_name", formData.exhibitor_company_name); // 👈 important
      formDataToSend.append("stall_no", formData.stall_no);
      formDataToSend.append("state", formData.state || "");
      formDataToSend.append("city", formData.city || "");
      formDataToSend.append("exhibitor_id", formData.exhibitor_id || "");

      // Debug: log FormData
      console.log("📋 FormData contents:");
      for (let pair of formDataToSend.entries()) {
        if (pair[0] === "candidate_photo" || pair[0] === "qr_code") {
          console.log(`${pair[0]}:`, pair[1].name, pair[1].size, "bytes");
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      // Step 4: Send to backend
      console.log("🌐 Step 4: Sending to backend...");
      const response = await fetch("https://inoptics.in/api/submit-badge.php", {
        method: "POST",
        body: formDataToSend,
      });

      console.log("📊 Response status:", response.status);

      const responseText = await response.text();
      console.log("📄 Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log("✅ Parsed response:", data);
      } catch (parseError) {
        console.error("💥 JSON Parse Error:", parseError);
        throw new Error("Invalid server response");
      }

      if (data.success) {
        setMessage({
          type: "success",
          text: data.message || "Badge created successfully!",
        });

       
        // 🔄 Step 2 — Fresh count DB se reload karo
        const badgeRes = await fetch(
          `https://inoptics.in/api/get_Exhibitor_badges.php?company_name=${encodeURIComponent(
            formData.exhibitor_company_name
          )}`
        );

        const badgeData = await badgeRes.json();

        setFreeBadges(parseInt(badgeData.free_badges, 10) || 0);
        setExtraBadges(parseInt(badgeData.extra_badges, 10) || 0);
        setUsedBadges(parseInt(badgeData.used_badges, 10) || 0);
        setRemainingBadges(parseInt(badgeData.remaining_badges, 10) || 0);
        setIsLocked(badgeData.is_locked == 1);

        // 🧾 Step 3 — Add badge to UI list
        const newBadge = {
          badge_id: data.badge_id,
          name: formData.name.trim(),
          company: formData.exhibitor_company_name,
          stall: formData.stall_no,
          state: formData.state,
          city: formData.city,
          exhibitor_id: formData.exhibitor_id,
          qr_code: data.qr_code,
          photo: data.photo,
          qr_preview: `https://inoptics.in/${data.qr_code}`,
          created_at: new Date().toLocaleString(),
        };

        setGeneratedBadges((prev) => [newBadge, ...prev]);

        // 🧹 Reset form
        setFormData((prev) => ({
          ...prev,
          name: "",
          candidate_photo: null,
        }));
        setPhotoPreview(null);

        // 📜 Scroll
        setTimeout(() => {
          const badgesSection = document.querySelector(".badges-list");
          if (badgesSection) {
            badgesSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 100);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to create badge",
        });
      }
    } catch (err) {
      console.error("💥 Submit error:", err);
      setMessage({
        type: "error",
        text: err.message || "Error generating badge",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = (url, badgeName) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `badge-qr-${badgeName.replace(/\s+/g, "-")}.png`;
    link.click();
  };

  const downloadBadgePhoto = (photoUrl, badgeName) => {
    const link = document.createElement("a");
    link.href = `https://inoptics.in/${photoUrl}`;
    link.download = `badge-photo-${badgeName.replace(/\s+/g, "-")}.jpg`;
    link.click();
  };

  if (loading && exhibitors.length === 0) {
    return (
      <div className="exhibitor-form-container">
        <div className="form-wrapper">
          <div className="loading-state">
            <div className="spinner"></div>
            <h3>Loading...</h3>
            <p>Please wait while we verify your session</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exhibitor-form-container">
      <div className="form-wrapper">
        <div className="badge-info-bar">
          <div className="badge-counter">
            <span>Free Badges Allotted:</span>
            <strong>{freeBadges}</strong>
          </div>
          <div className="badge-counter">
            <span>Free Badges Remaining:</span>
            <strong>{remainingBadges}</strong>
          </div>
          <div className="badge-counter">
            <span>Extra Badges Allotted:</span>
            <strong>{extraBadges}</strong>
          </div>
        </div>

        <h2>🎫 Exhibitor Badge Registration</h2>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        {exhibitors.length > 0 ? (
          <>
            <form onSubmit={handleSubmit} className="badge-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={formData.exhibitor_company_name}
                    disabled
                    className="disabled-input"
                  />
                </div>

                <div className="form-group">
                  <label>Stall No</label>
                  <input
                    type="text"
                    value={formData.stall_no}
                    disabled
                    className="disabled-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={formData.state}
                    disabled
                    className="disabled-input"
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    disabled
                    className="disabled-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Candidate Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter candidate name"
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Candidate Photo * (Max 2MB)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  required={!photoPreview}
                  className="file-input"
                />
                {photoPreview && (
                  <div className="photo-preview">
                    <img src={photoPreview} alt="Preview" />
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "Generating Badge..." : "✨ Generate Badge"}
              </button>
            </form>

            
            
          </>
        ) : (
          <div className="no-access">
            <h3>⚠️ Access Denied</h3>
            <p>Please login to access the badge registration form.</p>
            <button
              className="login-redirect-btn"
              onClick={() => (window.location.href = "/exhibitor-login")}
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExhibitorBadgeForm;
