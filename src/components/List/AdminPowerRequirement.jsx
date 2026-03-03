import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./AdminPowerRequirement.css";

const AdminPowerRequirement = () => {
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [openCompany, setOpenCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  /* ================= FETCH ALL POWER DATA ================= */
  useEffect(() => {
    fetchAllPower();
  }, []);

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
              .filter((item) => item.company_name)
              .map((item) => item.company_name.trim()),
          ),
        ];

        setCompanies(uniqueCompanies);
      } else {
        toast.error("No data found");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load power data");
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
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;

    try {
      const res = await fetch("https://inoptics.in/api/delete_power.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Deleted successfully");
        fetchAllPower();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/update_power.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRow),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Updated successfully");
        setShowEditModal(false);
        fetchAllPower();
      } else {
        toast.error("Update failed");
      }
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div className="admin-power-wrapper">
      {/* SEARCH BAR */}
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
                        <th>Total</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companyRows.length === 0 ? (
                        <tr>
                          <td colSpan="7">No Data</td>
                        </tr>
                      ) : (
                        companyRows.map((row, i) => (
                          <tr key={row.id}>
                            <td>{i + 1}</td>
                            <td>{row.day}</td>
                            <td>{row.price_per_kw}</td>
                            <td>{row.power_required}</td>
                            <td>{row.phase}</td>
                            <td>{row.total_amount}</td>
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
                                onClick={() => handleDelete(row.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* PAYMENT SUMMARY */}
                  <div className="payment-card">
                    <h4>Payment Summary</h4>

                    <p>
                      Total Power:{" "}
                      {companyRows.reduce(
                        (sum, item) => sum + Number(item.power_required || 0),
                        0,
                      )}
                    </p>

                    <p>
                      Total Amount: ₹{" "}
                      {companyRows.reduce(
                        (sum, item) => sum + Number(item.total_amount || 0),
                        0,
                      )}
                    </p>

                    <p>
                      Locked: {companyRows[0]?.is_locked === "1" ? "Yes" : "No"}
                    </p>

                    <p>
                      Unlock Requested:{" "}
                      {companyRows[0]?.unlock_requested === "1" ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

      {showEditModal && editingRow && (
        <div className="power-modal-overlay">
          <div className="power-modal">
            <h3>Edit Power Requirement</h3>

            <label>Day</label>
            <input
              type="text"
              value={editingRow.day}
              onChange={(e) =>
                setEditingRow({ ...editingRow, day: e.target.value })
              }
            />

            <label>Price Per KW</label>
            <input
              type="number"
              value={editingRow.price_per_kw}
              onChange={(e) =>
                setEditingRow({
                  ...editingRow,
                  price_per_kw: e.target.value,
                })
              }
            />

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
            <input
              type="text"
              value={editingRow.phase}
              onChange={(e) =>
                setEditingRow({
                  ...editingRow,
                  phase: e.target.value,
                })
              }
            />

            <label>Total Amount</label>
            <input
              type="number"
              value={editingRow.total_amount}
              onChange={(e) =>
                setEditingRow({
                  ...editingRow,
                  total_amount: e.target.value,
                })
              }
            />

            <div className="btn-main-action">
              <button className="power-edit-btn-update" onClick={handleUpdate}>Update</button>
            <button className="power-delete-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPowerRequirement;
