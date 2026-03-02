import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./AdminPowerRequirement.css";

const AdminPowerRequirement = () => {
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [openCompany, setOpenCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /* ================= FETCH ALL POWER DATA ================= */
  useEffect(() => {
    fetchAllPower();
  }, []);

  const fetchAllPower = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_all_power_requirement.php"
      );
      const result = await res.json();

      if (result.success && Array.isArray(result.data)) {
        setRows(result.data);

        const uniqueCompanies = [
          ...new Set(
            result.data
              .filter((item) => item.company_name)
              .map((item) => item.company_name.trim())
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
      const res = await fetch(
        "https://inoptics.in/api/delete_power.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Deleted successfully");
        fetchAllPower();
      }
    } catch {
      toast.error("Delete failed");
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
          company.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((company, index) => {
          const isOpen = openCompany === company;
          const companyRows = groupedData[company] || [];

          return (
            <div key={index} className="accordion">
              <div
                className="accordion-header"
                onClick={() =>
                  setOpenCompany(isOpen ? null : company)
                }
              >
                {company}
                <span>{isOpen ? "▲" : "▼"}</span>
              </div>

              {isOpen && (
                <div className="accordion-body">
                  <table>
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
                            <td>
                              <button
                                className="delete-btn"
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
                        (sum, item) =>
                          sum + Number(item.power_required || 0),
                        0
                      )}
                    </p>

                    <p>
                      Total Amount: ₹{" "}
                      {companyRows.reduce(
                        (sum, item) =>
                          sum + Number(item.total_amount || 0),
                        0
                      )}
                    </p>

                    <p>
                      Locked:{" "}
                      {companyRows[0]?.is_locked === "1"
                        ? "Yes"
                        : "No"}
                    </p>

                    <p>
                      Unlock Requested:{" "}
                      {companyRows[0]?.unlock_requested === "1"
                        ? "Yes"
                        : "No"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default AdminPowerRequirement;