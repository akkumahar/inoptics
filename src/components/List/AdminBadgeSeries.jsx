import React, { useEffect, useState } from "react";
import "./AdminBadgeSeries.css";

const AdminBadgeSeries = () => {
  const [series, setSeries] = useState("");
  const [number, setNumber] = useState("");
  const [savedSeries, setSavedSeries] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
    } catch {
      setMessage("Failed to fetch series");
    }
  };

  /* ================= SAVE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!series.trim() || !number) {
      setMessage("Please fill all fields");
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
        setMessage(data.message || "Save failed");
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
    if (!window.confirm("Delete badge series?")) return;

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
    <div className="badge-series-wrapper">
      <h2>Badge Series Settings</h2>

      <form onSubmit={handleSubmit}>
        <input
          value={series}
          onChange={(e) => setSeries(e.target.value)}
          placeholder="Series Code"
        />

        <input
          type="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Starting Number"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save / Update"}
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}

      {/* ===== Saved Preview Section ===== */}
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
  );
};

export default AdminBadgeSeries;