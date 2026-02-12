import React from "react";
import {
  FaLockOpen,
  FaEye,
  FaCloudUploadAlt,
  FaDownload,
  FaUpload,
} from "react-icons/fa";

// import "./ExhibitorContractors.css"
const ExhibitorContractors = (props) => {
  const {
    importantPage,
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
  } = props;

  if (importantPage || activeMenu !== "Contractors") return null;

  return (
    <div className="ExhibitorContractors-root">
      {showPopup && (
        <div className="ContractorPopup-overlay">
          <div className="ContractorPopup-box">
            <h3>Confirm Contractor Selection</h3>
            <p>
              Are you sure you would like to proceed with
              <strong> {selectedContractorTemp?.company_name} </strong>
              as your booth contractor?
              <p>
                {" "}
                <strong>
                  Please note that once the contractor is confirmed, the
                  selection will be locked and cannot be changed. If you wish to
                  make any changes later, an unlock request will need to be
                  submitted from the next page.
                </strong>
              </p>
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

      <div className="ExhibitorContractors-main-split">
        <div className="ExhibitorContractors-leftContainer">
          <div
            className={`left-layer original-left-layer ${
              workflowActive ? "slide-out-left" : "visible"
            }`}
          >
            <div className="ExhibitorContractors-left-top-row">
              <div className="ExhibitorContractors-left-top-item">
                <h2 className="ExhibitorContractors-heading">
                  Contractor Selection <br />& Registration Process
                </h2>
                <ul className="ExhibitorContractors-points">
                  <li>
                    This section outlines the first step in completing the
                    contractor undertaking process. Kindly follow the
                    instructions below to ensure a smooth and timely submission.
                  </li>
                  <li>
                    Exhibitors may select a contractor of their choice from the
                    approved contractor list displayed on the right-hand side of
                    the portal.
                  </li>
                  <li>
                    If an exhibitor wishes to engage a contractor who is not
                    listed, the contractor must first complete a registration
                    process. A one-time contractor registration fee of ₹10,000
                    per exhibition will be applicable.
                  </li>
                  <li>
                    Once a contractor is selected, the selection will be treated
                    as final. Any request to change the selected contractor at a
                    later stage will require a formal unlock request for
                    approval.
                  </li>
                  <li>
                    To add a new contractor to the system, exhibitors may send
                    the contractor a registration request via email using the
                    field provided below.
                  </li>
                  <li>
                    After the contractor selection is completed, the form will
                    automatically proceed to the second step of the submission
                    process.
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
            </div>
          </div>

          <div
            className={`left-layer workflow-left-layer ${
              workflowActive ? "slide-in-right" : "hidden"
            }`}
          >
            {/* NEW TOP ACTION BAR */}
            <div className="workflow-left-top-actions">
              <button className="unlock-btn" onClick={requestContractorChange}>
                <span className="btn-icon">
                  <FaLockOpen className="btn-icon" /> Unlock
                </span>
              </button>

              <button
                className="view-list-btn"
                onClick={() => setShowContractorListOverlay(true)}
              >
                <span className="btn-icon">
                  <FaEye className="btn-icon" />
                  View Contractor List
                </span>
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

                    if (firstAvailable === "step3") {
                      setPdfUrl(
                        `https://inoptics.in/api/download_exhibitor_form.php?company=${encodeURIComponent(
                          formData.company_name,
                        )}&type=booth`,
                      );
                    } else {
                      setPdfUrl(
                        `https://inoptics.in/api/${uploadedFiles[firstAvailable]}`,
                      );
                    }

                    setShowPdfPreview(true);
                  }}
                >
                  <FaCloudUploadAlt className="btn-icon" /> View Uploads
                </button>
              )}

              {showPdfPreview && (
                <div className="pdf-preview-overlay">
                  <div className="pdf-preview-card small-card">
                    {/* Header */}
                    <div className="pdf-preview-header">
                      <h5>Uploaded Forms</h5>
                      <button
                        onClick={() => setShowPdfPreview(false)}
                        className="form-icon-close"
                      >
                        ✖
                      </button>
                    </div>

                    {/* File List */}
                    <div className="uploaded-file-list">
                      {uploadedFiles.step1 && (
                        <div className="uploaded-file-row">
                          <span>Exhibitor Confirmation & Form Upload</span>
                          <div className="file-actions">
                            <button
                              className="form-icon"
                              onClick={() => forceDownload(uploadedFiles.step1)}
                              title="Download"
                            >
                              <FaDownload />
                            </button>
                          </div>
                        </div>
                      )}

                      {uploadedFiles.step2 && (
                        <div className="uploaded-file-row">
                          <span>Mandatory Contractor Undertaking Form</span>
                          <div className="file-actions">
                            <button
                              className="form-icon"
                              onClick={() => forceDownload(uploadedFiles.step2)}
                              title="Download"
                            >
                              <FaDownload />
                            </button>
                          </div>
                        </div>
                      )}

                      {uploadedFiles.step3 && (
                        <div className="uploaded-file-row">
                          <span>
                            Booth Dimensions & Construction Guidelines
                          </span>
                          <div className="file-actions">
                            <button
                              className="form-icon"
                              onClick={downloadBoothDesign}
                              title="Download"
                            >
                              <FaDownload />
                            </button>
                          </div>
                        </div>
                      )}

                      {!uploadedFiles.step1 &&
                        !uploadedFiles.step2 &&
                        !uploadedFiles.step3 && (
                          <p
                            style={{
                              textAlign: "center",
                              color: "#777",
                            }}
                          >
                            No forms uploaded yet
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="workflow-left-flex-row">
              <div className="selected-contractor-container">
                <h2 className="ExhibitorContractors-heading">
                  Selected Contractor
                </h2>
                <div className="selected-contractor-container-box">
                  <p>
                    <strong>Company Name:</strong>{" "}
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
                    <strong>Phone/Mobile:</strong>{" "}
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
                    <strong>Email:</strong>{" "}
                  </p>
                  <p>{selectedContractor?.email}</p>
                </div>
              </div>

              {/* Left: NEW INSTRUCTION CONTAINER */}
              <div className="exhibitor-instruction-box-checklist">
                <div className="exhibitor-instruction-header">
                  <h4>Contractor Checklist</h4>
                </div>

                <div className="exhibitorInstructions-container">
                  {/* LEFT — Steps */}
                  <div className="Workflow-progress">
                    <div
                      className={`wf-step ${currentStep >= 0 ? "active" : ""}`}
                    >
                      <div className="wf-step-num">1</div>
                    </div>
                    <div
                      className={`wf-step ${currentStep >= 1 ? "active" : ""}`}
                    >
                      <div className="wf-step-num">2</div>
                    </div>
                    <div
                      className={`wf-step ${currentStep >= 2 ? "active" : ""}`}
                    >
                      <div className="wf-step-num">3</div>
                    </div>
                    <div
                      className={`wf-step ${currentStep >= 3 ? "active" : ""}`}
                    >
                      <div className="wf-step-num">4</div>
                    </div>
                  </div>

                  {/* RIGHT — Step content */}
                  <div className="exhibitorinsructionchecklist-box">
                    <div className="exhibitorInstructions-content-box">
                      <h2 className="ExhibitorContractors-heading-checklist">
                        Conatractor Selection
                      </h2>
                    </div>

                    <div className="exhibitorInstructions-content-box">
                      <h2 className="ExhibitorContractors-heading-checklist">
                        Exhibitor - Appointed Contrator
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

        <div className="ExhibitorContractors-rightContainer">
          {/* Original Layer - Register Unlisted Contractor */}
          <div
            className={`right-layer original-layer ${
              workflowActive ? "slide-out-right" : "visible"
            }`}
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

          {/* Workflow Layer */}
          <div
            className={`right-layer workflow-layer ${
              workflowActive ? "slide-in-left" : "hidden"
            }`}
          >
            {/* Warning Popup */}

            {showPreview && (
              <div className="Workflow-warning-popup-overlay">
                <div
                  className="Workflow-pdf-preview-popup"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="Workflow-pdf-header">
                    <h4>Exhibitor Form Preview</h4>
                    <button
                      className="Workflow-pdf-close-btn"
                      onClick={() => setShowPreview(false)}
                    >
                      ✕
                    </button>
                  </div>

                  {/* PDF */}
                  <div className="Workflow-pdf-body">
                    <iframe src={previewURL} title="PDF Preview" />
                  </div>

                  {/* Footer */}
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

            {showBoothDesignPreview && (
              <div className="Workflow-warning-popup-overlay">
                <div
                  className="Workflow-pdf-preview-popup"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="Workflow-pdf-header">
                    <h4>Exhibitor Booth Design Preview</h4>
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

            {/* Step 1 Panel */}
            <div
              className={`Workflow-panel panel-step-1 ${
                currentStep === 1 ? "show" : "hide-left"
              }`}
            >
              {/* <h3 className="Workflow-heading"> Mandatory Form for Exhibitor</h3> */}

              <div className="ExhibitorStep1-grid">
                {/* LEFT — Instructions */}
                <div className="ExhibitorInstructions">
                  <div>
                    <h4>Step 2: Exhibitor Confirmation & Form Upload</h4>

                    <ul className="instruction-alignment">
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
                        must be initiated via the Unlock Request option
                        available in the next step.
                      </li>
                      <li>
                        Fabricator appointment is subject to organiser approval
                        and applicable security deposit guidelines, as
                        communicated by RSD Expositions.
                      </li>
                    </ul>
                  </div>

                  <div>
                    {currentStep === 1 && (
                      <div className="step-1-actions">
                        <button
                          className="doc-btn download-btn"
                          onClick={() =>
                            handleDownload(
                              `https://inoptics.in/api/uploads/1752656815_APPOINTED CONTRACTOR & CONTRACTOR BADGES-2.pdf`,
                              "1752656815_APPOINTED CONTRACTOR & CONTRACTOR BADGES-2.pdf",
                            )
                          }
                        >
                          <FaDownload /> Download
                        </button>

                        {/* Optional: Keep Upload button for manual trigger */}
                        <label className="doc-btn">
                          <FaUpload className="doc-icon-exhibitor" />
                          Upload
                          <input
                            type="file"
                            accept="application/pdf"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;

                              setSelectedFile(file);
                              setPreviewURL(URL.createObjectURL(file));
                              setShowPreview(true); // open preview
                            }}
                          />
                        </label>

                        {/* NEW: Next Button with Validation */}
                        <button
                          className="Workflow-next-btn doc-btn"
                          disabled={!uploadedSteps[`step${currentStep}`]}
                          onClick={() => setCurrentStep((s) => s + 1)}
                          style={{
                            opacity: uploadedSteps[`step${currentStep}`]
                              ? 1
                              : 0.4,
                            cursor: uploadedSteps[`step${currentStep + 1}`]
                              ? "pointer"
                              : "not-allowed",
                          }}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>

                  <br />
                  <div>
                    <p className="field-error ">
                      Access to the Next step will be enabled only after the
                      mandatory form has been downloaded, duly completed, and
                      uploaded.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 Panel */}
            <div
              className={`Workflow-panel panel-step-2 ${
                currentStep === 2 ? "show" : "hide-right"
              }`}
            >
              <div className="ExhibitorStep1-grid">
                {/* LEFT — Instructions */}
                <div className="ExhibitorInstructions">
                  <div>
                    <h4> Step 3: Mandatory Contractor Undertaking Form</h4>

                    <ul className="instruction-alignment">
                      <li>
                        This form must be completed by the selected contractor
                        as confirmation of acceptance of all exhibition rules
                        and regulations.
                      </li>
                      <li>
                        Exhibitors may send the form directly to the contractor
                        using the “Send Form To Contractor” button, or download
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
                        Completion of this step is mandatory for participation
                        in InOptics 2026.
                      </li>
                    </ul>
                  </div>

                  <div className="contractor-form-btn">
                    {currentStep === 2 && (
                      <button
                        className="doc-btn"
                        onClick={sendFormToContractor}
                      >
                        Send Form To Contractor
                      </button>
                    )}
                  </div>

                  <div>
                    {currentStep === 2 && (
                      <div className="step-1-actions">
                        <button
                          className="doc-btn download-btn"
                          onClick={() =>
                            handleDownload(
                              `https://inoptics.in/api/uploads/1752656839_CONTRACTOR UNDERTAKING-DECLARATION & REGISTRATION-3.pdf`,
                              "1752656839_CONTRACTOR UNDERTAKING-DECLARATION & REGISTRATION-3.pdf",
                            )
                          }
                        >
                          <FaDownload /> Download
                        </button>

                        {/* Optional: Keep Upload button for manual trigger */}
                        <label className="doc-btn">
                          <FaUpload className="doc-icon-exhibitor" />
                          Upload
                          <input
                            type="file"
                            accept="application/pdf"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;

                              setSelectedFile(file);
                              setPreviewURL(URL.createObjectURL(file));
                              setShowPreview(true); // open preview
                            }}
                          />
                        </label>

                        {/* NEW: Next Button with Validation */}
                        <button
                          className="Workflow-next-btn doc-btn"
                          disabled={!uploadedSteps[`step${currentStep}`]}
                          onClick={() => setCurrentStep((s) => s + 1)}
                          style={{
                            opacity: uploadedSteps[`step${currentStep}`]
                              ? 1
                              : 0.4,
                            cursor: uploadedSteps[`step${currentStep}`]
                              ? "pointer"
                              : "not-allowed",
                          }}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`Workflow-panel panel-step-2 ${
                currentStep === 3 ? "show" : "hide-right"
              }`}
            >
              <div className="ExhibitorStep1-grid">
                {/* LEFT — Instructions */}
                <div className="ExhibitorInstructions">
                  <div>
                    <h4>
                      Step 4: Booth Dimensions & Construction Guidelines (Raw
                      Space)
                    </h4>

                    <ul className="instruction-alignment">
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
                  </div>

                  <div className="contractor-form-btn">
                    <label className="doc-btn">
                      <FaUpload className="doc-icon-exhibitor" />
                      Upload
                      <input
                        type="file"
                        accept="application/pdf"
                        style={{ display: "none" }}
                        onChange={handleFileSelect}
                      />
                    </label>

                    {/* NEW: Next Button with Validation */}
                    <button
                      className="Workflow-next-btn doc-btn"
                      disabled={!uploadedSteps[`step${currentStep}`]}
                      onClick={() => {
                        setIsReuploading(false); // 🔓 auto control allow
                        setBoothDesignStatus("pending");
                        setCurrentStep(4); // 👉 pending card
                      }}
                      style={{
                        opacity: uploadedSteps[`step${currentStep}`] ? 1 : 0.4,
                        cursor: uploadedSteps[`step${currentStep}`]
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
                      setIsReuploading(true); // 🔥 STOP auto effect
                      setBoothRejectReason("");
                      setCurrentStep(3); // 🔥 go to upload step
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
  );
};

export default ExhibitorContractors;
