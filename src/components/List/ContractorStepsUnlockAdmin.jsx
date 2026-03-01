import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./ContractorStepsUnlockAdmin.css";

const ContractorStepsUnlockAdmin = () => {

  const [requests, setRequests] = useState({});
  const [loading, setLoading] = useState(false);
  const [openCompany, setOpenCompany] = useState(null);

  const [rejectModal, setRejectModal] = useState({
    show: false,
    company: "",
    step: null,
    reason: ""
  });

  /* ================= FETCH ================= */
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://inoptics.in/api/get_all_contractor_unlock_requests.php"
      );
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (err) {
      toast.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (company, step, status, reason = "") => {
    try {
      const fd = new FormData();
      fd.append("exhibitor_company_name", company);
      fd.append("step_number", step);
      fd.append("status", status);
      fd.append("reject_reason", reason);

      const res = await fetch(
        "https://inoptics.in/api/admin_contractor_step_unlock.php",
        { method: "POST", body: fd }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Updated successfully");
        fetchRequests();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Update failed");
    }
  };

  /* ================= REJECT SUBMIT ================= */
  const submitReject = () => {
    if (!rejectModal.reason.trim()) {
      toast.error("Enter rejection reason");
      return;
    }

    updateStatus(
      rejectModal.company,
      rejectModal.step,
      "rejected",
      rejectModal.reason
    );

    setRejectModal({ show: false, company: "", step: null, reason: "" });
  };

  return (
    <div className="admin-wrapper">

      <h2 className="admin-title">Contractor Unlock Requests</h2>

      {loading && <p>Loading...</p>}

      {!loading && Object.keys(requests).length === 0 && (
        <p>No requests found</p>
      )}

      {Object.entries(requests).map(([company, items]) => (
        <div key={company} className="company-card">

          {/* Accordion Header */}
          <div
            className="company-header"
            onClick={() =>
              setOpenCompany(openCompany === company ? null : company)
            }
          >
            <span>{company}</span>
            <span>{openCompany === company ? "▲" : "▼"}</span>
          </div>

          {/* Table */}
          {openCompany === company && (
            <div className="company-body">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>Status</th>
                    <th>Reject Reason</th>
                    <th>Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((req, i) => (
                    <tr key={i}>
                      <td>Step {req.step_number}</td>

                      <td>
                        <span className={`status ${req.status}`}>
                          {req.status}
                        </span>
                      </td>

                      <td>
                        {req.reject_reason || "—"}
                      </td>

                      <td>{req.updated_at}</td>

                      <td>
                        {req.status === "pending" && (
                          <>
                            <button
                              className="btn approve"
                              onClick={() =>
                                updateStatus(
                                  company,
                                  req.step_number,
                                  "approved"
                                )
                              }
                            >
                              Approve
                            </button>

                            <button
                              className="btn reject"
                              onClick={() =>
                                setRejectModal({
                                  show: true,
                                  company,
                                  step: req.step_number,
                                  reason: ""
                                })
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {req.status === "locked" && (
                          <button
                            className="btn force"
                            onClick={() =>
                              updateStatus(
                                company,
                                req.step_number,
                                "approved"
                              )
                            }
                          >
                            Force Unlock
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {/* ================= REJECT MODAL ================= */}
      {rejectModal.show && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Reject Step {rejectModal.step}</h3>

            <textarea
              placeholder="Enter rejection reason..."
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal({
                  ...rejectModal,
                  reason: e.target.value
                })
              }
            />

            <div className="modal-actions">
              <button
                className="btn cancel"
                onClick={() =>
                  setRejectModal({ show: false })
                }
              >
                Cancel
              </button>

              <button
                className="btn reject"
                onClick={submitReject}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContractorStepsUnlockAdmin;