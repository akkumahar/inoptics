import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaLockOpen,
  FaEye,
  FaCloudUploadAlt,
  FaDownload,
  FaUpload,
  FaUser,
  FaBuilding,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaLock,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import "./ExhibitorContractors.css";

/* ─── helpers ─── */
const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/* ══════════════════════════════════════════
   Selected Contractor Card (Left Panel)
══════════════════════════════════════════ */
const SelectedContractorCard = ({ contractor }) => (
  <div>
    <span className="ec-section-label">Selected Contractor</span>
    <div className="ec-contractor-card">
      <div className="ec-contractor-card-header">
        <div className="ec-contractor-avatar">
          {contractor ? getInitials(contractor.company_name) : "—"}
        </div>
        <div>
          <div className="ec-contractor-cname">
            {contractor?.company_name ?? "No contractor selected"}
          </div>
          <div className="ec-contractor-label">
            Booth Design &amp; Construction
          </div>
        </div>
      </div>
      {contractor && (
        <div className="ec-contractor-details">
          <div className="ec-detail-row">
            <div className="ec-detail-icon">
              <FaUser />
            </div>
            <div>
              <div className="ec-detail-key">Contact Name</div>
              <div className="ec-detail-val">{contractor.name}</div>
            </div>
          </div>
          <div className="ec-detail-row">
            <div className="ec-detail-icon">
              <FaMapMarkerAlt />
            </div>
            <div>
              <div className="ec-detail-key">City</div>
              <div className="ec-detail-val">{contractor.city}</div>
            </div>
          </div>
          <div className="ec-detail-row">
            <div className="ec-detail-icon">
              <FaPhoneAlt />
            </div>
            <div>
              <div className="ec-detail-key">Phone / Mobile</div>
              <div className="ec-detail-val">
                {contractor.mobile_numbers}
                {contractor.phone_numbers
                  ? `, ${contractor.phone_numbers}`
                  : ""}
              </div>
            </div>
          </div>
          <div className="ec-detail-row">
            <div className="ec-detail-icon">
              <FaEnvelope />
            </div>
            <div>
              <div className="ec-detail-key">Email</div>
              <div className="ec-detail-val">{contractor.email}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

/* ══════════════════════════════════════════
   Contractor Checklist (Left Panel)
══════════════════════════════════════════ */
const CHECKLIST = [
  "Contractor Selection",
  "Appointed Contractor",
  "Contractor Undertaking Declaration",
  "Contractor Badges & Passes",
  "Upload Designs & Documents",
];

const ContractorChecklist = ({ currentStep, viewStep, contractorSelected }) => (
  <div>
    <span className="ec-section-label">Contractor Checklist</span>

    <div className="ec-checklist-card">
      {CHECKLIST.map((label, i) => {
        const n = i + 1;

        const isDone = n === 1 ? contractorSelected : n <= currentStep;

        const isActive = n === viewStep + 1;

        const cls = isDone ? "ec-done" : isActive ? "ec-active" : "";

        return (
          <div className={`ec-step-item ${cls}`} key={i}>
            <div className="ec-step-num">{isDone ? "✓" : n}</div>
            <div className="ec-step-text">{label}</div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   StepPanel
══════════════════════════════════════════════════════ */
const StepPanel = ({
  stepNumber,
  title,
  isActive,
  isCompleted,
  isLocked,
  isSubmitted,
  children,
  actions,
  unlockStatusData,
  stepSubmitted,
  onUnlock,
}) => {
  const statusLabel = isCompleted
    ? "Completed"
    : isLocked
      ? "Locked · Complete previous step first"
      : isSubmitted
        ? "Submitted · Locked"
        : "In Progress · Action Required";

  const statusClass = isCompleted
    ? "done"
    : isLocked
      ? "locked"
      : isSubmitted
        ? "locked"
        : "in-progress";

  return (
    <div
      className={`ec-step-panel ${
        isActive && !isSubmitted ? "ec-panel-active" : ""
      } ${isLocked ? "ec-panel-locked" : ""}`}
    >
      {/* ── Header ── */}
      <div
        className={`ec-step-panel-header ${
          isActive && !isSubmitted ? "ec-ph-active" : ""
        }`}
      >
        <div
          className={`ec-step-panel-badge ${
            isCompleted
              ? "ec-badge-done"
              : isLocked || isSubmitted
                ? "ec-badge-locked"
                : ""
          }`}
        >
          {isCompleted ? "✓" : stepNumber}
        </div>
        <div style={{ flex: 1 }}>
          <div className="ec-step-panel-title">{title}</div>
          <div className={`ec-step-panel-status ${statusClass}`}>
            {statusLabel}
          </div>
        </div>

        {/* 🔓 Header Right Section — only shown when step is submitted/locked */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Show Pending */}
          {stepSubmitted && unlockStatusData?.status === "pending" && (
            <span className="unlock-pending">⏳ Pending</span>
          )}

          {/* Show Request Again on Rejected */}
          {stepSubmitted && unlockStatusData?.status === "rejected" && (
            <button className="unlock-btn small" onClick={onUnlock}>
              🔓 Request Again
            </button>
          )}

          {/* Show Unlock Button when submitted but no pending/rejected status */}
          {stepSubmitted &&
            (unlockStatusData?.status === "locked" ||
              !unlockStatusData?.status) && (
              <button className="unlock-btn small" onClick={onUnlock}>
                🔓 Request Unlock
              </button>
            )}

          {/* Lock icon when panel not yet reachable (not submitted, just locked) */}
          {!stepSubmitted && isLocked && (
            <FaLock style={{ color: "var(--muted)", fontSize: 14 }} />
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="ec-step-panel-body">
        {/* Instructions — always readable */}
        <div className="ec-step-instructions">{children}</div>

        {/*
          ✅ KEY LOGIC:
          - isLocked   → step not yet reachable (previous step not done)
          - isSubmitted → Next was clicked on THIS step → buttons disabled (pointer-events none + opacity)
          - neither    → active step, all buttons fully interactive
        */}
        <div className="ec-step-actions">{actions}</div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const ExhibitorContractors = (props) => {
  const {
    importantPage,
    setActiveMenu,
    activeMenu,
    showPopup,
    selectedContractorTemp,
    cancelSelect,
    confirmSelect,
    showContractorListOverlay,
    setShowContractorListOverlay,
    contractorData,
    selectedContractorId,
    unselectContractor,
    setSelectedContractorTemp,
    setShowPopup,
    workflowActive,
    contractorEmail,
    setContractorEmail,
    handleSendRegistrationMail,
    requestContractorChange,
    uploadedFiles,
    setSelectedPreviewStep,
    setPdfUrl,
    setShowPdfPreview,
    showPdfPreview,
    forceDownload,
    downloadBoothDesign,
    formData,
    selectedContractor,
    currentStep,
    setCurrentStep,
    showPreview,
    setShowPreview,
    previewURL,
    handleFinalUpload,
    setSelectedFile,
    setPreviewURL,
    uploadedSteps,
    handleDownload,
    sendFormToContractor,
    handleFileSelect,
    setIsReuploading,
    boothDesignStatus,
    setBoothDesignStatus,
    boothRejectReason,
    setBoothRejectReason,
    showBoothDesignPreview,
    setShowBoothDesignPreview,
    handleBoothDesignUpload,
    contractorViewStep,
    stepSubmitted,
    setStepSubmitted,
    unlockStatus,
    setUnlockStatus,
    fetchSelectedContractor,
    fetchUnlockStatus,
  } = props;

  const [viewStep, setViewStep] = useState(contractorViewStep);
  const [search, setSearch] = useState("");

  // unlockStatus: { [stepNumber]: { status: "pending"|"approved"|"rejected"|"locked" } }
  // const [unlockStatus, setUnlockStatus] = useState({});

  // stepSubmitted: { [stepNumber]: true } — set when Next is clicked on that step
  // const [stepSubmitted, setStepSubmitted] = useState({});

  /* ── Fetch unlock status from server ── */
  // const fetchUnlockStatus = async () => {
  //   try {
  //     const res = await fetch(
  //       `https://inoptics.in/api/get_contractor_unlock_step_status.php?exhibitor_company_name=${encodeURIComponent(formData.company_name)}`
  //     );
  //     if (!res.ok) { console.error("Server error:", res.status); return; }
  //     const text = await res.text();
  //     if (!text) { console.warn("Empty response from server"); return; }
  //     const data = JSON.parse(text);
  //     if (data.success) {
  //       const steps = data.steps || {};
  //       setUnlockStatus(steps);

  //       setStepSubmitted((prev) => {
  //         const updated = { ...prev };
  //         Object.keys(steps).forEach((stepKey) => {
  //           const n = parseInt(stepKey);
  //           if (steps[stepKey]?.status === "approved") {
  //             updated[n] = false; // admin approved → unlock
  //           } else {
  //             updated[n] = true;  // locked/pending/rejected → was submitted, keep locked
  //           }
  //         });
  //         return updated;
  //       });
  //     }
  //   } catch (err) {
  //     console.error("unlock fetch error", err);
  //   }
  // };

  useEffect(() => {
    if (formData?.company_name) {
      fetchSelectedContractor(formData.company_name);
    }
  }, [formData?.company_name]);

  useEffect(() => {
    if (workflowActive && formData?.company_name) {
      fetchUnlockStatus();
    }
  }, [workflowActive, formData?.company_name]);

  /* ── When server approves a step → auto-unlock (clear stepSubmitted) ── */
  useEffect(() => {
    setStepSubmitted((prev) => {
      const updated = { ...prev };
      Object.keys(unlockStatus).forEach((stepKey) => {
        const n = parseInt(stepKey);
        if (unlockStatus[stepKey]?.status === "approved") {
          updated[n] = false;
        }
      });
      return updated;
    });
  }, [unlockStatus]);

  /* ── Request unlock for a step ── */
  const requestUnlock = async (step) => {
    try {
      const formDataObj = new FormData();
      formDataObj.append("exhibitor_company_name", formData.company_name);
      formDataObj.append("step_number", step);

      const res = await fetch(
        "https://inoptics.in/api/request_step_unlock.php",
        { method: "POST", body: formDataObj },
      );
      if (!res.ok) {
        toast.error("Server error");
        return;
      }
      const text = await res.text();
      if (!text) {
        toast.error("Empty response from server");
        return;
      }
      const data = JSON.parse(text);
      if (data.success) {
        toast.success("Unlock request sent");
        fetchUnlockStatus();
      } else {
        toast.error(data.message || "Request failed");
      }
    } catch (err) {
      console.error("Unlock error:", err);
      toast.error("Server error");
    }
  };

  useEffect(() => {
    if (viewStep === 3) {
      setActiveMenu("Contractor Badges");
    }
  }, [viewStep]);

  useEffect(() => {
    setViewStep(contractorViewStep);
  }, [contractorViewStep]);

  const TOTAL_STEPS = 5;

  const filtered = (contractorData || []).filter(
    (c) =>
      c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase()),
  );

  /* ─────────────────────────────────────────────────────────
     getUnlockStatus(n): DB se step n ka status (string keys fix)
  ───────────────────────────────────────────────────────── */
  const getUnlockStatus = (n) => {
    // DB se aane wali keys strings hoti hain ("1","2"...) → dono try karo
    return unlockStatus[n]?.status || unlockStatus[String(n)]?.status || null;
  };

  /* ─────────────────────────────────────────────────────────
     panelLocked(n):
       Condition 1: Ye step khud submit hua (Next click) AND
                    admin ne approve nahi kiya → LOCKED
       Condition 2: Previous step submit nahi hua → NOT REACHABLE
  ───────────────────────────────────────────────────────── */
  const panelLocked = (n) => {
    // ✅ Sirf ye step submitted hai aur admin ne approve nahi kiya → lock
    if (stepSubmitted[n]) {
      const status = getUnlockStatus(n);
      if (status === "approved") return false;
      return true;
    }
    // ✅ currentStep < n check NAHI — Next button freely kaam kare
    return false;
  };

  const panelCompleted = (n) => currentStep >= n + 1;

  const panelActive = (n) => viewStep === n;

  // panelSubmitted = Next was clicked on this step
  const panelSubmitted = (n) => !!stepSubmitted[n];

  /* ── Navigation ── */
  const canGoBack = viewStep > 1;
  const canGoForward = viewStep < TOTAL_STEPS;

  const goBack = () => setViewStep((v) => Math.max(v - 1, 1));
  const goForward = () => setViewStep((v) => Math.min(v + 1, TOTAL_STEPS));

  /* ── Next button handler ──
     1. DB mein step ko 'locked' save karo (naya lock_contractor_step.php)
     2. Local state mein bhi lock karo
     3. Advance currentStep
     4. Move view to next panel
  */
  const handleNext = (step) => {
    if (currentStep === step) {
      setCurrentStep(step + 1);
    }

    setViewStep(Math.min(step + 1, TOTAL_STEPS));
  };

  if (importantPage || activeMenu !== "Mandatory Forms") return null;

  return (
    <div className="ExhibitorContractors-root">
      {/* ══ ACTION BAR ══ */}
      {workflowActive && (
        <div className="ec-action-bar">
          <button
            className="ec-ab-btn unlock"
            onClick={() =>
              requestContractorChange(selectedContractor, formData)
            }
          >
            <FaLockOpen /> Unlock
          </button>
          <button
            className="ec-ab-btn viewlist"
            onClick={() => setShowContractorListOverlay(true)}
          >
            <FaEye /> Contractor List
          </button>
          {Object.values(uploadedFiles || {}).some(Boolean) && (
            <button
              className="ec-ab-btn viewuploads"
              onClick={() => {
                const first = uploadedFiles.step1
                  ? "step1"
                  : uploadedFiles.step2
                    ? "step2"
                    : "step3";
                setSelectedPreviewStep(first);
                setPdfUrl(
                  first === "step3"
                    ? `https://inoptics.in/api/download_exhibitor_form.php?company=${encodeURIComponent(formData.company_name)}&type=booth`
                    : `https://inoptics.in/api/${uploadedFiles[first]}`,
                );
                setShowPdfPreview(true);
              }}
            >
              <FaCloudUploadAlt /> View Uploads
            </button>
          )}
        </div>
      )}

      {/* ══ CONFIRMATION POPUP ══ */}
      {showPopup && (
        <div className="ContractorPopup-overlay">
          <div className="ContractorPopup-box">
            <h3>Confirm Contractor Selection</h3>
            <p>
              Are you sure you would like to proceed with{" "}
              <strong>{selectedContractorTemp?.company_name}</strong> as your
              booth contractor?
            </p>
            <p>
              <strong>
                Please note that once the contractor is confirmed, the selection
                will be locked and cannot be changed. If you wish to make any
                changes later, an unlock request will need to be submitted.
              </strong>
            </p>
            <div className="ContractorPopup-buttons">
              <button className="PopupCancelBtn" onClick={cancelSelect}>
                Cancel
              </button>
              <button className="PopupOkBtn" onClick={confirmSelect}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CONTRACTOR LIST OVERLAY ══ */}
      {showContractorListOverlay && (
        <div
          className="ContractorListOverlay-overlay"
          onClick={() => setShowContractorListOverlay(false)}
        >
          <div
            className="ContractorListOverlay-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Contractor List</h3>
            <button
              className="ContractorListOverlay-close"
              onClick={() => setShowContractorListOverlay(false)}
            >
              ×
            </button>
            <div className="ExhibitorContractors-exhibitor-cont-table-container ec-bw-table-wrap">
              <table className="ExhibitorContractors-appointed-contractor-table ec-bw-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Company Name</th>
                    <th>City</th>
                    <th>Phn/Mob No</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(contractorData || []).map((c, i) => (
                    <tr key={c.id}>
                      <td className="d-only">{i + 1}</td>
                      <td className="d-only">{c.name}</td>
                      <td className="d-only">{c.company_name}</td>
                      <td className="d-only">{c.city}</td>
                      <td className="d-only">
                        {c.mobile_numbers}
                        {c.phone_numbers ? `, ${c.phone_numbers}` : ""}
                      </td>
                      <td className="d-only">{c.email}</td>
                      <td className="d-only">
                        {/* {selectedContractorId === c.id ? (
                          <button
                            className="ExhibitorContractors-unselect-btn"
                            onClick={unselectContractor}
                          >
                            Unselect
                          </button>
                        ) : (
                          <button
                            className="ExhibitorContractors-select-btn"
                            disabled={!!selectedContractorId}
                            onClick={() => {
                              setSelectedContractorTemp(c);
                              setShowPopup(true);
                            }}
                          >
                            Select
                          </button>
                        )} */}
                      </td>
                      <td className="m-only" colSpan="7">
                        <div className="cm-card">
                          <div className="cm-top">
                            <div className="cm-id">{i + 1}</div>
                            <div className="cm-name">{c.name}</div>
                          </div>
                          <div className="cm-company">
                            <FaUser className="cm-icon" /> {c.company_name}
                          </div>
                          <div className="cm-company">
                            <FaPhoneAlt className="cm-icon-phone" />{" "}
                            {c.mobile_numbers}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ VIEW UPLOADS POPUP ══ */}
      {showPdfPreview && (
        <div className="pdf-preview-overlay">
          <div className="pdf-preview-card">
            <div className="pdf-preview-header">
              <h5>Uploaded Forms</h5>
              <button
                className="form-icon-close"
                onClick={() => setShowPdfPreview(false)}
              >
                ✖
              </button>
            </div>
            <div className="uploaded-file-list">
              {uploadedFiles?.step1 && (
                <div className="uploaded-file-row">
                  <span>Exhibitor Confirmation &amp; Form Upload</span>
                  <div className="file-actions">
                    <button
                      className="form-icon"
                      onClick={() => forceDownload(uploadedFiles.step1)}
                    >
                      <FaDownload />
                    </button>
                  </div>
                </div>
              )}
              {uploadedFiles?.step2 && (
                <div className="uploaded-file-row">
                  <span>Mandatory Contractor Undertaking Form</span>
                  <div className="file-actions">
                    <button
                      className="form-icon"
                      onClick={() => forceDownload(uploadedFiles.step2)}
                    >
                      <FaDownload />
                    </button>
                  </div>
                </div>
              )}
              {uploadedFiles?.step3 && (
                <div className="uploaded-file-row">
                  <span>Booth Dimensions &amp; Construction Guidelines</span>
                  <div className="file-actions">
                    <button className="form-icon" onClick={downloadBoothDesign}>
                      <FaDownload />
                    </button>
                  </div>
                </div>
              )}
              {!uploadedFiles?.step1 &&
                !uploadedFiles?.step2 &&
                !uploadedFiles?.step3 && (
                  <p
                    style={{
                      textAlign: "center",
                      color: "var(--muted)",
                      fontSize: 13,
                      padding: "12px 0",
                    }}
                  >
                    No forms uploaded yet
                  </p>
                )}
            </div>
          </div>
        </div>
      )}

      {/* ══ PDF PREVIEW POPUP ══ */}
      {showPreview && (
        <div className="Workflow-warning-popup-overlay">
          <div
            className="Workflow-pdf-preview-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="Workflow-pdf-header">
              <h4>Exhibitor Form Preview</h4>
              <button
                className="Workflow-pdf-close-btn"
                onClick={() => setShowPreview(false)}
              >
                ✕
              </button>
            </div>
            <div className="Workflow-pdf-body">
              <iframe src={previewURL} title="PDF Preview" />
            </div>
            <div className="Workflow-pdf-footer">
              <button
                className="Workflow-pdf-submit-btn"
                onClick={() =>
                  toast.promise(
                    (async () => {
                      await handleFinalUpload();

                      const stepToLock = viewStep; // ✅ sirf viewStep

                      const fd = new FormData();
                      fd.append(
                        "exhibitor_company_name",
                        formData.company_name,
                      );
                      fd.append("step_number", stepToLock);

                      await fetch(
                        "https://inoptics.in/api/lock_contractor_step_status.php",
                        { method: "POST", body: fd },
                      );

                      // ✅ SIRF EK setStepSubmitted — currentStep wala DELETE karo
                      setStepSubmitted((prev) => ({
                        ...prev,
                        [stepToLock]: true,
                      }));

                      fetchUnlockStatus();
                    })(),
                    {
                      loading: "Uploading form...",
                      success: "Form uploaded & locked successfully",
                      error: "Upload failed",
                    },
                  )
                }
              >
                Submit &amp; Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {showBoothDesignPreview && (
        <div className="Workflow-warning-popup-overlay">
          <div
            className="Workflow-pdf-preview-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="Workflow-pdf-header">
              <h4>Booth Design Preview</h4>
              <button
                className="Workflow-pdf-close-btn"
                onClick={() => setShowBoothDesignPreview(false)}
              >
                ✕
              </button>
            </div>
            <div className="Workflow-pdf-body">
              {previewURL ? (
                <iframe
                  src={previewURL}
                  title="Booth Design Preview"
                  width="100%"
                  height="500px"
                />
              ) : (
                <p style={{ padding: 24, color: "var(--muted)" }}>
                  No preview available
                </p>
              )}
            </div>
            <div className="Workflow-pdf-footer">
              <button
                className="Workflow-pdf-submit-btn"
                onClick={() =>
                  toast.promise(handleBoothDesignUpload(), {
                    loading: "Uploading form...",
                    success: "Form uploaded successfully",
                    error: (err) => err.message || "Upload failed",
                  })
                }
              >
                Submit &amp; Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MAIN SPLIT ══ */}
      <div className="ExhibitorContractors-main-container-split">
        {/* ────────── LEFT ────────── */}
        <div className="ExhibitorContractors-leftContainer">
          <div
            className={`left-layer original-left-layer ${
              workflowActive ? "slide-out-left" : "visible"
            }`}
          >
            <h2 className="ExhibitorContractors-heading">
              Contractor Selection
              <br />
              &amp; Registration Process
            </h2>
            <ul className="ExhibitorContractors-points">
              <li>
                Please select an approved contractor from the list available in
                the right-hand side panel.
              </li>
              <li>
                If you wish to appoint a contractor who is not listed, kindly
                share the contractor registration form with them and request
                that they complete it. The completed form must then be uploaded
                by the exhibitor online.
              </li>
              <li>
                Contractor appointment is subject to approval from the
                organiser. Upon approval, a one-time contractor registration fee
                of ₹10,000 per exhibitor will be applicable.
              </li>
              <li>
                Once a contractor is selected, the selection will be treated as
                final. Any request to change the selected contractor at a later
                stage will require submission of a formal unlock request and
                will be subject to approval
              </li>
            </ul>
            <label className="ExhibitorContractors-email-label">
              Send Your Unregistered Contractor Email ID:
            </label>
            <div className="ExhibitorContractors-email-row">
              <input
                type="email"
                placeholder="Enter contractor email"
                value={contractorEmail}
                onChange={(e) => setContractorEmail(e.target.value)}
                className="ExhibitorContractors-email-input"
              />
              <button
                className="ExhibitorContractors-email-submit-btn"
                onClick={() => handleSendRegistrationMail(contractorEmail)}
              >
                Submit
              </button>
            </div>
          </div>

          <div
            className={`left-layer workflow-left-layer ${
              workflowActive ? "slide-in-right" : "hidden"
            }`}
          >
            <SelectedContractorCard contractor={selectedContractor} />
            <ContractorChecklist
              currentStep={currentStep}
              viewStep={viewStep}
              contractorSelected={!!selectedContractor}
            />
          </div>
        </div>

        {/* ────────── RIGHT ────────── */}
        <div className="ExhibitorContractors-rightContainer">
          {/* ── Before selection: contractor table ── */}
          <div className="only-mobile-version-contractor">
            <div
              className={`right-layer original-layer ${
                workflowActive ? "slide-out-right" : "visible"
              }`}
            >
              <div className="ec-table-section">
                <div className="ec-table-header">
                  <span className="ec-table-title">
                    Approved Contractor List
                  </span>
                </div>
                <div className="ExhibitorContractors-exhibitor-cont-table-container ec-bw-table-wrap">
                  <table className="ExhibitorContractors-appointed-contractor-table ec-bw-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Company Name</th>
                        <th>Name</th>
                        <th>City</th>
                        <th>Phn/Mob No</th>
                        <th>Email</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(contractorData || []).map((c, i) => (
                        <tr key={c.id}>
                          <td className="d-only ec-td-num">{i + 1}</td>
                          <td className="d-only ec-td-company">
                            {c.company_name}
                          </td>
                          <td className="d-only">{c.name}</td>
                          <td className="d-only">{c.city}</td>
                          <td className="d-only">
                            {c.mobile_numbers}
                            {c.phone_numbers && `, ${c.phone_numbers}`}
                          </td>
                          <td className="d-only ec-td-email">{c.email}</td>
                          <td className="d-only">
                            {selectedContractorId === c.id ? (
                              <button className="ExhibitorContractors-unselect-btn">
                                Unselect
                              </button>
                            ) : (
                              <button
                                className="ExhibitorContractors-select-btn"
                                disabled={!!selectedContractorId}
                                onClick={() => {
                                  setSelectedContractorTemp(c);
                                  setShowPopup(true);
                                }}
                              >
                                Select
                              </button>
                            )}
                          </td>
                          <td className="m-only" colSpan="7">
                            <div className="cm-card">
                              <div className="cm-top">
                                <div className="cm-id">
                                  <div className="cm-name">
                                    {i + 1} {c.name
                                      ?.toLowerCase()
                                      .replace(/\b\w/g, (ch) =>
                                        ch.toUpperCase(),
                                      )}
                                  </div>
                                </div>
                                <button
                                  className="cm-btn"
                                  disabled={!!selectedContractorId}
                                  onClick={() => {
                                    setSelectedContractorTemp(c);
                                    setShowPopup(true);
                                  }}
                                >
                                  Select
                                </button>
                              </div>

                              <div className="cm-company">
                                <FaBuilding className="cm-icon" />{" "}
                                {c.company_name
                                  ?.toLowerCase()
                                  .replace(/\b\w/g, (ch) => ch.toUpperCase())}
                              </div>
                              <div className="cm-company">
                                <FaPhoneAlt className="cm-icon-phone" />{" "}
                                {c.mobile_numbers}
                              </div>
                              <div className="cm-email">
                                <FaEnvelope className="cm-icon" /> {c.email}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              WORKFLOW LAYER
          ══════════════════════════════════════════ */}
          <div
            className={`right-layer workflow-layer ${
              workflowActive ? "slide-in-left" : "hidden"
            }`}
          >
            <div className="ec-step-panels">
              {/* ── Navigation bar ── */}
              <div className="ec-step-nav">
                <div className="ec-step-nav-info">
                  Step {viewStep + 1} of {TOTAL_STEPS + 1}
                </div>
                <div className="ec-step-nav-btns">
                  {/* ✅ Back & Forward are NEVER disabled by step locking */}
                  <button
                    className="ec-nav-btn"
                    disabled={!canGoBack}
                    onClick={goBack}
                  >
                    <FaChevronLeft /> Back
                  </button>
                  <button
                    className="ec-nav-btn ec-nav-next"
                    disabled={!canGoForward}
                    onClick={goForward}
                  >
                    Forward <FaChevronRight />
                  </button>
                </div>
              </div>

              {/* ════════════════════════════════════
                  STEP 1 → UI "Step 2"
              ════════════════════════════════════ */}
              {viewStep === 1 && (
                <StepPanel
                  stepNumber={2}
                  title="Step 2: Appointed Contractor Form to be filled by Exhibitor"
                  isActive={panelActive(1)}
                  isCompleted={panelCompleted(1)}
                  isLocked={panelLocked(1)}
                  isSubmitted={panelSubmitted(1)}
                  unlockStatusData={unlockStatus[1] || unlockStatus["1"]}
                  stepSubmitted={stepSubmitted[1]}
                  onUnlock={() => requestUnlock(1)}
                  actions={
                    <>
                      <button
                        className="doc-btn download-btn"
                        disabled={panelSubmitted(1)}
                        style={{ opacity: panelSubmitted(1) ? 1 : 1 }}
                        onClick={() =>
                          handleDownload(
                            `https://inoptics.in/api/uploads/1752656815_APPOINTED CONTRACTOR & CONTRACTOR BADGES-2.pdf`,
                            "APPOINTED_CONTRACTOR_BADGES.pdf",
                          )
                        }
                      >
                        <FaDownload /> Download
                      </button>

                      <label
                        className="doc-btn ec-upload-btn"
                        style={{ opacity: panelSubmitted(1) ? 1 : 1 }}
                      >
                        <FaUpload /> Upload
                        <input
                          type="file"
                          accept="application/pdf"
                          disabled={panelSubmitted(1)}
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setSelectedFile(file);
                            setPreviewURL(URL.createObjectURL(file));
                            setShowPreview(true);
                          }}
                        />
                      </label>

                      <button
                        className="doc-btn Workflow-next-btn"
                        style={{ opacity: uploadedSteps?.step1 }}
                        onClick={() => handleNext(1)}
                      >
                        Next →
                      </button>
                    </>
                  }
                >
                  <ul>
                    <li>
                      Exhibitors must download the mandatory Exhibitor Form,
                      duly sign and stamp it, and upload the completed form to
                      proceed to Step 3.
                    </li>
                    <li>
                      By uploading the form, the exhibitor formally confirms
                      their intent to appoint the selected contractor and
                      informs RSD Expositions accordingly.
                    </li>
                    <li>
                      Any change to the appointed contractor after submission
                      must be initiated via the Unlock Request option available
                      in the next step.
                    </li>
                    <li>
                      Fabricator appointment is subject to organiser approval
                      and applicable security deposit guidelines, as
                      communicated by RSD Expositions.
                    </li>
                  </ul>

                  {!panelSubmitted(1) && (
                    <p className="field-error" style={{ marginTop: 12 }}>
                      Access to the Next step will be enabled only after the
                      mandatory form has been downloaded, duly completed, and
                      uploaded.
                    </p>
                  )}
                </StepPanel>
              )}

              {/* ════════════════════════════════════
                  STEP 2 → UI "Step 3"
              ════════════════════════════════════ */}
              {viewStep === 2 && (
                <StepPanel
                  stepNumber={3}
                  title="Step 3: Mandatory Contractor Undertaking Form to be filled by Contractor"
                  isActive={panelActive(2)}
                  isCompleted={panelCompleted(2)}
                  isLocked={panelLocked(2)}
                  isSubmitted={panelSubmitted(2)}
                  unlockStatusData={unlockStatus[2] || unlockStatus["2"]}
                  stepSubmitted={stepSubmitted[2]}
                  onUnlock={() => requestUnlock(2)}
                  actions={
                    <>
                      <button
                        className="doc-btn send-form-btn"
                        disabled={panelSubmitted(2)}
                        onClick={() => sendFormToContractor()}
                      >
                        <FaPaperPlane /> Send to Contractor
                      </button>
                      <button
                        disabled={panelSubmitted(2)}
                        className="doc-btn download-btn"
                        onClick={() =>
                          handleDownload(
                            `https://inoptics.in/api/uploads/1752656839_CONTRACTOR UNDERTAKING-DECLARATION & REGISTRATION-3.pdf`,
                            "CONTRACTOR_UNDERTAKING.pdf",
                          )
                        }
                      >
                        <FaDownload /> Download
                      </button>
                      <label
                        className="doc-btn ec-upload-btn"
                        disabled={panelSubmitted(2)}
                        style={{ opacity: panelSubmitted(2) ? 1 : 1 }}
                      >
                        <FaUpload /> Upload
                        <input
                          type="file"
                          disabled={panelSubmitted(2)}
                          style={{ display: "none" }}
                          accept="application/pdf"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setSelectedFile(file);
                            setPreviewURL(URL.createObjectURL(file));
                            setShowPreview(true);
                          }}
                        />
                      </label>
                      <button
                        className="doc-btn Workflow-next-btn"
                        style={{ opacity: uploadedSteps?.step2 ? 1 : 1 }}
                        onClick={() => handleNext(2)}
                      >
                        Next →
                      </button>
                    </>
                  }
                >
                  <ul>
                    <li>
                      This form must be completed by the selected contractor as
                      confirmation of acceptance of all exhibition rules and
                      regulations.
                    </li>
                    <li>
                      Exhibitors may send the form directly to the contractor
                      using the "Send Form To Contractor" button, or download
                      and share it manually.
                    </li>
                    <li>
                      The contractor is required to fill, sign, and stamp the
                      form and return it to the exhibitor.
                    </li>
                    <li>
                      The exhibitor must upload the signed and stamped form to
                      complete this step.
                    </li>
                    <li>
                      Contractor finalisation will be enabled only after
                      successful upload of the completed form.
                    </li>
                    <li>
                      Completion of this step is mandatory for participation in
                      InOptics 2026.
                    </li>
                  </ul>
                  <div className="ec-step-note">
                    ⚠️ Access to Step 4 will be enabled only after this
                    mandatory form has been uploaded.
                  </div>
                </StepPanel>
              )}

              {/* ════════════════════════════════════
                  STEP 3 → UI "Step 4" (Contractor Badges)
              ════════════════════════════════════ */}
              {viewStep === 3 && (
                <StepPanel
                  stepNumber={4}
                  title="Step 4: Contractor Badges"
                  isActive={panelActive(3)}
                  isCompleted={panelCompleted(3)}
                  isLocked={panelLocked(3)}
                  isSubmitted={panelSubmitted(3)}
                  unlockStatusData={unlockStatus[3] || unlockStatus["3"]}
                  stepSubmitted={stepSubmitted[3]}
                  onUnlock={() => requestUnlock(3)}
                  actions={
                    <>
                      <button
                        className="doc-btn send-form-btn"
                        onClick={() => sendFormToContractor()}
                      >
                        <FaPaperPlane /> Send to Contractor
                      </button>
                      <button
                        className="doc-btn download-btn"
                        disabled={panelSubmitted(3)}
                        onClick={() =>
                          handleDownload(
                            `https://inoptics.in/api/uploads/1752656839_CONTRACTOR UNDERTAKING-DECLARATION & REGISTRATION-3.pdf`,
                            "CONTRACTOR_UNDERTAKING.pdf",
                          )
                        }
                      >
                        <FaDownload /> Download
                      </button>
                      <label
                        className="doc-btn ec-upload-btn"
                        disabled={panelSubmitted(3)}
                      >
                        <FaUpload /> Upload
                        <input
                          type="file"
                          accept="application/pdf"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setSelectedFile(file);
                            setPreviewURL(URL.createObjectURL(file));
                            setShowPreview(true);
                          }}
                        />
                      </label>
                      <button
                        className="doc-btn Workflow-next-btn"
                        style={{ opacity: uploadedSteps?.step2 ? 1 : 1 }}
                        onClick={() => {
                          handleNext(3);
                          setActiveMenu("Contractor Badges");
                        }}
                      >
                        Next →
                      </button>
                    </>
                  }
                >
                  <ul>
                    <li>
                      This form must be completed by the selected contractor as
                      confirmation of acceptance of all exhibition rules and
                      regulations.
                    </li>
                    <li>
                      Exhibitors may send the form directly to the contractor
                      using the "Send Form To Contractor" button, or download
                      and share it manually.
                    </li>
                    <li>
                      The contractor is required to fill, sign, and stamp the
                      form and return it to the exhibitor.
                    </li>
                    <li>
                      The exhibitor must upload the signed and stamped form to
                      complete this step.
                    </li>
                    <li>
                      Contractor finalisation will be enabled only after
                      successful upload of the completed form.
                    </li>
                    <li>
                      Completion of this step is mandatory for participation in
                      InOptics 2026.
                    </li>
                  </ul>
                  <div className="ec-step-note">
                    ⚠️ Access to Step 5 will be enabled only after this
                    mandatory form has been uploaded.
                  </div>
                </StepPanel>
              )}

              {/* ════════════════════════════════════
                  STEP 4 → UI "Step 5" (Booth Design Upload)
              ════════════════════════════════════ */}
              {viewStep === 4 && (
                <>
                  <StepPanel
                    stepNumber={5}
                    title="Step 5 – Booth Dimensions & Construction Guidelines (Raw Space)"
                    isActive={panelActive(4)}
                    isCompleted={panelCompleted(4)}
                    isLocked={panelLocked(4)}
                    isSubmitted={panelSubmitted(4)}
                    unlockStatusData={unlockStatus[4] || unlockStatus["4"]}
                    stepSubmitted={stepSubmitted[4]}
                    onUnlock={() => requestUnlock(4)}
                    actions={
                      <>
                        <label
                          className="doc-btn ec-upload-btn"
                          disabled={panelSubmitted(4)}
                        >
                          <FaUpload /> Upload Design
                          <input
                            type="file"
                            accept="application/pdf"
                            disabled={panelSubmitted(4)}
                            style={{ display: "none" }}
                            onChange={(e) => handleFileSelect(e)}
                          />
                        </label>
                        <button
                          className="doc-btn Workflow-next-btn"
                          style={{ opacity: uploadedSteps?.step3 ? 1 : 1 }}
                          onClick={() => {
                            if (uploadedSteps?.step3) {
                              handleNext(4);
                              setIsReuploading(false);
                              setBoothDesignStatus("pending");
                              setCurrentStep(5);
                              setViewStep(5);
                            }
                          }}
                        >
                          Submit →
                        </button>
                      </>
                    }
                  >
                    <ul>
                      <li>
                        The booth must be constructed strictly within the
                        allotted area. No extension beyond the approved space is
                        permitted.
                      </li>
                      <li>
                        Maximum permissible height for any booth structure or
                        partition wall is 3.0 metres (12 feet).
                      </li>
                      <li>
                        Partition walls between adjoining stalls must not exceed
                        the permitted height and must be neatly finished on both
                        sides.
                      </li>
                      <li>
                        All special or custom-built structures must remain
                        within the allotted booth boundaries. Mezzanine floors
                        are strictly not permitted.
                      </li>
                      <li>
                        All booth structures must be pre-fabricated and only
                        assembled and finished on-site. Carpentry work inside
                        the exhibition hall is not allowed.
                      </li>
                      <li>
                        All construction and decorative materials used must be
                        fire-retardant and compliant with safety regulations.
                        Electrical installations must be carried out only by
                        licensed electricians.
                      </li>
                    </ul>
                  </StepPanel>
                </>
              )}

              {/* ════════════════════════════════════
                  STEP 5 → Booth Design Status
              ════════════════════════════════════ */}
              {viewStep === 5 && (
                <>
                  <StepPanel
                    stepNumber={6}
                    title="Step 5 – Booth Design Status"
                    isActive={panelActive(5)}
                    isCompleted={panelCompleted(5)}
                    isLocked={panelLocked(5)}
                    isSubmitted={panelSubmitted(5)}
                    unlockStatusData={unlockStatus[5] || unlockStatus["5"]}
                    stepSubmitted={stepSubmitted[5]}
                    onUnlock={() => requestUnlock(5)}
                  >
                    {currentStep === 5 && (
                      <div style={{ marginTop: 20 }}>
                        {boothDesignStatus === "pending" && (
                          <div className="contractor-thankyou-card warning">
                            <h3>🕐 Booth Design Under Review</h3>
                            <p>
                              Your booth design has been submitted. Please wait
                              for admin approval.
                            </p>
                          </div>
                        )}
                        {boothDesignStatus === "rejected" && (
                          <div className="contractor-thankyou-card rejected">
                            <h3>Booth Design Rejected ❌</h3>
                            <div className="reject-reason-box">
                              {boothRejectReason ||
                                "No reason provided by admin."}
                            </div>
                            <button
                              className="doc-btn Workflow-next-btn"
                              style={{
                                margin: "14px auto 0",
                                maxWidth: 200,
                                display: "flex",
                              }}
                              onClick={() => {
                                setIsReuploading(true);
                                setBoothRejectReason("");
                                setCurrentStep(4);
                                setViewStep(4);
                              }}
                            >
                              Re-Upload Booth Design
                            </button>
                          </div>
                        )}
                        {boothDesignStatus === "approved" && (
                          <div className="contractor-thankyou-card success">
                            <h3>Thank you 🎉</h3>
                            <p>
                              Your booth design has been approved. You're all
                              set!
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </StepPanel>
                </>
              )}
            </div>
            {/* /ec-step-panels */}
          </div>
          {/* /workflow-layer */}
        </div>
        {/* /rightContainer */}

        <div className={`mobile-step-spacer step-${currentStep}`} />
      </div>
    </div>
  );
};

export default ExhibitorContractors;
