import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./ContractorBadgeAdmin.css";

const ContractorBadgeAdmin = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [openCompany, setOpenCompany] = useState(null);

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchBadges();

    // 🔥 Auto refresh every 5 sec (optional but recommended)
    const interval = setInterval(fetchBadges, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_all_contractor_badges.php"
      );
      const data = await res.json();

      console.log("ADMIN BADGE DATA:", data);

      const records = data.records || data.data || [];

      if (data.success && Array.isArray(records)) {
        setRows(records);
      } else {
        setRows([]);
      }
    } catch {
      toast.error("Failed to load badge records");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  /* 🔓 ACCEPT UNLOCK */
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
        toast.error("Unlock failed");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setProcessing(null);
    }
  };

  /* DELETE */
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
      }
    } catch {
      toast.error("Server error");
    }
  };

  /* EDIT */
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
    } catch {
      toast.error("Server error");
    }
  };

  const groupedData = rows.reduce((acc, row) => {
    const company = row.exhibitor_company_name;
    if (!acc[company]) acc[company] = [];
    acc[company].push(row);
    return acc;
  }, {});

  return (
    <div className="admin-container">

      {Object.keys(groupedData).map((company) => (
        <div key={company} className="accordion-item">
          <div
  className="accordion-header"
  onClick={() =>
    setOpenCompany(openCompany === company ? null : company)
  }
>
  <div className="header-left">
    {company}

    {/* 🔴 Show Only If Unlock Requested */}
    {groupedData[company].some(
      (row) => Number(row.is_locked) === 2
    ) && (
      <span className="unlock-badge">
        Unlock Requested
      </span>
    )}
  </div>

  <span>{openCompany === company ? "▲" : "▼"}</span>
</div>

          {openCompany === company && (
            <table className="contractor-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Contractor</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Edit</th>
                  <th>Delete</th>
                  <th>Accept</th>
                </tr>
              </thead>

              <tbody>
                {groupedData[company].map((row, index) => {
                  const lockStatus = Number(row.is_locked);

                  return (
                    <tr key={row.id}>
                      <td>{index + 1}</td>
                      <td>{row.contractor_company_name}</td>
                      <td>{row.badge_quantity}</td>

                      <td>
                        {lockStatus === 0 && "Unlocked"}
                        {lockStatus === 1 && "Locked"}
                        {lockStatus === 2 && "Unlock Requested"}
                      </td>

                      <td>
                        <button
                          className="btn edit"
                          onClick={() => handleEditClick(row)}
                        >
                          Edit
                        </button>
                      </td>

                      <td>
                        <button
                          className="btn delete"
                          onClick={() => handleDelete(row.id)}
                        >
                          Delete
                        </button>
                      </td>

                      <td>
                        {lockStatus === 2 && (
                          <button
                            className="btn approve"
                            onClick={() => handleUnlock(row.id)}
                          >
                            Accept
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ))}

      {/* EDIT POPUP */}
      {showEditPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>Edit Badge</h3>

            <input
              type="text"
              value={editData.contractor_company_name}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  contractor_company_name: e.target.value,
                })
              }
            />

            <input
              type="number"
              value={editData.badge_quantity}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  badge_quantity: e.target.value,
                })
              }
            />

            <div className="popup-actions">
              <button onClick={() => setShowEditPopup(false)} className="btn delete">
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