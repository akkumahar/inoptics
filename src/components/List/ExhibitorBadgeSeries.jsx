import React, { useEffect, useState } from "react";
import "./ExhibitorBadgeSeries.css";

const ExhibitorBadgeSeries = () => {
  const [series, setSeries] = useState("");
  const [number, setNumber] = useState("");
  const [savedSeries, setSavedSeries] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= FETCH EXISTING ================= */
  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_exhibitor_badge_series.php"
      );
      const data = await res.json();

      if (data.success && data.data) {
        setSavedSeries(data.data);
      }
    } catch (err) {
      console.error("Fetch failed");
    }
  };

  /* ================= SUBMIT / CREATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!series.trim() || number === "") {
      setMessage("Please fill both fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        "https://inoptics.in/api/update_exhibitor_badge_series.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exhibitor_badge_series: series.trim(),
            exhibitor_badge_num: Number(number),
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Series saved successfully");
        setSeries("");
        setNumber("");
        fetchSeries();
      } else {
        setMessage(data.message || "Failed");
      }
    } catch {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD FOR UPDATE ================= */
  const handleLoadForEdit = () => {
    if (!savedSeries) return;

    setSeries(savedSeries.exhibitor_badge_series);
    setNumber(savedSeries.exhibitor_badge_num);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete badge series?")) return;

    try {
      const res = await fetch(
        "https://inoptics.in/api/delete_exhibitor_badge_series.php",
        { method: "POST" }
      );

      const data = await res.json();

      if (data.success) {
        setSavedSeries(null);
        setSeries("");
        setNumber("");
        setMessage("🗑 Series deleted");
      } else {
        setMessage("Delete failed");
      }
    } catch {
      setMessage("Server error");
    }
  };

  return (
    <div className="badge-series-layout">
      <div className="badge-series-wrapper">
        <h2>Badge Series Settings</h2>

        {/* ================= FORM ================= */}
        <form onSubmit={handleSubmit} className="badge-series-form">
          <div className="form-group">
            <label>Badge Series Code</label>
            <input
              type="text"
              value={series}
              onChange={(e) => setSeries(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Starting / Current Number</label>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Series"}
          </button>

          {message && <p className="form-message">{message}</p>}
        </form>

        {/* ================= SAVED PREVIEW ================= */}
        {savedSeries && (
          <div className="saved-preview">
          
            <p>
              <strong>Series:</strong>{" "}
              {savedSeries.exhibitor_badge_series}
            </p>
            <p>
              <strong>Number:</strong>{" "}
              {savedSeries.exhibitor_badge_num}
            </p>

            <div className="btn-row">
              <button onClick={handleLoadForEdit}>
                Update
              </button>

              <button
                className="delete-btn"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExhibitorBadgeSeries;
