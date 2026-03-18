import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./ContractorStepsUnlockAdmin.css";

const ContractorStepsUnlockAdmin = () => {
  const [requests, setRequests] = useState({});
  const [formsMap, setFormsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [openCompany, setOpenCompany] = useState(null);

  const stepFormMap = {
    1: "appointed",
    2: "undertaking",
    3: "booth_design",
    4: "contractor_badge",
  };

  /* ================= FETCH ================= */

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://inoptics.in/api/get_all_contractor_unlock_requests.php"
      );
      const data = await res.json();
      if (data.success) setRequests(data.data);
    } catch {
      toast.error("Unlock fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedForms = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_all_uploaded_exhibitor_forms.php"
      );
      const json = await res.json();

      if (!json.success || !Array.isArray(json.data)) return;

      const grouped = {};
      json.data.forEach((row) => {
        const company = row.exhibitor_company_name?.trim();
        if (!company) return;

        if (!grouped[company]) grouped[company] = [];
        grouped[company].push(row);
      });

      setFormsMap(grouped);
    } catch {
      toast.error("Forms fetch failed");
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchUploadedForms();
  }, []);

  /* ================= ACTION ================= */

  const updateStatus = async (company, step) => {
    try {
      const fd = new FormData();
      fd.append("exhibitor_company_name", company);
      fd.append("step_number", step);
      fd.append("status", "approved");

      const res = await fetch(
        "https://inoptics.in/api/admin_contractor_step_unlock.php",
        { method: "POST", body: fd }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Unlocked successfully");
        fetchRequests();
      }
    } catch {
      toast.error("Update failed");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="admin-container">
      <h2 className="admin-heading">Contractor Unlock Requests</h2>

      {loading && <p className="loading">Loading...</p>}

      {!loading && Object.keys(formsMap).length === 0 && (
        <p className="empty">No data found</p>
      )}

      {Object.entries(formsMap).map(([company, forms]) => (
        <div key={company} className="company-card">
          {/* HEADER */}
          <div
            className="company-header"
            onClick={() =>
              setOpenCompany(openCompany === company ? null : company)
            }
          >
            <span>{company}</span>
            <span>{openCompany === company ? "▲" : "▼"}</span>
          </div>

          {/* BODY */}
          {openCompany === company && (
            <div className="company-body">
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Step</th>
                      <th>Form Type</th>
                      <th>View</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {forms.map((form) => {
                      const stepNumber = Object.keys(stepFormMap).find(
                        (key) => stepFormMap[key] === form.form_type
                      );

                      const companyRequests = requests[company] || [];

                      const matchedRequest = companyRequests.find(
                        (r) => r.step_number == stepNumber
                      );

                      return (
                        <tr key={form.id}>
                          <td>{stepNumber ? `Step ${stepNumber}` : "-"}</td>

                          <td>{form.form_type}</td>

                          <td>
                            <a
                              href={
                                form.file_preview_url ||
                                `https://inoptics.in/api/${form.file_path}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="btn view"
                            >
                              View
                            </a>
                          </td>

                          <td>
                            <span className={`status ${matchedRequest?.status || "locked"}`}>
                              {matchedRequest?.status || "locked"}
                            </span>
                          </td>

                          <td>
                            {matchedRequest?.status === "pending" && (
                              <button
                                className="btn approve"
                                onClick={() =>
                                  updateStatus(company, stepNumber)
                                }
                              >
                                Unlock
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContractorStepsUnlockAdmin;