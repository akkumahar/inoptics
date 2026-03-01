import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./ContractorBadgeAdmin.css";

const ContractorBadgeAdmin = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

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
    toast.error("Server error while unlocking");
  } finally {
    setProcessing(null);
  }
};



  return (
    <div className="table-scroll-wrapper">
      <div className="contractor-table-container">
        <table className="contractor-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Exhibitor Company</th>
              <th>Contractor Company</th>
              <th>Badge Quantity</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Loading...</td>
              </tr>
            ) : !rows || rows.length === 0 ? (
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

      <td>
        {lockStatus === 2 && (
          <button
            className="btn approve"
            disabled={processing === row.id}
            onClick={() => handleUnlock(row.id)}
          >
            {processing === row.id
              ? "Processing..."
              : "Approve Unlock"}
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
    </div>
  );
};

export default ContractorBadgeAdmin;