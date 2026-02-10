import React, { useState, useEffect } from "react";
import {
  FaLockOpen,
  FaEye,
  FaCloudUploadAlt,
  FaDownload,
  FaUpload,
} from "react-icons/fa";
import "./ExhibitorContractors.css";

const ExhibitorContractors = () => {
  // State management
  const [contractorData, setContractorData] = useState([]);
  const [selectedContractorId, setSelectedContractorId] = useState(null);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [selectedContractorTemp, setSelectedContractorTemp] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showContractorListOverlay, setShowContractorListOverlay] =
    useState(false);
  const [workflowActive, setWorkflowActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [contractorEmail, setContractorEmail] = useState("");

  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showBoothDesignPreview, setShowBoothDesignPreview] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    step1: null,
    step2: null,
    step3: null,
  });
  const [uploadedSteps, setUploadedSteps] = useState({
    step1: false,
    step2: false,
    step3: false,
  });

  // Booth design states
  const [boothDesignStatus, setBoothDesignStatus] = useState(""); // 'pending', 'approved', 'rejected'
  const [boothRejectReason, setBoothRejectReason] = useState("");
  const [isReuploading, setIsReuploading] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [selectedPreviewStep, setSelectedPreviewStep] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  // Fetch contractor data on mount
  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch("/api/contractors");
      const data = await response.json();
      setContractorData(data);
    } catch (error) {
      console.error("Error fetching contractors:", error);
    }
  };

  // Contractor selection handlers
  const confirmSelect = async () => {
    if (!selectedContractorTemp) return;

    try {
      // API call to select contractor
      const response = await fetch("/api/select-contractor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractor_id: selectedContractorTemp.id }),
      });

      if (response.ok) {
        setSelectedContractorId(selectedContractorTemp.id);
        setSelectedContractor(selectedContractorTemp);
        setWorkflowActive(true);
        setCurrentStep(1);
        setShowPopup(false);
      }
    } catch (error) {
      console.error("Error selecting contractor:", error);
    }
  };

  const cancelSelect = () => {
    setSelectedContractorTemp(null);
    setShowPopup(false);
  };

  const unselectContractor = async () => {
    try {
      const response = await fetch("/api/unselect-contractor", {
        method: "POST",
      });

      if (response.ok) {
        setSelectedContractorId(null);
        setSelectedContractor(null);
        setWorkflowActive(false);
        setCurrentStep(0);
      }
    } catch (error) {
      console.error("Error unselecting contractor:", error);
    }
  };

  // Email registration handler
  const handleSendRegistrationMail = async (email) => {
    if (!email) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      const response = await fetch("/api/send-registration-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("Registration email sent successfully!");
        setContractorEmail("");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  // File upload handlers
  const handleFinalUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("step", currentStep);

    try {
      const response = await fetch("/api/upload-form", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedFiles((prev) => ({
          ...prev,
          [`step${currentStep}`]: data.file_path,
        }));
        setUploadedSteps((prev) => ({
          ...prev,
          [`step${currentStep}`]: true,
        }));
        setShowPreview(false);
        setSelectedFile(null);
        alert("File uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleBoothDesignUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload-booth-design", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedFiles((prev) => ({
          ...prev,
          step3: data.file_path,
        }));
        setUploadedSteps((prev) => ({
          ...prev,
          step3: true,
        }));
        setShowBoothDesignPreview(false);
        setSelectedFile(null);
        alert("Booth design uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading booth design:", error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewURL(URL.createObjectURL(file));
    setShowBoothDesignPreview(true);
  };

  // Download handler
  const handleDownload = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  const forceDownload = (filepath) => {
    const link = document.createElement("a");
    link.href = `https://inoptics.in/api/${filepath}`;
    link.download = filepath.split("/").pop();
    link.click();
  };

  // Send form to contractor
  const sendFormToContractor = async () => {
    if (!selectedContractor) return;

    try {
      const response = await fetch("/api/send-form-to-contractor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractor_email: selectedContractor.email,
        }),
      });

      if (response.ok) {
        alert("Form sent to contractor successfully!");
      }
    } catch (error) {
      console.error("Error sending form:", error);
    }
  };

  // Unlock request
  const requestContractorChange = async () => {
    try {
      const response = await fetch("/api/request-unlock", {
        method: "POST",
      });

      if (response.ok) {
        alert("Unlock request submitted successfully!");
      }
    } catch (error) {
      console.error("Error requesting unlock:", error);
    }
  };

  return (
    <div className="contractor-ui-body">
      <div className="ExhibitorContractors-root">
        {/* Confirmation Popup */}
        {showPopup && (
          <div className="ContractorPopup-overlay">
            <div className="ContractorPopup-box">
              <h3>Confirm Contractor Selection</h3>
              <p>
                Are you sure you would like to proceed with
                <strong> {selectedContractorTemp?.company_name} </strong>
                as your booth contractor?
              </p>
              <p>
                <strong>
                  Please note that once the contractor is confirmed, the
                  selection will be locked and cannot be changed. If you wish to
                  make any changes later, an unlock request will need to be
                  submitted from the next page.
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
        {showPdfPreview && (
          <div className="pdf-preview-overlay">
            <div className="pdf-preview-card small-card">
              <div className="pdf-preview-header">
                <h5>Uploaded Forms</h5>
                <button
                  onClick={() => setShowPdfPreview(false)}
                  className="form-icon-close"
                >
                  ✖
                </button>
              </div>
              {/* 👇 PDF PREVIEW IFRAME ADD KIA */}
              <div style={{ marginBottom: "20px" }}>
                <iframe
                  src={pdfUrl}
                  title="Uploaded PDF"
                  style={{
                    width: "100%",
                    height: "400px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>

              {/* File list continues... */}
              <div className="uploaded-file-list">
                {/* existing file list code */}
              </div>
            </div>
          </div>
        )}



        {/* Contractor List Overlay */}
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
              <div className="ExhibitorContractors-appointed-contractor-wrapper overlay-table-wrapper">
                <div className="ExhibitorContractors-exhibitor-cont-table-container">
                  <table className="ExhibitorContractors-appointed-contractor-table">
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
                      {contractorData.map((contractor, index) => (
                        <tr key={contractor.id}>
                          <td>{index + 1}</td>
                          <td>{contractor.name}</td>
                          <td>{contractor.company_name}</td>
                          <td>{contractor.city}</td>
                          <td>
                            {contractor.mobile_numbers}
                            {contractor.phone_numbers
                              ? `, ${contractor.phone_numbers}`
                              : ""}
                          </td>
                          <td>{contractor.email}</td>
                          <td>
                            {selectedContractorId === contractor.id ? (
                              <button
                                className="ExhibitorContractors-unselect-btn"
                                onClick={unselectContractor}
                              >
                                Unselect
                              </button>
                            ) : (
                              <button
                                className="ExhibitorContractors-select-btn"
                                onClick={() => {
                                  setSelectedContractorTemp(contractor);
                                  setShowPopup(true);
                                }}
                                disabled={!!selectedContractorId}
                              >
                                Select
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Main Split Layout */}
        <div className="ExhibitorContractors-main-split">
          {/* Left Container */}
          <div className="ExhibitorContractors-leftContainer">
            {/* Original Left Layer */}
            <div
              className={`left-layer original-left-layer ${workflowActive ? "slide-out-left" : "visible"}`}
            >
              <div className="ExhibitorContractors-left-top-row">
                <div className="ExhibitorContractors-left-top-item">
                  <h2 className="ExhibitorContractors-heading">
                    Contractor Selection <br />& Registration Process
                  </h2>
                  <ul className="ExhibitorContractors-points">
                    <li>
                      This section outlines the first step in completing the
                      contractor undertaking process.
                    </li>
                    <li>
                      Exhibitors may select a contractor from the approved list
                      on the right.
                    </li>
                    <li>
                      For unlisted contractors, a registration process is
                      required with a ₹10,000 fee.
                    </li>
                    <li>
                      Once selected, the contractor selection is final. Changes
                      require an unlock request.
                    </li>
                    <li>
                      Use the email field below to send registration requests to
                      new contractors.
                    </li>
                    <li>
                      After selection, the form proceeds to the second step
                      automatically.
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
                      onClick={() =>
                        handleSendRegistrationMail(contractorEmail)
                      }
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Left Layer */}
            <div
              className={`left-layer workflow-left-layer ${workflowActive ? "slide-in-right" : "hidden"}`}
            >
              {/* Top Action Bar */}
              <div className="workflow-left-top-actions">
                <button
                  className="unlock-btn"
                  onClick={requestContractorChange}
                >
                  <FaLockOpen className="btn-icon" /> Unlock
                </button>
                <button
                  className="view-list-btn"
                  onClick={() => setShowContractorListOverlay(true)}
                >
                  <FaEye className="btn-icon" /> View Contractor List
                </button>

                {Object.values(uploadedFiles).some(Boolean) && (
                  <button
                    className="view-uploaded-btn"
                    onClick={() => {
                      const firstAvailable = uploadedFiles.step1
                        ? "step1"
                        : uploadedFiles.step2
                          ? "step2"
                          : "step3";
                      setSelectedPreviewStep(firstAvailable);
                      setPdfUrl(
                        `https://inoptics.in/api/${uploadedFiles[firstAvailable]}`,
                      );
                      setShowPdfPreview(true);
                    }}
                  >
                    <FaCloudUploadAlt className="btn-icon" /> View Uploads
                  </button>
                )}
              </div>

              {/* PDF Preview Modal */}
              {showPdfPreview && (
                <div className="pdf-preview-overlay">
                  <div className="pdf-preview-card small-card">
                    <div className="pdf-preview-header">
                      <h5>Uploaded Forms</h5>
                      <button
                        onClick={() => setShowPdfPreview(false)}
                        className="form-icon-close"
                      >
                        ✖
                      </button>
                    </div>
                    <div className="uploaded-file-list">
                      {uploadedFiles.step1 && (
                        <div className="uploaded-file-row">
                          <span>Exhibitor Confirmation & Form Upload</span>
                          <button
                            className="form-icon"
                            onClick={() => forceDownload(uploadedFiles.step1)}
                          >
                            <FaDownload />
                          </button>
                        </div>
                      )}
                      {uploadedFiles.step2 && (
                        <div className="uploaded-file-row">
                          <span>Mandatory Contractor Undertaking Form</span>
                          <button
                            className="form-icon"
                            onClick={() => forceDownload(uploadedFiles.step2)}
                          >
                            <FaDownload />
                          </button>
                        </div>
                      )}
                      {uploadedFiles.step3 && (
                        <div className="uploaded-file-row">
                          <span>
                            Booth Dimensions & Construction Guidelines
                          </span>
                          <button
                            className="form-icon"
                            onClick={() => forceDownload(uploadedFiles.step3)}
                          >
                            <FaDownload />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="workflow-left-flex-row">
                {/* Selected Contractor Info */}
                <div className="selected-contractor-container">
                  <h2 className="ExhibitorContractors-heading">
                    Selected Contractor
                  </h2>
                  <div className="selected-contractor-container-box">
                    <p>
                      <strong>Company Name:</strong>
                    </p>
                    <p>{selectedContractor?.company_name}</p>
                  </div>
                  <div className="selected-contractor-container-box">
                    <p>
                      <strong>Name:</strong>
                    </p>
                    <p>{selectedContractor?.name}</p>
                  </div>
                  <div className="selected-contractor-container-box">
                    <p>
                      <strong>City:</strong>
                    </p>
                    <p>{selectedContractor?.city}</p>
                  </div>
                  <div className="selected-contractor-container-box">
                    <p>
                      <strong>Phone/Mobile:</strong>
                    </p>
                    <p>
                      {selectedContractor?.mobile_numbers}
                      {selectedContractor?.phone_numbers
                        ? `, ${selectedContractor?.phone_numbers}`
                        : ""}
                    </p>
                  </div>
                  <div className="selected-contractor-container-box">
                    <p>
                      <strong>Email:</strong>
                    </p>
                    <p>{selectedContractor?.email}</p>
                  </div>
                </div>

                {/* Progress Checklist */}
                <div className="exhibitor-instruction-box-checklist">
                  <div className="exhibitor-instruction-header">
                    <h4>Contractor Checklist</h4>
                  </div>
                  <div className="exhibitorInstructions-container">
                    <div className="Workflow-progress">
                      <div
                        className={`wf-step ${currentStep >= 1 ? "active" : ""}`}
                      >
                        <div className="wf-step-num">1</div>
                      </div>
                      <div
                        className={`wf-step ${currentStep >= 2 ? "active" : ""}`}
                      >
                        <div className="wf-step-num">2</div>
                      </div>
                      <div
                        className={`wf-step ${currentStep >= 3 ? "active" : ""}`}
                      >
                        <div className="wf-step-num">3</div>
                      </div>
                      <div
                        className={`wf-step ${currentStep >= 4 ? "active" : ""}`}
                      >
                        <div className="wf-step-num">4</div>
                      </div>
                    </div>
                    <div className="exhibitorinsructionchecklist-box">
                      <div className="exhibitorInstructions-content-box">
                        <h2 className="ExhibitorContractors-heading-checklist">
                          Contractor Selection
                        </h2>
                      </div>
                      <div className="exhibitorInstructions-content-box">
                        <h2 className="ExhibitorContractors-heading-checklist">
                          Exhibitor - Appointed Contractor
                        </h2>
                      </div>
                      <div className="exhibitorInstructions-content-box">
                        <h2 className="ExhibitorContractors-heading-checklist">
                          Contractor Undertaking Declaration
                        </h2>
                      </div>
                      <div className="exhibitorInstructions-content-box">
                        <h2 className="ExhibitorContractors-heading-checklist">
                          Upload Designs & Documents
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Container */}
          <div className="ExhibitorContractors-rightContainer">
            {/* Original Right Layer - Contractor Table */}
            <div
              className={`right-layer original-layer ${workflowActive ? "slide-out-right" : "visible"}`}
            >
              <div className="ExhibitorContractors-exhibitor-cont-table-container">
                <table className="ExhibitorContractors-appointed-contractor-table">
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
                    {contractorData.map((contractor, index) => (
                      <tr key={contractor.id}>
                        <td>{index + 1}</td>
                        <td>{contractor.company_name}</td>
                        <td>{contractor.name}</td>
                        <td>{contractor.city}</td>
                        <td>
                          {contractor.mobile_numbers}
                          {contractor.phone_numbers
                            ? `, ${contractor.phone_numbers}`
                            : ""}
                        </td>
                        <td>{contractor.email}</td>
                        <td>
                          {selectedContractorId === contractor.id ? (
                            <button
                              className="ExhibitorContractors-unselect-btn"
                              onClick={unselectContractor}
                            >
                              Unselect
                            </button>
                          ) : (
                            <button
                              className="ExhibitorContractors-select-btn"
                              onClick={() => {
                                setSelectedContractorTemp(contractor);
                                setShowPopup(true);
                              }}
                              disabled={!!selectedContractorId}
                            >
                              Select
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Workflow Right Layer */}
            <div
              className={`right-layer workflow-layer ${workflowActive ? "slide-in-left" : "hidden"}`}
            >
              {/* Preview Popup for Step 1 & 2 */}
              {showPreview && (
                <div className="Workflow-warning-popup-overlay">
                  <div className="Workflow-pdf-preview-popup">
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
                        onClick={handleFinalUpload}
                      >
                        Submit & Upload
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Booth Design Preview */}
              {showBoothDesignPreview && (
                <div className="Workflow-warning-popup-overlay">
                  <div className="Workflow-pdf-preview-popup">
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
                          title="PDF Preview"
                          width="100%"
                          height="500px"
                        />
                      ) : (
                        <p>No preview available</p>
                      )}
                    </div>
                    <div className="Workflow-pdf-footer">
                      <button
                        className="Workflow-pdf-submit-btn"
                        onClick={handleBoothDesignUpload}
                      >
                        Submit & Upload
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Exhibitor Form */}
              <div
                className={`Workflow-panel panel-step-1 ${currentStep === 1 ? "show" : "hide-left"}`}
              >
                <div className="ExhibitorStep1-grid">
                  <div className="ExhibitorInstructions">
                    <div>
                      <h4>Step 2: Exhibitor Confirmation & Form Upload</h4>
                      <ul className="instruction-alignment">
                        <li>
                          Download the mandatory Exhibitor Form, sign and stamp
                          it.
                        </li>
                        <li>Upload the completed form to proceed to Step 3.</li>
                        <li>
                          This confirms your intent to appoint the selected
                          contractor.
                        </li>
                        <li>
                          Changes require an unlock request after submission.
                        </li>
                      </ul>
                    </div>
                    <div className="step-1-actions">
                      <button
                        className="doc-btn download-btn"
                        onClick={() =>
                          handleDownload(
                            "https://inoptics.in/api/uploads/1752656815_APPOINTED CONTRACTOR & CONTRACTOR BADGES-2.pdf",
                            "APPOINTED_CONTRACTOR_FORM.pdf",
                          )
                        }
                      >
                        <FaDownload /> Download
                      </button>
                      <label className="doc-btn">
                        <FaUpload className="doc-icon-exhibitor" /> Upload
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
                        className="Workflow-next-btn doc-btn"
                        disabled={!uploadedSteps.step1}
                        onClick={() => setCurrentStep(2)}
                        style={{
                          opacity: uploadedSteps.step1 ? 1 : 0.4,
                          cursor: uploadedSteps.step1
                            ? "pointer"
                            : "not-allowed",
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Contractor Undertaking */}
              <div
                className={`Workflow-panel panel-step-2 ${currentStep === 2 ? "show" : "hide-right"}`}
              >
                <div className="ExhibitorStep1-grid">
                  <div className="ExhibitorInstructions">
                    <div>
                      <h4>Step 3: Mandatory Contractor Undertaking Form</h4>
                      <ul className="instruction-alignment">
                        <li>
                          This form must be completed by your selected
                          contractor.
                        </li>
                        <li>
                          Send the form directly using the button or download
                          and share manually.
                        </li>
                        <li>
                          Contractor must sign, stamp, and return the form to
                          you.
                        </li>
                        <li>Upload the signed form to complete this step.</li>
                      </ul>
                    </div>
                    <div className="contractor-form-btn">
                      <button
                        className="doc-btn"
                        onClick={sendFormToContractor}
                      >
                        Send Form To Contractor
                      </button>
                    </div>
                    <div className="step-1-actions">
                      <button
                        className="doc-btn download-btn"
                        onClick={() =>
                          handleDownload(
                            "https://inoptics.in/api/uploads/1752656839_CONTRACTOR UNDERTAKING-DECLARATION & REGISTRATION-3.pdf",
                            "CONTRACTOR_UNDERTAKING_FORM.pdf",
                          )
                        }
                      >
                        <FaDownload /> Download
                      </button>
                      <label className="doc-btn">
                        <FaUpload className="doc-icon-exhibitor" /> Upload
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
                        className="Workflow-next-btn doc-btn"
                        disabled={!uploadedSteps.step2}
                        onClick={() => setCurrentStep(3)}
                        style={{
                          opacity: uploadedSteps.step2 ? 1 : 0.4,
                          cursor: uploadedSteps.step2
                            ? "pointer"
                            : "not-allowed",
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Booth Design Upload */}
              <div
                className={`Workflow-panel panel-step-2 ${currentStep === 3 ? "show" : "hide-right"}`}
              >
                <div className="ExhibitorStep1-grid">
                  <div className="ExhibitorInstructions">
                    <div>
                      <h4>
                        Step 4: Booth Dimensions & Construction Guidelines
                      </h4>
                      <ul className="instruction-alignment">
                        <li>Maximum booth height: 3.0 metres (12 feet)</li>
                        <li>Construction must stay within allotted area</li>
                        <li>All materials must be fire-retardant</li>
                        <li>
                          Pre-fabricated structures only - no on-site carpentry
                        </li>
                        <li>Mezzanine floors are not permitted</li>
                      </ul>
                    </div>
                    <div className="contractor-form-btn">
                      <label className="doc-btn">
                        <FaUpload className="doc-icon-exhibitor" /> Upload
                        <input
                          type="file"
                          accept="application/pdf"
                          style={{ display: "none" }}
                          onChange={handleFileSelect}
                        />
                      </label>
                      <button
                        className="Workflow-next-btn doc-btn"
                        disabled={!uploadedSteps.step3}
                        onClick={() => {
                          setIsReuploading(false);
                          setBoothDesignStatus("pending");
                          setCurrentStep(4);
                        }}
                        style={{
                          opacity: uploadedSteps.step3 ? 1 : 0.4,
                          cursor: uploadedSteps.step3
                            ? "pointer"
                            : "not-allowed",
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Status Cards */}
              <div
                className={`Workflow-panel panel-step-2 ${currentStep === 4 ? "show" : "hide-right"}`}
              >
                {boothDesignStatus === "pending" && (
                  <div className="contractor-thankyou-card warning">
                    <h3>Booth Design Under Review</h3>
                    <p>Please wait for approval.</p>
                  </div>
                )}

                {boothDesignStatus === "rejected" && (
                  <div className="contractor-thankyou-card rejected">
                    <h3>Booth Design Rejected ❌</h3>
                    <div className="reject-reason-box">
                      {boothRejectReason || "No reason provided by admin."}
                    </div>
                    <button
                      className="doc-btn"
                      onClick={() => {
                        setIsReuploading(true);
                        setBoothRejectReason("");
                        setCurrentStep(3);
                      }}
                    >
                      Re-Upload Booth Design
                    </button>
                  </div>
                )}

                {boothDesignStatus === "approved" && (
                  <div className="contractor-thankyou-card success">
                    <h3>Thank you 🎉</h3>
                    <p>Your booth design has been approved.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitorContractors;
