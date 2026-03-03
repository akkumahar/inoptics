import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./FasciaNameAdmin.css";

const FasciaNameAdmin = () => {
  const [companies, setCompanies] = useState([]);
  const [openCompany, setOpenCompany] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editData, setEditData] = useState(null);

  /* ================= FETCH ALL DATA ================= */
  useEffect(() => {
    fetchAllFascia();
  }, []);

  const fetchAllFascia = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_all_fascia.php"
      );
      const data = await res.json();

      if (data.success) {
        setRows(data.records);

        // 🔥 Get Unique Company Names
        const uniqueCompanies = [
          ...new Set(
            data.records.map((item) => item.exhibitor_company_name)
          ),
        ];

        setCompanies(uniqueCompanies);
      }
    } catch {
      toast.error("Failed to load fascia data");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this fascia?")) return;

    try {
      const res = await fetch(
        "https://inoptics.in/api/delete_fascia.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Deleted successfully");
        fetchAllFascia();
      }
    } catch {
      toast.error("Delete failed");
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
        "https://inoptics.in/api/update_fascia.php",
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
        fetchAllFascia();
      }
    } catch {
      toast.error("Update failed");
    }
  };

  /* ================= GROUP DATA ================= */
  const groupedData = rows.reduce((acc, row) => {
    if (!acc[row.exhibitor_company_name])
      acc[row.exhibitor_company_name] = [];
    acc[row.exhibitor_company_name].push(row);
    return acc;
  }, {});

  return (
    <div className="fascia-admin-container">
      {/* 🔎 SEARCH BAR */}
<div className="fascia-search-bar">
  <input
    type="text"
    placeholder="Search company or fascia name..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

      {companies
  .filter((company) => {
    const term = searchTerm.toLowerCase();

    // Company match
    if (company.toLowerCase().includes(term)) return true;

    // Fascia name match
    const fasciaMatch = groupedData[company]?.some((row) =>
      row.facia_company_name?.toLowerCase().includes(term)
    );

    return fasciaMatch;
  })
  .map((company, index) => {
        const isOpen = openCompany === company;

        return (
          <div key={index} className="accordion-item">
            {/* HEADER */}
            <div
              className="accordion-header"
              onClick={() =>
                setOpenCompany(isOpen ? null : company)
              }
            >
              {company}
              <span>{isOpen ? "▲" : "▼"}</span>
            </div>

            {/* BODY */}
            {isOpen && (
              <div className="accordion-body fascia-scroll">
                <table className="fascia-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fascia Name</th>
                      <th>Stall No</th>
                      <th>City</th>
                      <th>Edit</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedData[company]?.map((row, i) => (
                      <tr key={row.id}>
                        <td>{i + 1}</td>
                        <td>{row.facia_company_name}</td>
                        <td>{row.stall_no}</td>
                        <td>{row.city}</td>

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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* ================= EDIT POPUP ================= */}
      {showEditPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>Edit Fascia</h3>

            <input
              type="text"
              value={editData.facia_company_name}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  facia_company_name: e.target.value.toUpperCase(),
                })
              }
            />

            <div className="popup-actions">
              <button onClick={() => setShowEditPopup(false)} className="btn delete">
                Cancel
              </button>
              <button className="btn approve" onClick={handleUpdate}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FasciaNameAdmin;