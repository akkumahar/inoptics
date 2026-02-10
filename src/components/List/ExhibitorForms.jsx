import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { FaEye, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./ExhibitorForms.css";

const SITE = "https://inoptics.in";

const ExhibitorForms = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openCompany, setOpenCompany] = useState({});

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch(`${SITE}/api/get_contractor_form_history.php`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setRows(data.data);

          if (data.data.length) {
            setOpenCompany({
              [data.data[0].company_name]: true
            });
          }
        } else {
          toast.error("History load failed");
        }
      })
      .catch(() => toast.error("Server error"))
      .finally(() => setLoading(false));
  }, []);

  /* ================= GROUP ================= */
  const grouped = useMemo(() => {
    const map = {};
    rows.forEach(r => {
      if (!map[r.company_name]) map[r.company_name] = [];
      map[r.company_name].push(r);
    });
    return map;
  }, [rows]);

  const filteredCompanies = Object.keys(grouped).filter(name =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCompany = (name) => {
    setOpenCompany(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  /* ================= FILE URL ================= */
const buildFileUrl = (path) => {
  if (!path) return "#";

  const fileName = path.split("/").pop(); // only file name

  return `${SITE}/api/company-signed-forms/${fileName}`;
};

  if (loading) return <p>Loading history...</p>;

  return (
    <div className="history-dashboard">

      {/* SEARCH */}
      <div className="history-topbar">
        <input
          type="text"
          placeholder="Search by company name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="history-search"
        />
      </div>

      {/* NO DATA */}
      {filteredCompanies.length === 0 && (
        <p style={{ textAlign: "center", marginTop: 40 }}>
          No forms history found
        </p>
      )}

      {/* GROUPS */}
      {filteredCompanies.map(company => (
        <div className="history-company-card" key={company}>

          <div
            className="history-company-header"
            onClick={() => toggleCompany(company)}
          >
            <strong>{company}</strong>
            {openCompany[company] ? <FaChevronUp /> : <FaChevronDown />}
          </div>

          {openCompany[company] && (
            <div className="history-table-scroll">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Form Type</th>
                    <th>File Name</th>
                    <th>File</th>
                    <th>Status</th>
                    <th>Reject Reason</th>
                    <th>Created</th>
                  </tr>
                </thead>

                <tbody>
                  {grouped[company].map(r => {
                    const fileUrl = buildFileUrl(r.file_path);
                    const fileName =
                      r.file_path?.split("/").pop() || "—";

                    return (
                      <tr key={r.id}>
                        <td>{r.company_name || "—"}</td>

                        <td style={{ textTransform: "capitalize" }}>
                          {(r.form_type || "").replace("_"," ")}
                        </td>

                        <td className="mono">{fileName}</td>

                        <td>
                          {r.file_path ? (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-link"
                            >
                              <FaEye /> View
                            </a>
                          ) : "—"}
                        </td>

                        <td>
                          <span className={
                            r.approval_status === "approved"
                              ? "status-approved"
                              : "status-rejected"
                          }>
                            {r.approval_status || "—"}
                          </span>
                        </td>

                        <td>{r.reject_reason || "—"}</td>

                        <td>
                          {r.created_at
                            ? new Date(r.created_at).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          )}

        </div>
      ))}

    </div>
  );
};

export default ExhibitorForms;
