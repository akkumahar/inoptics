import React, { useEffect, useState } from "react";
import "./ExhibitorBadgeSeries.css";
import { IoClose } from "react-icons/io5";
import {
 
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";

import { toast } from "react-toastify";

const SITE = "https://inoptics.in";

const ExhibitorBadgeSeries = () => {
  const [series, setSeries] = useState("");
  const [number, setNumber] = useState("");
  const [savedSeries, setSavedSeries] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [unlockRequests, setUnlockRequests] = useState([]);
  const [editingBadge, setEditingBadge] = useState(null);
  const [companyBadges, setCompanyBadges] = useState([]);
  const [previewBadgeId, setPreviewBadgeId] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= FETCH EXISTING ================= */
  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_exhibitor_badge_series.php",
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
        },
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
    if (!window.confirm("Are you sure you want to delete badge series?"))
      return;

    try {
      const res = await fetch(
        "https://inoptics.in/api/delete_exhibitor_badge_series.php",
        { method: "POST" },
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

  const openEditModal = (badge) => {
    setEditingBadge({
      id: badge.id,
      name: badge.name,
      stall_no: badge.stall_no,
      state: badge.state,
      city: badge.city,
    });
    setShowEditModal(true);
  };

  const openPreview = (badgeId) => {
    setPreviewBadgeId(badgeId);
    setShowPreviewModal(true);
  };

  const closePreview = () => {
    setShowPreviewModal(false);
    setPreviewBadgeId(null);
  };

  const handleEdit = (req) => {
    console.log("Edit", req);
  };

  const updateBadge = async () => {
    if (!editingBadge) return;

    try {
      const res = await fetch(
        "https://inoptics.in/api/edit_exhibitor_badge.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingBadge),
        },
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Update failed");
        return;
      }

      setCompanyBadges((prev) =>
        prev.map((b) =>
          b.id === editingBadge.id ? { ...b, ...editingBadge } : b,
        ),
      );

      setShowEditModal(false);
      setEditingBadge(null);
      alert("Badge updated successfully");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleDeleteRequest = async (badgeId) => {
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

  const handleAcceptUnlock = async (badgeId) => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/accept_badge_unlock.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ badge_id: badgeId }),
        },
      );

      const data = await res.json();

      if (data.success) {
        fetchBadgeUnlockRequests(); // 🔄 remove from list
        alert("🔓 Badge unlocked");
      }
    } catch {
      alert("Unlock failed");
    }
  };

  const fetchBadgeUnlockRequests = async () => {
    const res = await fetch(
      "https://inoptics.in/api/get_badge_unlock_requests.php",
    );
    return await res.json();
  };

  const handlePreview = (badge) => {
    window.open(
      `https://inoptics.in/api/exhibitor_badges_preview.php?id=${badge.id}`,
      "_blank",
    );
  };

  useEffect(() => {
    const loadRequests = async () => {
      const data = await fetchBadgeUnlockRequests();
      if (data.success) {
        setUnlockRequests(data.requests);
      }
    };
    loadRequests();
  }, []);

  return (
    <div className="badge-series-layout">
      <div className="badge-series-grid">
        {/* ================= LEFT : UNLOCK REQUEST TABLE ================= */}
        <div className="badge-unlock-requests">
          <h2>Badge Unlock Requests</h2>

          <table className="unlock-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Name</th>
                <th>Stall</th>
                <th>City</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {unlockRequests.length ? (
                unlockRequests.map((badge) => (
                  <tr key={badge.id}>
                    <td>{badge.exhibitor_company_name}</td>
                    <td>{badge.name}</td>
                    <td>{badge.stall_no}</td>
                    <td>{badge.city}</td>
                    <td className="action">
                      <button
                        type="button"
                        className="eye-btn"
                        title="View Badge"
                        onClick={() => openPreview(badge.id)}
                      >
                        <FaEye />
                      </button>
                      <button  onClick={() => openEditModal(badge)}><FaEdit /></button>
                      <button className="danger" onClick={() => handleDeleteRequest(badge.id)}>
                        <FaTrash />
                      </button>
                      <button
                       className="eye-btn"
                        onClick={() => handleAcceptUnlock(badge.id)}
                      >
                        <FaCircleCheck />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" align="center">
                    No unlock requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= RIGHT : EXISTING FORM ================= */}
        <div className="badge-series-wrapper">
          <h2>Badge Series Settings</h2>

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

          {savedSeries && (
            <div className="saved-preview">
              <p>
                <strong>Series:</strong> {savedSeries.exhibitor_badge_series}
              </p>
              <p>
                <strong>Number:</strong> {savedSeries.exhibitor_badge_num}
              </p>

              <div className="btn-row">
                <button onClick={handleLoadForEdit}>Update</button>
                <button className="delete-btn" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PREVIEW MODAL (badge image) */}
      {showPreviewModal && previewBadgeId && (
        <div className="modal-overlay">
          <div className="modal-box preview-box">
            <button className="modal-close" onClick={closePreview}>
              <IoClose />
            </button>

            <div className="badge-preview-wrapper">
              <img
                src={`${SITE}/api/exhibitor_badges_preview.php?id=${previewBadgeId}&t=${Date.now()}`}
                alt="Badge"
                className="badge-preview-image"
                onError={() => toast.error("Badge image failed to load")}
              />
            </div>
          </div>
        </div>
      )}

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
                setEditingBadge({ ...editingBadge, stall_no: e.target.value })
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

            <button className="update-btn" onClick={updateBadge}>
              Update Badge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExhibitorBadgeSeries;
