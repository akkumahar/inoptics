import React, { useEffect, useState } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import "./ExhibitorBadgeSeries.css";

const SITE = "https://inoptics.in";

const ExhibitorBadgeSeries = () => {
  const [unlockRequests, setUnlockRequests] = useState([]);
  const [openCompany, setOpenCompany] = useState(null);
  const [editingBadge, setEditingBadge] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [previewBadgeId, setPreviewBadgeId] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ NEW

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_badge_unlock_requests.php"
      );
      const data = await res.json();
      if (data.success) {
        setUnlockRequests(data.requests);
      }
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const grouped = unlockRequests.reduce((acc, badge) => {
    const company = badge.exhibitor_company_name;
    if (!acc[company]) acc[company] = [];
    acc[company].push(badge);
    return acc;
  }, {});

  const handleAcceptUnlock = async (badgeId) => {
    const res = await fetch(
      "https://inoptics.in/api/accept_badge_unlock.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badge_id: badgeId }),
      }
    );
    const data = await res.json();
    if (data.success) {
      toast.success("Badge unlocked");
      fetchRequests();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this badge?")) return;

    const res = await fetch(
      "https://inoptics.in/api/delete_exhibitor_badge.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }
    );

    const data = await res.json();
    if (data.success) {
      toast.success("Deleted");
      fetchRequests();
    }
  };

  const updateBadge = async () => {
    const res = await fetch(
      "https://inoptics.in/api/edit_exhibitor_badge.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBadge),
      }
    );

    const data = await res.json();
    if (data.success) {
      toast.success("Updated");
      setShowEditModal(false);
      fetchRequests();
    }
  };

  return (
    <div className="ebu-wrapper">
      <h2 className="ebu-title">Badge Unlock Requests</h2>

      {/* ✅ LOADING STATE */}
      {loading && (
        <div className="ebu-loading">
          <div className="ebu-spinner"></div>
          <p>Loading badge requests...</p>
        </div>
      )}

      {/* ✅ EMPTY STATE */}
      {!loading && unlockRequests.length === 0 && (
        <div className="ebu-empty">No unlock requests found</div>
      )}

      {/* ✅ DATA */}
      {!loading &&
        Object.keys(grouped).map((company) => (
          <div key={company} className="ebu-card">
            <div
              className="ebu-card-header"
              onClick={() =>
                setOpenCompany(openCompany === company ? null : company)
              }
            >
              <strong>{company}</strong>
              <span>{openCompany === company ? "▲" : "▼"}</span>
            </div>

            {openCompany === company && (
              <div className="ebu-dropdown">
                <table className="ebu-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Stall</th>
                      <th>City</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[company].map((badge) => (
                      <tr key={badge.id}>
                        <td>{badge.name}</td>
                        <td>{badge.stall_no}</td>
                        <td>{badge.city}</td>
                        <td className="ebu-actions">
                          <button
                            className="ebu-btn"
                            onClick={() => {
                              setPreviewBadgeId(badge.id);
                              setShowPreviewModal(true);
                            }}
                          >
                            <FaEye />
                          </button>

                          <button
                            className="ebu-btn"
                            onClick={() => {
                              setEditingBadge(badge);
                              setShowEditModal(true);
                            }}
                          >
                            <FaEdit />
                          </button>

                          <button
                            className="ebu-btn ebu-danger"
                            onClick={() => handleDelete(badge.id)}
                          >
                            <FaTrash />
                          </button>

                          <button
                            className="ebu-btn ebu-approve"
                            onClick={() =>
                              handleAcceptUnlock(badge.id)
                            }
                          >
                            <FaCircleCheck />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

      {/* EDIT MODAL */}
      {showEditModal && editingBadge && (
        <div className="ebu-modal-overlay">
          <div className="ebu-modal">
            <button
              className="ebu-close"
              onClick={() => setShowEditModal(false)}
            >
              <IoClose />
            </button>

            <h3>Edit Badge</h3>

            <input
              value={editingBadge.name}
              onChange={(e) =>
                setEditingBadge({
                  ...editingBadge,
                  name: e.target.value,
                })
              }
            />

            <input
              value={editingBadge.stall_no}
              onChange={(e) =>
                setEditingBadge({
                  ...editingBadge,
                  stall_no: e.target.value,
                })
              }
            />

            <input
              value={editingBadge.city}
              onChange={(e) =>
                setEditingBadge({
                  ...editingBadge,
                  city: e.target.value,
                })
              }
            />

            <button
              className="ebu-update-btn"
              onClick={updateBadge}
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* PREVIEW */}
      {showPreviewModal && previewBadgeId && (
        <div className="ebu-modal-overlay">
          <div className="ebu-modal ebu-preview-modal">
            <button
              className="ebu-close"
              onClick={() => setShowPreviewModal(false)}
            >
              <IoClose />
            </button>

            <img
              src={`${SITE}/api/exhibitor_badges_preview.php?id=${previewBadgeId}&t=${Date.now()}`}
              alt="Badge"
              className="ebu-preview-img"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExhibitorBadgeSeries;