import React, { useState, useEffect } from "react";
import "./ExhibitorBadgeForm.css";
import { FaCirclePlus } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { FaEdit, FaTrash, FaUpload, FaUnlock, FaLock } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";

const ExhibitorBadgeForm = ({
  setIsInExhibitorBadges,
  setHasGeneratedBadge,
  setHasUnlockedBadge,
}) => {
  // ===== STATES =====
  const [exhibitors, setExhibitors] = useState([]);
  const [stallList, setStallList] = useState([]);
  const [companyBadges, setCompanyBadges] = useState([]);
  const [printStatus, setPrintStatus] = useState({});
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [showBadgePopup, setShowBadgePopup] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);

  const [freeExhausted, setFreeExhausted] = useState(false);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingCompanyBadges, setLoadingCompanyBadges] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Badge counts
  const [freeBadges, setFreeBadges] = useState(0);
  const [extraPaidBadges, setExtraPaidBadges] = useState(0); // Extra badges requested count
  const [usedBadges, setUsedBadges] = useState(0);
  const [freeRemaining, setFreeRemaining] = useState(0);

  const [isLocked, setIsLocked] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    candidate_photo: null,
    exhibitor_company_name: "",
    stall_no: "",
    state: "",
    city: "",
    exhibitor_id: "",
    exhibitor_email: "",
  });

  const currentExhibitor = exhibitors[0];

  useEffect(() => {
    setIsInExhibitorBadges(true);
    return () => setIsInExhibitorBadges(false);
  }, []);

  useEffect(() => {
    if (companyBadges.length > 0) {
      setHasGeneratedBadge(true);
    }
  }, [companyBadges]);

  useEffect(() => {
    const hasUnlocked = companyBadges.some(
      (badge) => Number(badge.badge_lock) === 0,
    );

    setHasUnlockedBadge(hasUnlocked);
  }, [companyBadges]);

  // ===== LOGIN CHECK & INITIAL LOAD =====
  useEffect(() => {
    checkLoginAndFetchData();
  }, []);

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
          (ex) => ex.email.toLowerCase() === email.toLowerCase(),
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

  // ===== AUTO REFRESH BADGE DATA =====
  useEffect(() => {
  if (!formData.exhibitor_company_name) return;

  const companyName = formData.exhibitor_company_name;
  let cancelled = false;

  const fetchAllData = async () => {
    setLoadingCompanyBadges(true);

    try {
      /* ===============================
         1️⃣ FETCH BADGES LIST (FIRST)
      =============================== */
      const badgeRes = await fetch(
        `https://inoptics.in/api/get_exhibitor_badges_by_company.php?company_name=${encodeURIComponent(
          companyName
        )}`
      );

      const badgeData = await badgeRes.json();

      if (!cancelled && badgeData.success) {
        const badges = badgeData.badges || [];
        setCompanyBadges(badges);

        // print status map
        const statusMap = {};
        badges.forEach((b) => {
          statusMap[b.id] = b.print_status;
        });
        setPrintStatus(statusMap);
      }

      /* ===============================
         2️⃣ FETCH COUNTS (AFTER LIST)
      =============================== */
      const countRes = await fetch(
        `https://inoptics.in/api/get_Exhibitor_badges.php?company_name=${encodeURIComponent(
          companyName
        )}`
      );

      const countData = await countRes.json();

      if (!cancelled && countData.success) {
        setFreeBadges(Number(countData.free_badges) || 0);
        setExtraPaidBadges(Number(countData.extra_badges) || 0);
        setUsedBadges(Number(countData.used_badges) || 0);
        setFreeRemaining(Number(countData.free_remaining) || 0);
      }

    } catch (err) {
      if (!cancelled) {
        console.error("❌ Badge data fetch error:", err);
        setCompanyBadges([]);
      }
    } finally {
      if (!cancelled) setLoadingCompanyBadges(false);
    }
  };

  fetchAllData();

  return () => {
    cancelled = true; // 🛑 avoid stale state updates
  };
}, [formData.exhibitor_company_name, refreshTrigger]);


  const sendExtraBadgesMail = async () => {
    if (!currentExhibitor?.company_name) {
      console.warn("❌ Company name missing, mail not sent");
      return;
    }

    try {
      await fetch("https://inoptics.in/api/send_extra_badges_mail.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: currentExhibitor.company_name,
          template_name: "InOptics 2026 Exhibitor Extra Badges",
        }),
      });

      console.log("📧 Mail sent to Admin successfully!");
    } catch (error) {
      console.error("❌ Mail sending failed:", error);
    }
  };

  // ===== HANDLE BADGE SUBMIT =====
  const handleSubmit = async (e) => {
  e.preventDefault();

  // ===== VALIDATIONS =====
  if (!formData.name.trim()) {
    setMessage({ type: "error", text: "Please enter candidate name" });
    return;
  }

  if (!(formData.candidate_photo instanceof File)) {
    setMessage({ type: "error", text: "Please upload candidate photo" });
    return;
  }

  if (formData.candidate_photo.size > 2 * 1024 * 1024) {
    setMessage({ type: "error", text: "Image size should be less than 2MB" });
    return;
  }

  setLoading(true);
  setMessage({ type: "", text: "" });

  try {
    /* ===============================
       1️⃣ FETCH FREE REMAINING FIRST
    =============================== */
    const countRes = await fetch(
      `https://inoptics.in/api/get_Exhibitor_badges.php?company_name=${encodeURIComponent(
        formData.exhibitor_company_name
      )}`
    );
    const countData = await countRes.json();

    if (!countData.success) {
      throw new Error("Failed to fetch badge counts");
    }

    const freeRemaining = Number(countData.free_remaining) || 0;
    const isExtraBadge = freeRemaining === 0; // 🔥 결정 यहीं होगा

    /* ===============================
       2️⃣ CREATE BADGE
    =============================== */
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name.trim());
    formDataToSend.append("candidate_photo", formData.candidate_photo);
    formDataToSend.append("company_name", formData.exhibitor_company_name);
    formDataToSend.append("stall_no", formData.stall_no);
    formDataToSend.append("state", formData.state || "");
    formDataToSend.append("city", formData.city || "");
    formDataToSend.append("exhibitor_id", formData.exhibitor_id || "");

    const response = await fetch(
      "https://inoptics.in/api/submit-badge.php",
      {
        method: "POST",
        body: formDataToSend,
      }
    );

    const responseText = await response.text();
    console.log("Response body:", responseText);

    const data = JSON.parse(responseText);

    if (!data.success) {
      throw new Error(data.message || "Failed to create badge");
    }

    /* ===============================
       3️⃣ EXTRA BADGE COUNT (ONLY IF NEEDED)
    =============================== */
    if (isExtraBadge) {
      await autoIncrementExtraBadge(); // ✅ GUARANTEED
    }

    /* ===============================
       4️⃣ UI UPDATES
    =============================== */
    setMessage({
      type: "success",
      text: "Badge created successfully!",
    });

    setCompanyBadges((prev) => [
      {
        id: Number(data.badge_id),
        name: formData.name.trim(),
        stall_no: formData.stall_no,
        state: formData.state,
        city: formData.city,
        photo: data.photo,
        badge_lock: 0,
      },
      ...prev,
    ]);

    setRefreshTrigger((prev) => prev + 1);
    setHasGeneratedBadge(true);

    // RESET FORM
    setFormData((prev) => ({
      ...prev,
      name: "",
      candidate_photo: null,
    }));
    setPhotoPreview(null);

  } catch (err) {
    console.error("❌ Submit error:", err);
    setMessage({
      type: "error",
      text: err.message || "Server error",
    });
  } finally {
    setLoading(false);
  }
};


  // ===== AUTO INCREMENT EXTRA BADGE =====
  const autoIncrementExtraBadge = async () => {
    if (!currentExhibitor?.company_name) {
      console.error("No company name available");
      return;
    }

    try {
      const payload = {
        company_name: currentExhibitor.company_name,
        free_badges: currentExhibitor.free_badges || 0,
        extra_badges: 1, // +1 each time
      };

      const res = await fetch(
        "https://inoptics.in/api/update_Exhibitor_badges.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (data.success) {
        console.log("✅ Extra badge count incremented");
      } else {
        console.error("Failed to increment:", data.error);
      }
    } catch (error) {
      console.error("❌ Auto increment error:", error);
    }
  };

  // ===== LOCK ALL BADGES =====
  const handleLockBadgesAfterSubmit = async (e) => {
  e.preventDefault();

  if (!currentExhibitor?.company_name) {
    alert("No company data available");
    return;
  }

  try {
    const res = await fetch(
      "https://inoptics.in/api/all_badges_lock_exhibitor.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: currentExhibitor.company_name, // 🔥 ALL BADGES
        }),
      }
    );

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to lock badges");
    }

    // 🔄 refresh table
    setRefreshTrigger((prev) => prev + 1);

    // ✉️ send mail ONLY if extra badges exist
    if (Number(extraPaidBadges) > 0) {
      await sendExtraBadgesMail();
    }

    alert("✅ All badges submitted & locked successfully");

  } catch (error) {
    console.error("❌ Lock error:", error);
    alert(error.message || "Error locking badges");
  }
};


  const handleUpdateBadgesAfterUnlockRequest = async (e, badgeId) => {
  e.preventDefault();

  if (!currentExhibitor?.company_name || !badgeId) {
    alert("Badge or company data missing");
    return;
  }

  try {
    const res = await fetch(
      "https://inoptics.in/api/lock_exhibitor_badges.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: currentExhibitor.company_name,
          badge_id: badgeId, // 🔥 IMPORTANT
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
      setRefreshTrigger((prev) => prev + 1); // 🔄 refresh table
      alert("✅ Badge updated successfully");
    } else {
      alert(data.message || "Failed to update badge");
    }
  } catch (error) {
    console.error("❌ Update error:", error);
    alert("Error updating badge");
  }
};



  // ===== FORM HANDLERS =====
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

  // ===== BADGE ACTIONS =====
  const openEditModal = (badge) => {
    setEditingBadge({
      id: badge.id,
      name: badge.name || "",
      stall_no: badge.stall_no || "",
      state: badge.state || "",
      city: badge.city || "",
      candidate_photo: badge.candidate_photo || null,
      preview: badge.candidate_photo
        ? badge.candidate_photo + "?t=" + Date.now()
        : null,
    });
    setShowEditModal(true);
  };

  const updateBadge = async () => {
  if (!editingBadge) return;

  try {
    const fd = new FormData();
    fd.append("id", editingBadge.id);
    fd.append("name", editingBadge.name);
    fd.append("stall_no", editingBadge.stall_no);
    fd.append("state", editingBadge.state || "");
    fd.append("city", editingBadge.city || "");

    if (editingBadge.candidate_photo instanceof File) {
      fd.append("candidate_photo", editingBadge.candidate_photo);
    }

    const res = await fetch(
      "https://inoptics.in/api/edit_exhibitor_badge.php",
      {
        method: "POST",
        body: fd,
      }
    );

    const text = await res.text();
    if (!text) throw new Error("Empty response from server");

    const data = JSON.parse(text);
    if (!data.success) {
      throw new Error(data.message || "Update failed");
    }

    /* =============================
       🔥 FORCE TABLE REFRESH (SAME AS CREATE)
    ============================== */
    setRefreshTrigger((prev) => prev + 1);

    /* =============================
       OPTIONAL: Instant UI update (optimistic)
       (safe even if you keep this)
    ============================== */
    setCompanyBadges((prev) =>
      prev.map((b) =>
        b.id === editingBadge.id
          ? {
              ...b,
              name: editingBadge.name,
              stall_no: editingBadge.stall_no,
              state: editingBadge.state,
              city: editingBadge.city,
              candidate_photo: data.photo
                ? data.photo + "?t=" + Date.now()
                : b.candidate_photo,
            }
          : b
      )
    );

    setShowEditModal(false);
    setEditingBadge(null);
    alert("✅ Badge updated successfully");

  } catch (err) {
    console.error("❌ Update badge error:", err);
    alert(err.message || "Server error");
  }
};


  const deleteBadge = async (badgeId) => {
    if (!window.confirm("Delete this badge?")) return;

    try {
      const res = await fetch(
        "https://inoptics.in/api/delete_exhibitor_badge.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: badgeId }),
        },
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Delete failed");
        return;
      }

      setCompanyBadges((prev) => prev.filter((b) => b.id !== badgeId));
      alert("Badge deleted");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const isBadgeEditable = (badge) => badge.badge_lock === 0;

  const handleRequestUnlock = async (badge) => {
    if (!badge?.id) {
      alert("Invalid badge");
      return;
    }

    // 🚫 Already requested
    if (badge.badge_lock === 2) {
      alert("⏳ Unlock request already sent. Please wait for admin approval.");
      return;
    }

    // 🚫 Already unlocked
    if (badge.badge_lock === 0) {
      alert("Badge is already unlocked");
      return;
    }

    if (!window.confirm("Do you want to request unlock for this badge?")) {
      return;
    }

    try {
      const res = await fetch(
        "https://inoptics.in/api/request_badge_unlock.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ badge_id: badge.id }),
        },
      );

      const data = await res.json();

      if (data.success) {
        alert(
          `📨 Unlock request sent for ${badge.name}. Waiting for admin approval.`,
        );

        // ✅ ONLY mark as requested (NOT unlocked)
        setCompanyBadges((prev) =>
          prev.map((b) => (b.id === badge.id ? { ...b, badge_lock: 2 } : b)),
        );
      } else {
        alert(data.message || "Failed to send unlock request");
      }
    } catch (error) {
      console.error("Unlock request error:", error);
      alert("Server error. Please try again.");
    }
  };

  // ===== LOADING STATE =====
  if (loading && exhibitors.length === 0) {
    return (
      <div className="exhibitor-form-container">
        <div className="form-wrapper">
          <div className="loading-state">
            <div className="spinner"></div>
            <h3>Please wait, Badges Loading...</h3>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER =====
  return (
    <>
      <div className="exhibitordashboard-declaration-content">
        <div className="exhibitor-heading">
          <div className="badge-info-bar">
            <div className="badge-counter">
              <span>Free Badges Allotted:</span>
              <strong>{freeBadges}</strong>
            </div>
            <div className="badge-counter">
              <span>Free Badges Remaining:</span>
              <strong>{freeRemaining}</strong>
            </div>
            <div className="badge-counter">
              <span>Extra Badges Requested:</span>
              <strong>{extraPaidBadges}</strong>
            </div>
          </div>
          <div className="exhibitor-heading-extra-badge-btn">
            <button
              className="generate-badge-btn"
              onClick={() => setShowLockConfirm(true)}
            >
              <FaUpload />
              Submit All Badges
            </button>

            <button
              className="generate-badge-btn"
              onClick={() => setShowBadgePopup(true)}
            >
              <FaCirclePlus />
              Add Badge
            </button>
          </div>
        </div>

        <div className="main-container-exhibitor">
          <div className="ExhibitorDashboard-exhibitor-badges-form slide-up-form">
            <div className="ExhibitorDashboard-badge-flex-container">
              <div className="ExhibitorDashboard-badge-left">
                <div className="ExhibitorDashboard-instruction-box">
                  <h3 className="ExhibitorDashboard-instruction-heading">
                    Exhibitor Badge Policy
                  </h3>
                  <div className="ExhibitorDashboard-instruction-text">
                    <br />
                    As per your stall size, you will receive{" "}
                    <strong>{freeBadges}</strong> complimentary badge
                    {freeBadges === 1 ? "" : "s"} for the exhibition.
                    <br />
                    <br />
                    Additional badges can be requested at a cost of ₹100 per
                    badge. However, any badge requests made after{" "}
                    <strong>28th February 2026</strong> will be charged at ₹200
                    per badge.
                    <br />
                    <br />
                    Once submitted, changes will be locked. Any updates can be
                    made only by requesting an unlock from the organiser. Please
                    ensure all details are correct before submitting.
                    <br />
                    <br />
                    Thank you for your cooperation.
                  </div>
                </div>
              </div>

              <div className="exhibitor-extra-badges-payment">
                {(() => {
                  const count = parseInt(extraPaidBadges || 0, 10);
                  const rate = new Date() > new Date("2026-02-28") ? 200 : 100;
                  const total = count * rate;

                  const companyState =
                    currentExhibitor?.state?.trim().toLowerCase() || "";
                  const isDelhi = companyState === "delhi";

                  const cgst = isDelhi ? total * 0.09 : 0;
                  const sgst = isDelhi ? total * 0.09 : 0;
                  const igst = !isDelhi ? total * 0.18 : 0;
                  const grandTotal = total + cgst + sgst + igst;

                  return (
                    <div className="ExhibitorDashboard-badge-right ExhibitorDashboard-exhibitor-billing-section">
                      <div className="ExhibitorDashboard-billing-summary-wrapper">
                        <h3>Billing Summary</h3>

                        <div className="ExhibitorDashboard-billing-summary-container">
                          <div className="ExhibitorDashboard-billing-line">
                            <span>Extra Badges</span>
                            <span>{count}</span>
                          </div>
                          <div className="ExhibitorDashboard-billing-line">
                            <span>Rate per Badge</span>
                            <span>₹{rate}</span>
                          </div>
                          <div className="ExhibitorDashboard-billing-line">
                            <span>Subtotal</span>
                            <span>₹{total.toFixed(2)}</span>
                          </div>
                          {isDelhi ? (
                            <>
                              <div className="ExhibitorDashboard-billing-line">
                                <span>CGST (9%)</span>
                                <span>₹{cgst.toFixed(2)}</span>
                              </div>
                              <div className="ExhibitorDashboard-billing-line">
                                <span>SGST (9%)</span>
                                <span>₹{sgst.toFixed(2)}</span>
                              </div>
                            </>
                          ) : (
                            <div className="ExhibitorDashboard-billing-line">
                              <span>IGST (18%)</span>
                              <span>₹{igst.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="ExhibitorDashboard-billing-line ExhibitorDashboard-grand-total">
                            <span>GRAND TOTAL</span>
                            <span>₹{grandTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {loadingCompanyBadges ? (
            <p className="loading-text">Loading badges...</p>
          ) : (
            <div className="badge-table-wrapper">
              {companyBadges.length === 0 ? (
                <p className="no-data">
                  No badges found. Click "Add Badge" to create one.
                </p>
              ) : (
                <table className="badge-table">
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Name</th>
                      <th>Stall</th>
                      <th>State</th>
                      <th>City</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody className="badge-table-scroll-list">
                    {companyBadges.map((badge) => (
                      <tr key={badge.id}>
                        <td>
                          <img
                            src={`https://inoptics.in/${badge.photo}`}
                            alt={badge.name}
                            className="badge-photo"
                          />
                        </td>

                        <td className="badge-name">{badge.name}</td>
                        <td>{badge.stall_no}</td>
                        <td>{badge.state}</td>
                        <td>{badge.city}</td>

                        <td className="actions">
                          {badge.badge_lock === 0 && (
                            <>
                              <button
                                className="lock-buttons-cell"
                                onClick={() => openEditModal(badge)}
                              >
                                <FaEdit />
                              </button>

                              {/* <button
                                className="lock-buttons-cell danger"
                                onClick={() => deleteBadge(badge.id)}
                              >
                                <FaTrash />
                              </button> */}

                              <button
                                className="lock-buttons-cell danger"
                                onClick={(e) =>
                                  handleUpdateBadgesAfterUnlockRequest(e, badge.id)
                                }
                              >
                                Submit Update Badge
                              </button>
                            </>
                          )}

                          {badge.badge_lock === 1 && (
                            <button
                              className="lock-buttons-cell"
                              onClick={() => handleRequestUnlock(badge)}
                            >
                              <FaLock />
                            </button>
                          )}

                          {badge.badge_lock === 2 && (
                            <span className="lock-buttons-cell unlock-button">
                              <FaUnlock />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {showLockConfirm && (
            <div className="lock-confirm-overlay">
              <div className="lock-confirm-modal">
                <h3>Confirm Submission</h3>

                <p>
                  Please review your details carefully before submitting.
                  <br />
                  <br />
                  Once submitted, your information will be locked and cannot be
                  edited unless an unlock request is sent to the organiser.
                  <br />
                  <br />
                  Additional badge requests can still be made later, as per the
                  applicable charges.
                  <br />
                  <br />
                  <strong>
                    By clicking Confirm, you acknowledge and agree to this
                    process.
                  </strong>
                </p>

                <div className="lock-confirm-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => setShowLockConfirm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="confirm-btn"
                    onClick={(e) => {
                      setShowLockConfirm(false); // close popup
                      handleLockBadgesAfterSubmit(e); // ✅ actual API call
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BADGE FORM MODAL */}
          {showBadgePopup && (
            <div className="modal-overlay">
              <div className="exhibitor-form-container">
                <div className="form-wrapper">
                  <button
                    className="exhibitor-modal-close"
                    onClick={() => {
                      setShowBadgePopup(false);
                      setPhotoPreview(null);
                      setFormData((prev) => ({
                        ...prev,
                        name: "",
                        candidate_photo: null,
                      }));
                    }}
                  >
                    <IoClose />
                  </button>
                  <h2>Exhibitor Badge Registration</h2>
                  <p>
                    Additional badges can be requested at a cost of ₹100 + GST
                    per badge.
                    <br />
                    Badge requests made after{" "}
                    <strong>28th February 2026</strong> will be charged at ₹200
                    per badge.
                  </p>

                  {exhibitors && exhibitors.length > 0 ? (
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
                          placeholder="Enter candidate name"
                          className="input-field"
                          required
                        />
                      </div>

                      <div className="candicate-preview">
                        <div className="form-group">
                          <label>Candidate Photo * (Max 2MB)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="file-input candicate-preview-input"
                            required={!photoPreview}
                          />
                        </div>

                        {photoPreview && (
                          <div className="photo-preview">
                            <img src={photoPreview} alt="Preview" />
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="submit-btn"
                      >
                        {loading ? "Submitting..." : "Generate Badge"}
                      </button>
                    </form>
                  ) : (
                    <div className="no-access">
                      <h3>⚠️ Access Denied</h3>
                      <p>Please login to access the badge registration form.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* EDIT MODAL */}
          {showEditModal && editingBadge && (
            <div className="modal-overlay">
              <div className="modal-box">
                <button
                  className="modal-close"
                  onClick={() => setShowEditModal(false)}
                >
                  <IoClose />
                </button>

                <h3>Edit Badge</h3>

                <input
                  value={editingBadge.name}
                  onChange={(e) =>
                    setEditingBadge({ ...editingBadge, name: e.target.value })
                  }
                  placeholder="Candidate Name"
                />

                <input
                  value={editingBadge.stall_no}
                  onChange={(e) =>
                    setEditingBadge({
                      ...editingBadge,
                      stall_no: e.target.value,
                    })
                  }
                  placeholder="Stall No"
                />

                <input
                  value={editingBadge.state}
                  onChange={(e) =>
                    setEditingBadge({ ...editingBadge, state: e.target.value })
                  }
                  placeholder="State"
                />

                <input
                  value={editingBadge.city}
                  onChange={(e) =>
                    setEditingBadge({ ...editingBadge, city: e.target.value })
                  }
                  placeholder="City"
                />

                {/* ===== IMAGE UPLOAD + PREVIEW ===== */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      setEditingBadge((prev) => ({
                        ...prev,
                        candidate_photo: file,
                        preview: URL.createObjectURL(file),
                      }));
                    }}
                  />

                  {editingBadge?.preview && (
                    <img
                      src={editingBadge.preview}
                      alt="preview"
                      width={50}
                      height={50}
                      style={{ borderRadius: "4px", objectFit: "cover" }}
                    />
                  )}
                </div>

                <button className="update-btn" onClick={updateBadge}>
                  Update Badge
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExhibitorBadgeForm;
