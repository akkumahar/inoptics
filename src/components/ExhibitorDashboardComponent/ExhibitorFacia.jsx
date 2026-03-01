import React, { useEffect, useState } from "react";
import "./ExhibitorFacia.css";

const ExhibitorFaciaForm = ({
  companyName,
  stallNo,
  city,
}) => {
  const [faciaCompanyName, setFaciaCompanyName] = useState("");
  const [existingData, setExistingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ================= FETCH EXISTING DATA ================= */
  useEffect(() => {
    if (companyName) {
      fetchFasciaData();
    }
  }, [companyName]);

  const fetchFasciaData = async () => {
    try {
      const res = await fetch(
        `https://inoptics.in/api/get_all_fascia.php?company=${encodeURIComponent(
          companyName
        )}`
      );

      const data = await res.json();

      if (data.success && data.records.length > 0) {
        setExistingData(data.records[0]);
      } else {
        setExistingData(null);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!faciaCompanyName.trim()) {
      setMessage("Fascia company name is required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "https://inoptics.in/api/submit_facia_company.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exhibitor_company_name: companyName,
            facia_company_name: faciaCompanyName.toUpperCase(),
            stall_no: stallNo,
            city: city,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setMessage("Fascia submitted successfully ✅");
        setFaciaCompanyName("");
        fetchFasciaData(); // 🔥 refresh card
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch {
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="facia-wrapper">
      {/* LEFT SIDE FORM */}
      <div className="facia-container">
        <form className="facia-form" onSubmit={handleSubmit}>
          <h2>Exhibitor Fascia Form</h2>

          <div className="form-group">
            <label>Company Name</label>
            <input type="text" value={companyName || ""} disabled />
          </div>

          <div className="form-group">
            <label>Stall No</label>
            <input type="text" value={stallNo || ""} disabled />
          </div>

          <div className="form-group">
            <label>City</label>
            <input type="text" value={city || ""} disabled />
          </div>

          <div className="form-group">
            <label>Fascia Name</label>
            <input
              type="text"
              placeholder="Enter Fascia Name"
              value={faciaCompanyName}
              onChange={(e) =>
                setFaciaCompanyName(e.target.value.toUpperCase())
              }
              style={{ textTransform: "uppercase" }}
              required
            />
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>

          {message && <p className="form-message">{message}</p>}
        </form>
      </div>

      {/* RIGHT SIDE CARD */}
      {existingData && (
        <div className="facia-card">
          <h3>Fascia Details</h3>
          <p><strong>Company:</strong> {existingData.exhibitor_company_name}</p>
          <p><strong>Fascia Name:</strong> {existingData.facia_company_name}</p>
          <p><strong>Stall:</strong> {existingData.stall_no}</p>
          <p><strong>City:</strong> {existingData.city}</p>
        </div>
      )}
    </div>
  );
};

export default ExhibitorFaciaForm;