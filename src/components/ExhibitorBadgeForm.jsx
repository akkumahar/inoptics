import React, { useState, useEffect } from "react";
import QRCode from "qrcode"; // Install: npm install qrcode
import "./ExhibitorBadgeForm.css";
import { FaCirclePlus } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { FaPrint } from "react-icons/fa";

const ExhibitorBadgeForm = () => {
  const [exhibitors, setExhibitors] = useState([]);
  const [stallList, setStallList] = useState([]);
  const [generatedBadges, setGeneratedBadges] = useState([]);
  const [showBadgeForm, setShowBadgeForm] = useState(false);
  const [printStatus, setPrintStatus] = useState({});

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
  const [usedBadges, setUsedBadges] = useState(0); // optional, agar dikhana ho

  const [extraBadges, setExtraBadges] = useState(0);
  const [extraPaidBadges, setExtraPaidBadges] = useState(0);
  const [freeRemaining, setFreeRemaining] = useState(0);
  const [extraRemaining, setExtraRemaining] = useState(0); // 👈 THIS

  const [isLocked, setIsLocked] = useState(false);
  const [showBadgePopup, setShowBadgePopup] = useState(false);
  const [companyBadges, setCompanyBadges] = useState([]);
  const [loadingCompanyBadges, setLoadingCompanyBadges] = useState(false);

  // shorthand for first exhibitor
  const currentExhibitor = exhibitors[0];

  useEffect(() => {
    checkLoginAndFetchData();
  }, []);

  // free badges fetch api call
  //  localStorage merge

  useEffect(() => {
    if (!formData.exhibitor_company_name) return;

    fetch(
      `https://inoptics.in/api/get_Exhibitor_badges.php?company_name=${encodeURIComponent(
        formData.exhibitor_company_name,
      )}`,
    )
      .then((res) => res.json())
      .then((data) => {
        const freeRem = Number(data.free_remaining) || 0;
        const extraRem = Number(data.extra_remaining) || 0;

        setFreeBadges(Number(data.free_badges) || 0);
        setExtraBadges(Number(data.extra_badges) || 0);
        setUsedBadges(Number(data.used_badges) || 0);

        setFreeRemaining(freeRem);
        setExtraRemaining(extraRem);

        checkLockStatus(freeRem, extraRem);
        console.log(data);
      });
  }, [formData.exhibitor_company_name]);

  useEffect(() => {
    if (!formData.exhibitor_company_name) return;

    setLoadingCompanyBadges(true);

    fetch(
      `https://inoptics.in/api/get_exhibitor_badges_by_company.php?company_name=${encodeURIComponent(
        formData.exhibitor_company_name,
      )}`,
    )
      .then((res) => res.json())
      .then((data) => {
        // API se expected: { success: true, badges: [] }
        setCompanyBadges(Array.isArray(data.badges) ? data.badges : []);
        console.log("COMPANY BADGES:", data.badges);
        console.log(companyBadges);
      })
      .catch((err) => {
        console.error("Badge fetch error:", err);
        setCompanyBadges([]);
      })
      .finally(() => {
        setLoadingCompanyBadges(false);
      });
  }, [formData.exhibitor_company_name]);

  useEffect(() => {
    if (!formData.exhibitor_company_name) return;

    setLoadingCompanyBadges(true);

    fetch(
      `https://inoptics.in/api/get_exhibitor_badges_by_company.php?company_name=${encodeURIComponent(
        formData.exhibitor_company_name,
      )}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCompanyBadges(data.badges || []);

          // 🔥 AUTO SET BUTTON STATUS
          const statusMap = {};
          (data.badges || []).forEach((badge) => {
            statusMap[badge.id] = badge.print_status;
            // ready | done | disabled
          });

          setPrintStatus(statusMap);
        }
      })
      .catch((err) => console.error("Badge fetch error", err))
      .finally(() => setLoadingCompanyBadges(false));
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

  const checkLockStatus = (freeRem, extraRem) => {
    if (freeRem === 0 && extraRem === 0) {
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }
  };

  // ✅ Tumhara handleSubmit QR ke saath
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔒 HARD LOCK CHECK (free + extra dono khatam)
    if (freeRemaining === 0 && extraRemaining === 0) {
      setMessage({
        type: "error",
        text: "No badges remaining. Please contact admin.",
      });
      return;
    }

    // ---------------- VALIDATIONS ----------------
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

    try {
      // ---------------- SEND BADGE ----------------
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("candidate_photo", formData.candidate_photo);
      formDataToSend.append("company_name", formData.exhibitor_company_name);
      formDataToSend.append("stall_no", formData.stall_no);
      formDataToSend.append("state", formData.state || "");
      formDataToSend.append("city", formData.city || "");
      formDataToSend.append("exhibitor_id", formData.exhibitor_id || "");

      const response = await fetch("https://inoptics.in/api/submit-badge.php", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      // ---------------- SUCCESS ----------------
      if (data.success) {
        setMessage({
          type: "success",
          text: "Badge created successfully!",
        });
        console.log("SUBMIT RESPONSE:", data);
        // 🔽 AUTO DOWNLOAD BADGE (ADDED PART)
        const badgeId = Number(data.badge_id);

        const downloadUrl = `https://inoptics.in/api/exhibitor_badges_preview.php?id=${badgeId}`;

        const fileRes = await fetch(downloadUrl);
        const blob = await fileRes.blob();

        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = blobUrl;
        link.download = `badge-${badgeId}.png`;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

        // 🔄 REFRESH BADGE COUNTS
        const badgeRes = await fetch(
          `https://inoptics.in/api/get_Exhibitor_badges.php?company_name=${encodeURIComponent(
            formData.exhibitor_company_name,
          )}`,
        );

        const badgeData = await badgeRes.json();

        const freeRem = parseInt(badgeData.free_remaining, 10) || 0;
        const extraRem = parseInt(badgeData.extra_remaining, 10) || 0;

        setFreeBadges(parseInt(badgeData.free_badges, 10) || 0);
        setExtraBadges(parseInt(badgeData.extra_badges, 10) || 0);
        setUsedBadges(parseInt(badgeData.used_badges, 10) || 0);

        setFreeRemaining(freeRem);
        setExtraRemaining(extraRem);

        // 🔒 LOCK / UNLOCK FINAL DECISION
        checkLockStatus(freeRem, extraRem);

        // ---------------- UI UPDATE ----------------
        setGeneratedBadges((prev) => [
          {
            badge_id: data.badge_id,
            name: formData.name.trim(),
            company: formData.exhibitor_company_name,
            stall: formData.stall_no,
            qr_code: data.qr_code,
            photo: data.photo,
            created_at: new Date().toLocaleString(),
          },
          ...prev,
        ]);

        setFormData((prev) => ({
          ...prev,
          name: "",
          candidate_photo: null,
        }));
        setPhotoPreview(null);
      }
      // ---------------- FAILURE ----------------
      else {
        setMessage({
          type: "error",
          text: data.message || "Failed to create badge",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Server error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAndUpdate = async (badge) => {
    // ⬇️ DIRECT DOWNLOAD
    const link = document.createElement("a");
    link.href = badge.qr_code; // qr_code full URL hona chahiye
    link.download = `badge-${badge.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 🔁 STATUS = DONE (backend)
    const res = await fetch(
      "https://inoptics.in/api/update_badge_print_status.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          badge_id: badge.id,
          status: "done",
        }),
      },
    );

    const data = await res.json();

    if (data.success) {
      // 🔒 Disable button instantly
      setPrintStatus((prev) => ({
        ...prev,
        [badge.id]: "done",
      }));
    }
  };

  const handleExhibitorBadgesSubmit = async (e) => {
    e.preventDefault();

    if (!currentExhibitor?.company_name) {
      alert("Invalid exhibitor data!");
      return;
    }

    const payload = {
      company_name: currentExhibitor.company_name,
      free_badges: currentExhibitor.free_badges || 0,
      extra_badges: extraPaidBadges || 0,
    };

    try {
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
        alert("✅ Exhibitor badges submitted successfully!");

        // === Send Mail to Admin ===
        await fetch("https://inoptics.in/api/send_extra_badges_mail.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: currentExhibitor.company_name,
            template_name: "InOptics 2026 Exhibitor Extra Badges",
          }),
        });
        console.log("✅ Mail sent to Admin successfully!");
        setExtraPaidBadges("");
      } else {
        alert(data.error || "Failed to update exhibitor badges.");
      }
    } catch (error) {
      console.error("❌ Error updating exhibitor badges:", error);
      alert("❌ Error updating exhibitor badges.");
    }
  };

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

  return (
    <>
      <div className="exhibitordashboard-declaration-content">
        <div className="exhibitor-heading">
          <div className="exhibitor-heading-extra-badge-btn">
            <h3>Exhibitor Badges List </h3>

            <form
              className="ExhibitorDashboard-extra-badges-form-grid"
              onSubmit={handleExhibitorBadgesSubmit}
            >
              <div className="ExhibitorDashboard-badge-fields-row">
                {/* Extra Badges */}
                <div className="ExhibitorDashboard-badge-box">
                  <div className="ExhibitorDashboard-field-row">
                    <input
                      type="number"
                      id="extra_badges"
                      name="extra_badges"
                      value={extraPaidBadges || ""}
                      onChange={(e) => setExtraPaidBadges(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* === Submit / Unlock Button === */}
              <div className="ExhibitorDashboard-form-submit">
                <button type="submit" className="submit-btn">
                  Submit
                </button>
              </div>
            </form>
          </div>

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
              <span>Extra Badges Allotted:</span>
              <strong>{extraBadges}</strong>
            </div>
            <div className="badge-counter">
              <span>Extra Badges Remaining:</span>
              <strong>{extraRemaining}</strong>
            </div>
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
          {loadingCompanyBadges ? (
            <p className="loading-text">Loading badges...</p>
          ) : (
            <div className="badge-table-wrapper">
              {companyBadges.length === 0 ? (
                <p className="no-data">No badges found</p>
              ) : (
                <table className="badge-table">
                  <thead>
                    <tr>
                      <th>Candidate Photo</th>
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

                        <td>
                          <button
                            className={`print-toggle 
                            ${printStatus[badge.id] === "ready" ? "ready" : ""}
                            ${printStatus[badge.id] === "done" ? "done" : ""}
                          `}
                            disabled={printStatus[badge.id] !== "ready"}
                            onClick={() => handleDownloadAndUpdate(badge)}
                          >
                            <FaPrint />
                            {printStatus[badge.id] === "done"
                              ? "disable"
                              : "enable"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {showBadgePopup && (
            <div className="modal-overlay">
              <div className=" ">
                <div className="exhibitor-form-container">
                  <div className="form-wrapper">
                    <button
                      className="exhibitor-modal-close"
                      onClick={() => setShowBadgePopup(false)}
                    >
                      <IoClose />
                    </button>
                    <h2>Exhibitor Badge Registration</h2>

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
                        <span>Extra Badges Allotted:</span>
                        <strong>{extraBadges}</strong>
                      </div>
                      <div className="badge-counter">
                        <span>Extra Badges Remaining:</span>
                        <strong>{extraRemaining}</strong>
                      </div>
                    </div>

                    {message.text && (
                      <div className={`message ${message.type}`}>
                        {message.text}
                      </div>
                    )}

                    {exhibitors && exhibitors.length > 0 ? (
                      <form onSubmit={handleSubmit} className="badge-form">
                        {/* COMPANY & STALL */}
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

                        {/* STATE & CITY */}
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

                        {/* CANDIDATE NAME */}
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
                            disabled={isLocked}
                          />
                        </div>

                        {/* PHOTO */}
                        <div className=" candicate-preview">
                          <div className="form-group ">
                            <label>Candidate Photo * (Max 2MB)</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoChange}
                              className="file-input  candicate-preview-input "
                              required={!photoPreview}
                              disabled={isLocked}
                            />
                          </div>

                          {photoPreview && (
                            <div className="photo-preview">
                              <img src={photoPreview} alt="Preview" />
                            </div>
                          )}
                        </div>

                        {/* SUBMIT */}
                        <button
                          type="submit"
                          disabled={loading || isLocked}
                          className="submit-btn"
                        >
                          {isLocked ? " Badge Limit Reached" : " Submit Badge"}
                        </button>
                      </form>
                    ) : (
                      <div className="no-access">
                        <h3>⚠️ Access Denied</h3>
                        <p>
                          Please login to access the badge registration form.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="ExhibitorDashboard-exhibitor-badges-form slide-up-form">
            <div className="ExhibitorDashboard-badge-flex-container">
              {/* Left Side */}
              <div className="ExhibitorDashboard-badge-left">
                {/* === Instructions === */}
                <div className="ExhibitorDashboard-instruction-box">
                  <h3 className="ExhibitorDashboard-instruction-heading">
                    Exhibitor Badge Policy
                  </h3>
                  <div className="ExhibitorDashboard-instruction-text">
                    <br />
                    As per your stall size, you will receive{" "}
                    <strong>{freeBadges}</strong>{" "}
                    complimentary badge
                    {currentExhibitor.free_badges === 1 ? "" : "s"} for the
                    exhibition.
                    <br />
                    <br />
                    Additional badges can be requested at a cost of ₹100 per
                    badge. However, any badge requests made after{" "}
                    <strong>28th February 2026</strong> will be charged at ₹200
                    per badge.
                    <br />
                    <br />
                    We kindly request you to order only the number of badges you
                    truly need, as issuing excess badges poses a potential
                    security risk.
                    <br />
                    <br />
                    Thank you for your cooperation.
                  </div>
                </div>

                {/* === Extra Badges Form === */}
              </div>

              {/* === Right Side: Billing Summary === */}
              <div className="exhibitor-extra-badges-payment">
                {(() => {
                  const count = parseInt(extraBadges || 0, 10);
                  const rate = new Date() > new Date("2026-02-28") ? 200 : 100; // fixed invalid date
                  const total = count * rate;

                  const companyState =
                    currentExhibitor.state?.trim().toLowerCase() || "";
                  const isDelhi = companyState === "delhi";

                  const cgst = isDelhi ? total * 0.09 : 0;
                  const sgst = isDelhi ? total * 0.09 : 0;
                  const igst = !isDelhi ? total * 0.18 : 0;
                  const grandTotal = total + cgst + sgst + igst;

                  if (currentExhibitor.company_name) {
                    localStorage.setItem(
                      `grandTotal_badges_${currentExhibitor.company_name}`,
                      grandTotal.toFixed(2),
                    );
                  }

                  return (
                    <div className="ExhibitorDashboard-badge-right ExhibitorDashboard-exhibitor-billing-section">
                      <div className="ExhibitorDashboard-billing-summary-wrapper">
                        <h3>Particulars</h3>

                        <div className="ExhibitorDashboard-billing-summary-container">
                          <div className="ExhibitorDashboard-billing-line">
                            <span>Extra Badges</span>
                            <span>{count}</span>
                          </div>
                          <div className="ExhibitorDashboard-billing-line">
                            <span>Total Amount</span>
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
        </div>
      </div>
    </>
  );
};

export default ExhibitorBadgeForm;
