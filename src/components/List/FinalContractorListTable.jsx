import React from "react";
import { FaEye } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { IoMdCloseCircle } from "react-icons/io";

const FinalContractorListTable = ({
  activeContractorTab,
  finalListData,
  formsMap,
  boothIdMap,
  approveBooth,
  setSelectedBoothId,
  setSelectedCompany,
  setRejectReason,
  setShowRejectPopup,
  showRejectPopup,
  boothDesignStatus,
  boothRejectReason,
  setCurrentStep,
  rejecting,
  rejectReason,
  selectedBoothId,
  handleRejectBoothDesign,
}) => {
  if (activeContractorTab !== "Booth Design") return null;

  return (
    <div className="final-list-container">
      <div className="table-wrapper">
        <table className="final-list-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>EXHIBITOR</th>
              <th>CONTRACTOR</th>
              <th>BADGES</th>
              <th>FORMS</th>
              {/* <th>SECURITY</th> */}
              {/* <th>BOOTH DESIGN</th> */}
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {finalListData.map((item, index) => {
              const company = item.exhibitor_company_name?.trim();
              const forms = formsMap[company] || [];
              const boothId = boothIdMap[company] || null;

              return (
                <tr key={index}>
                  <td>{index + 1}</td>

                  <td>{company}</td>

                  <td>{item.contractor_name}</td>

                  <td>{item.contractor_company_name}</td>

                  {/* FORMS */}
                  <td>
                    <div className="forms-icons-row">
                      {(() => {
                        const boothFile = forms.find(
                          (f) => f.booth_design && f.booth_design.trim() !== "",
                        );

                        return boothFile ? (
                          <a
                            href={`https://inoptics.in/api/${boothFile.booth_design}`}
                            target="_blank"
                            rel="noreferrer"
                            className="form-view-icon"
                          >
                            View Booth Design
                          </a>
                        ) : (
                          <span style={{ color: "#999" }}>—</span>
                        );
                      })()}
                    </div>
                  </td>

                  {/* SECURITY */}
                  {/* <td>{item.security_status || "-"}</td> */}

                  {/* BOOTH DESIGN */}
                  {/* <td>{item.booth_design_status || "-"}</td> */}

                  {/* STATUS */}
                  <td>{item.status || "Pending"}</td>

                  {/* ACTION */}
                  <td>
                    <div className="contractor-final-list-btn">
                      {/* Approve */}
                      <button
                        onClick={() => approveBooth(company)}
                        className="btn approve"
                      >
                        Approve
                      </button>

                      {/* Reject */}
                      <button
                        onClick={() => {
                          if (!boothId) {
                            alert("Booth design not found");
                            return;
                          }

                          setSelectedBoothId(boothId);
                          setSelectedCompany(company);
                          setRejectReason("");
                          setShowRejectPopup(true);
                        }}
                        className="btn reject"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {boothDesignStatus === "rejected" && (
          <div className="contractor-thankyou-card rejected">
            <h3>Booth Design Rejected</h3>
            <p>❌ Your booth design has been rejected.</p>

            {boothRejectReason && (
              <p className="reject-reason">
                <strong>Reason:</strong> {boothRejectReason}
              </p>
            )}

            <button className="doc-btn" onClick={() => setCurrentStep(3)}>
              Re-upload Booth Design
            </button>
          </div>
        )}

        {showRejectPopup && (
          <div className="confirm-overlay">
            <div className="confirm-modal">
              <h3>Reject Booth Design</h3>

              <p>Please enter the reason for rejecting this booth design.</p>

              <textarea
                className="reject-textarea"
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />

              <div className="confirm-actions">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowRejectPopup(false);
                    setRejectReason("");
                  }}
                  disabled={rejecting}
                >
                  Cancel
                </button>

                <button
                  className="confirm-btn danger"
                  disabled={!rejectReason.trim() || rejecting}
                  onClick={() => handleRejectBoothDesign(selectedBoothId)}
                >
                  {rejecting ? "Rejecting..." : "Reject Booth Design"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalContractorListTable;
