import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./AdminPowerRequirement.css";

const AdminPowerRequirement = ({ exhibitorData }) => {
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [openCompany, setOpenCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [powerPaymentSummary, setPowerPaymentSummary] = useState({});

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchAllPower();
  }, []);


  useEffect(() => {
  const summary = {};

  rows.forEach((row) => {
    const company = row.company_name;
    const amount = Number(row.total_amount || 0);
    const state = (row.state || "").toLowerCase();

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (state === "delhi") {
      cgst = amount * 0.09;
      sgst = amount * 0.09;
    } else if (state) {
      igst = amount * 0.18;
    }

    const total = amount + cgst + sgst + igst;

    if (!summary[company]) {
      summary[company] = {
        amount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: 0,
        cleared: 0,
        pending: 0,
      };
    }

    summary[company].amount += amount;
    summary[company].cgst += cgst;
    summary[company].sgst += sgst;
    summary[company].igst += igst;
    summary[company].total += total;
  });

  setPowerPaymentSummary(summary);
}, [rows]);


  const fetchAllPower = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        "https://inoptics.in/api/get_all_power_requirement.php",
      );

      const result = await res.json();

      if (result.success && Array.isArray(result.data)) {
        setRows(result.data);

        const uniqueCompanies = [
          ...new Set(
            result.data
              .filter((i) => i.company_name)
              .map((i) => i.company_name.trim()),
          ),
        ];

        setCompanies(uniqueCompanies);
      } else {
        toast.error("No data found");
      }
    } catch {
      toast.error("Failed to load data");
    }

    setLoading(false);
  };

  /* ================= GROUP DATA ================= */

  const groupedData = rows.reduce((acc, row) => {
    if (!row.company_name) return acc;

    if (!acc[row.company_name]) {
      acc[row.company_name] = [];
    }

    acc[row.company_name].push(row);
    return acc;
  }, {});

  /* ================= DELETE ================= */

  const handleDelete = async (row) => {
    if (!window.confirm("Delete this entry?")) return;

    const res = await fetch("https://inoptics.in/api/delete_power_by_id.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: row.company_name,
        id: row.id,
      }),
    });

    const result = await res.json();

    if (result.success) {
      toast.success("Deleted successfully");
      fetchAllPower();
    } else {
      toast.error(result.error);
    }
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {
    try {
      const payload = {
        company_name: editingRow.company_name,
        entries: [
          {
            day: editingRow.day,
            price_per_kw: editingRow.price_per_kw,
            power_required: editingRow.power_required,
            phase: editingRow.phase,
          },
        ],
      };

      const res = await fetch(
        "https://inoptics.in/api/update_power_requirement.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Updated successfully");
        setShowEditModal(false);
        fetchAllPower();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch {
      toast.error("Server error");
    }
  };

  /* ================= SEND MAIL ================= */

  const handleSendPowerMail = async (row) => {
    const toastId = toast.loading("Sending power update mails...");

    try {
      await sendPowerRevisedMail(row.company_name, row.email);
      await sendPowerVendorMail(row.company_name);

      toast.dismiss(toastId);
      toast.success("Power update mails sent successfully");
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to send mail");
    }
  };

  const sendPowerVendorMail = async (companyName) => {
    await fetch("https://inoptics.in/api/send_power_vendor_mail.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_name: "Revised Power Load Vendor",
        company_name: companyName,
      }),
    });
  };

  const sendPowerRevisedMail = async (companyName, email) => {
    await fetch("https://inoptics.in/api/send_power_revised_mail.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_name: companyName,
        template_name: "POWER LOAD INCREASED",
        email: email,
      }),
    });
  };

  return (
    <div className="admin-power-wrapper">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <p>Loading...</p>}

      {companies
        .filter((company) =>
          company.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .map((company, index) => {
          const isOpen = openCompany === company;
          const companyRows = groupedData[company] || [];

          return (
            <div key={index} className="power-accordion">
              <div
                className="power-accordion-header"
                onClick={() => setOpenCompany(isOpen ? null : company)}
              >
                {company}
                <div className="power-summary">
  {powerPaymentSummary[company] && (
    <>
      <span>Power Amount: ₹{powerPaymentSummary[company].amount.toFixed(2)}</span>

      {companyRows?.[0]?.state?.toLowerCase() === "delhi" ? (
        <>
          <span>CGST: ₹{powerPaymentSummary[company].cgst.toFixed(2)}</span>
          <span>SGST: ₹{powerPaymentSummary[company].sgst.toFixed(2)}</span>
        </>
      ) : (
        <span>IGST: ₹{powerPaymentSummary[company].igst.toFixed(2)}</span>
      )}

      <span>Grand Total: ₹{powerPaymentSummary[company].total.toFixed(2)}</span>
      <span>Cleared: ₹{powerPaymentSummary[company].cleared.toFixed(2)}</span>
      <span>Pending: ₹{powerPaymentSummary[company].pending.toFixed(2)}</span>
    </>
  )}
</div>
                <span>{isOpen ? "▲" : "▼"}</span>
              </div>

              {isOpen && (
                <div className="power-accordion-body">
                  <table className="power-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Day</th>
                        <th>Price/KW</th>
                        <th>Power</th>
                        <th>Phase</th>
                        <th>Amount</th>
                        <th>SGST (9%)</th>
                        <th>CGST (9%)</th>
                        <th>IGST (18%)</th>
                        <th>Grand Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {companyRows.map((row, i) => {
                        const amount = Number(row.total_amount || 0);

                        const state = (row.state || "").trim().toLowerCase();

                        let sgst = 0;
                        let cgst = 0;
                        let igst = 0;

                        if (state === "delhi") {
                          sgst = amount * 0.09;
                          cgst = amount * 0.09;
                        } else if (state !== "") {
                          igst = amount * 0.18;
                        }

                        const grandTotal = amount + sgst + cgst + igst;
                        return (
                          <tr key={row.id}>
                            <td>{i + 1}</td>
                            <td>{row.day}</td>
                            <td>{row.price_per_kw}</td>
                            <td>{row.power_required}</td>
                            <td>{row.phase}</td>

                            <td>{amount.toFixed(2)}</td>
                            <td>{sgst.toFixed(2)}</td>
                            <td>{cgst.toFixed(2)}</td>
                            <td>{igst.toFixed(2)}</td>
                            <td>{grandTotal.toFixed(2)}</td>

                            <td className="power-action-cell">
                              <button
                                className="power-edit-btn"
                                onClick={() => {
                                  setEditingRow(row);
                                  setShowEditModal(true);
                                }}
                              >
                                Edit
                              </button>

                              <button
                                className="power-delete-btn"
                                onClick={() => handleDelete(row)}
                              >
                                Delete
                              </button>

                              <button
                                className="power-mail-btn"
                                onClick={() => handleSendPowerMail(row)}
                              >
                                Send Mail Update Power
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

      {/* EDIT MODAL */}

      {showEditModal && editingRow && (
        <div className="power-modal-overlay">
          <div className="power-modal">
            <h3>Edit Power Requirement</h3>

            <label>Day</label>
            <input type="text" value={editingRow.day} readOnly />

            <label>Price Per KW</label>
            <input type="number" value={editingRow.price_per_kw} readOnly />

            <label>Power Required</label>
            <input
              type="number"
              value={editingRow.power_required}
              onChange={(e) =>
                setEditingRow({
                  ...editingRow,
                  power_required: e.target.value,
                })
              }
            />

            <label>Phase</label>

            <div className="phase-radio">
              <label>
                <input
                  type="radio"
                  value="Single"
                  checked={editingRow.phase === "Single"}
                  onChange={(e) =>
                    setEditingRow({ ...editingRow, phase: e.target.value })
                  }
                />
                Single Phase
              </label>

              <label>
                <input
                  type="radio"
                  value="Three"
                  checked={editingRow.phase === "Three"}
                  onChange={(e) =>
                    setEditingRow({ ...editingRow, phase: e.target.value })
                  }
                />
                Three Phase
              </label>
            </div>

            <div className="btn-main-action">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>

              <button onClick={handleUpdate}>Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPowerRequirement;
