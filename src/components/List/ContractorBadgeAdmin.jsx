import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import "./ContractorBadgeAdmin.css";

const ContractorBadgeAdmin = ({ exhibitorData }) => {
  console.log(" exhibitor data contractor badge", exhibitorData);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editData, setEditData] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [editPaymentRow, setEditPaymentRow] = useState({});

  // ✅ NEW STATES
  const [payments, setPayments] = useState({});
  const [paidRows, setPaidRows] = useState({});

  const getKey = (row) =>
    row.exhibitor_company_name?.trim().toLowerCase() +
    "_" +
    row.contractor_company_name?.trim().toLowerCase();

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchBadges();
    fetchPayments(); // ✅ NEW
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_all_contractor_badges.php",
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

  /* ================= FETCH PAYMENTS ================= */
  const fetchPayments = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/fetch_all_exhibitor_contractor_payments.php",
      );

      const data = await res.json();

      if (data.success) {
        console.log("API RESPONSE:", data); // debug

        // ✅ DIRECT USE (NO LOOP NEEDED)
        setPayments(data.payments || {});
        setPaidRows(data.paidRows || {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= PAYMENT ================= */

  const handlePaymentChange = (key, value) => {
    setPayments((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}), // ✅ important
        payment: value,
      },
    }));
  };

  const handlePaymentSubmit = async (row) => {
    try {
      const key = getKey(row);

      const stall_no =
        exhibitorData?.find(
          (ex) =>
            ex.company_name?.trim().toLowerCase() ===
            row.exhibitor_company_name?.trim().toLowerCase(),
        )?.stall_no || "-";

      const res = await fetch(
        "https://inoptics.in/api/exhibitor_contractor_payments.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: row.exhibitor_company_name,
            stall_no: stall_no,
            contractor_name: row.contractor_company_name,
            badge_quantity: row.badge_quantity,
            payment: payments[key]?.payment || 0, // ✅ FIX
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Payment saved");

        setPaidRows((prev) => ({
          ...prev,
          [key]: true,
        }));

        fetchPayments(); // ✅ refresh
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const handlePaymentUpdate = async (row) => {
    try {
      const key = getKey(row);

      const paymentData = payments[key];

      console.log("UPDATE DATA:", paymentData); // 🔍 DEBUG

      if (!paymentData || !paymentData.id) {
        toast.error("Payment ID missing");
        return;
      }

      const stall_no =
        exhibitorData?.find(
          (ex) =>
            ex.company_name?.trim().toLowerCase() ===
            row.exhibitor_company_name?.trim().toLowerCase(),
        )?.stall_no || "-";

      const res = await fetch(
        "https://inoptics.in/api/update_exhibitor_contractor_payments.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: paymentData.id,
            company_name: row.exhibitor_company_name,
            contractor_name: row.contractor_company_name,
            stall_no: stall_no,
            badge_quantity: row.badge_quantity,
            payment: paymentData.payment,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Updated successfully");

        setEditPaymentRow((prev) => ({
          ...prev,
          [key]: false,
        }));

        await fetchPayments(); // ✅ refresh
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  /* ================= UNLOCK ================= */
  const handleUnlock = async (id, row) => {
    setProcessing(id);

    try {
      const exhibitorCompany = row.exhibitor_company_name;
      const exhibitorEmail = row.exhibitor_email || "";

      console.log("DATA:", exhibitorCompany, exhibitorEmail);

      const res = await fetch(
        "https://inoptics.in/api/unlock_contractor_badge.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Badge unlocked successfully");
        fetchBadges();

        // 🔥 MAIL CALL
        console.log("CALLING MAIL API");

        const mailRes = await fetch(
          "https://inoptics.in/api/send_power_unlocked_mail.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              company_name: exhibitorCompany,
              email: exhibitorEmail,
              template_name: "InOptics 2026 @ Contractor Badge Unlock",
            }),
          },
        );

        const mailData = await mailRes.json();
        console.log("MAIL RESPONSE:", mailData);
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
        },
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
        },
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

  const exportToExcel = () => {
    if (!rows.length) {
      toast.error("No data to export");
      return;
    }

    const exportData = rows.map((row, index) => {
      let status = "Unlocked";

      if (Number(row.is_locked) === 1) status = "Locked";
      if (Number(row.is_locked) === 2) status = "Unlock Requested";

      const key =
        row.exhibitor_company_name?.trim().toLowerCase() +
        "_" +
        row.contractor_company_name?.trim().toLowerCase();

      // ✅ Stall No find
      const stall_no =
        exhibitorData?.find(
          (ex) =>
            ex.company_name?.trim().toLowerCase() ===
            row.exhibitor_company_name?.trim().toLowerCase(),
        )?.stall_no || "-";

      // ✅ Payment get
      const payment = payments[key]?.payment || 0;

      return {
        ID: index + 1,
        "Exhibitor Company": row.exhibitor_company_name,
        "Contractor Company": row.contractor_company_name,
        "Stall No": stall_no, // ✅ NEW
        "Badge Quantity": row.badge_quantity,
        Payment: payment, // ✅ NEW
        Status: status,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Contractor Badges");

    XLSX.writeFile(workbook, "Contractor_Badge_Report.xlsx");

    toast.success("Excel exported successfully");
  };

  const filteredRows = rows.filter((row) => {
    const term = searchTerm.toLowerCase();

    return (
      row.exhibitor_company_name?.toLowerCase().includes(term) ||
      row.contractor_company_name?.toLowerCase().includes(term)
    );
  });

  /* ================= RENDER ================= */

  return (
    <div className="table-scroll-wrapper">
      <div className="contractor-table-container">
        <div className="contractor-top-bar">
          <button className="contractor-export-btn" onClick={exportToExcel}>
            Export Excel
          </button>

          <input
            type="text"
            placeholder="Search Exhibitor / Contractor..."
            value={searchTerm}
            className="contractor-search"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table className="contractor-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Exhibitor Company</th>
              <th>Stall No</th>
              <th>Contractor Company</th>
              <th>Badge Quantity</th>
              <th>Status</th>
              <th>Payments</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8">Loading...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="8">No badge records</td>
              </tr>
            ) : (
              filteredRows.map((row, index) => {
                const lockStatus = Number(row.is_locked);

                const stall_no =
                  exhibitorData?.find(
                    (ex) =>
                      ex.company_name?.trim().toLowerCase() ===
                      row.exhibitor_company_name?.trim().toLowerCase(),
                  )?.stall_no || "-";

                const key =
                  row.exhibitor_company_name?.trim().toLowerCase() +
                  "_" +
                  row.contractor_company_name?.trim().toLowerCase();

                return (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.exhibitor_company_name}</td>
                    <td>{stall_no}</td>
                    <td>{row.contractor_company_name}</td>
                    <td>{row.badge_quantity}</td>

                    <td>
                      {lockStatus === 0 && <span>Unlocked</span>}
                      {lockStatus === 1 && <span>Locked</span>}
                      {lockStatus === 2 && <span>Requested</span>}
                    </td>

                    {/* ✅ PAYMENT */}
                    <td className="contractor-table-input-row">
                      <input
                        type="number"
                        value={payments[key]?.payment || ""}
                        disabled={paidRows[key] && !editPaymentRow[key]}
                        onChange={(e) =>
                          handlePaymentChange(key, e.target.value)
                        }
                      />

                      {!paidRows[key] ? (
                        <button
                          className="contractor-btn contractor-submit-btn"
                          onClick={() => handlePaymentSubmit(row)}
                        >
                          Submit
                        </button>
                      ) : editPaymentRow[key] ? (
                        <button
                          className="contractor-btn contractor-save-btn"
                          onClick={() => handlePaymentUpdate(row)}
                        >
                          New Update
                        </button>
                      ) : (
                        <button
                          className="contractor-btn contractor-edit-btn"
                          onClick={() =>
                            setEditPaymentRow((prev) => ({
                              ...prev,
                              [key]: true,
                            }))
                          }
                        >
                          Update
                        </button>
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
                          onClick={() => handleUnlock(row.id, row)}
                        >
                          {processing === row.id ? "Processing..." : "Unlock"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

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
    </div>
  );
};

export default ContractorBadgeAdmin;
