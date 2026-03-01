import React, { useState } from "react";
import "./ExhibitorFacia.css";

const ExhibitorFaciaForm = ({
  companyName,
  stallNo,
  city
}) => {

  const [faciaCompanyName, setFaciaCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!faciaCompanyName.trim()) {
      setMessage("Facia company name is required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "https://inoptics.in/api/submit_facia_company.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exhibitor_company_name: companyName,
            facia_company_name: faciaCompanyName.toUpperCase(), // extra safety
            stall_no: stallNo,
            city: city,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setMessage("Facia submitted successfully ✅");
        setFaciaCompanyName("");
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch (error) {
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="facia-container">
      <form className="facia-form" onSubmit={handleSubmit}>
        <h2>Exhibitor Facia Form</h2>

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
          <label>Facia Company Name</label>
          <input
            type="text"
            placeholder="Enter Facia Company Name"
            value={faciaCompanyName}
            onChange={(e) =>
              setFaciaCompanyName(e.target.value.toUpperCase())
            }
            style={{ textTransform: "uppercase" }} // visual uppercase
            required
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
};

export default ExhibitorFaciaForm;