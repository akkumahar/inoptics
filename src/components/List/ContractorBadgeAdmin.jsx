import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./ContractorBadgeAdmin.css";

const ContractorBadgeAdmin = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editData, setEditData] = useState(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_all_contractor_badges.php"
      );

      const data = await res.json();

      if (data.success && Array.isArray(data.records)) {
        setRows(data.records);
      } else {
        setRows([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load badge records");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UNLOCK ================= */
  const handleUnlock = async (id) => {
    setProcessing(id);

    try {
      const res = await fetch(
        "https://inoptics.in/api/unlock_contractor_badge.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Badge unlocked successfully");
        fetchBadges();
      } else {
        toast.error(data.message || "Unlock failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setProcessing(null);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      const res = await fetch(
        "https://inoptics.in/api/delete_contractor_badge.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Deleted successfully");
        fetchBadges();
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  /* ================= EDIT ================= */
  const handleEditClick = (row) => {
    setEditData({ ...row });
    setShowEditPopup(true);
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/update_contractor_badge.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editData),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Updated successfully");
        setShowEditPopup(false);
        fetchBadges();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="table-scroll-wrapper">
      <div className="contractor-table-container">
        <table className="contractor-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Exhibitor Company</th>
              <th>Contractor Company</th>
              <th>Badge Quantity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Loading...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="6">No badge records</td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const lockStatus = Number(row.is_locked);

                return (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.exhibitor_company_name}</td>
                    <td>{row.contractor_company_name}</td>
                    <td>{row.badge_quantity}</td>

                    <td>
                      {lockStatus === 0 && (
                        <span className="status-unlocked">Unlocked</span>
                      )}
                      {lockStatus === 1 && (
                        <span className="status-locked">Locked</span>
                      )}
                      {lockStatus === 2 && (
                        <span className="status-requested">
                          Unlock Requested
                        </span>
                      )}
                    </td>

                    <td className="action-buttons">
                      <button
                        className="btn edit"
                        onClick={() => handleEditClick(row)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn delete"
                        onClick={() => handleDelete(row.id)}
                      >
                        Delete
                      </button>

                      {lockStatus === 2 && (
                        <button
                          className="btn approve"
                          disabled={processing === row.id}
                          onClick={() => handleUnlock(row.id)}
                        >
                          {processing === row.id
                            ? "Processing..."
                            : "Unlock"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================= EDIT POPUP ================= */}
      {showEditPopup && editData && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>Edit Contractor Badge</h3>

            <input
              type="text"
              value={editData.contractor_company_name || ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  contractor_company_name: e.target.value,
                })
              }
              placeholder="Contractor Company"
            />

            <input
              type="number"
              value={editData.badge_quantity || ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  badge_quantity: e.target.value,
                })
              }
              placeholder="Badge Quantity"
            />

            <div className="popup-actions">
              <button
                onClick={() => setShowEditPopup(false)}
                className="btn delete"
              >
                Cancel
              </button>

              <button onClick={handleUpdate} className="btn approve">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorBadgeAdmin;