import React from "react";
import "./ExhibitorPowerRequirement.css";

const PowerRequirementSection = ({
  currentExhibitor,

  exhibitorPricePerKw,
  isViewOnly,
  setPowerFormStep,
  powerFormStep,
  exhibitorPowerRequired,
  exhibitorPhase,
  exhibitorTotalAmount,

  handlePowerFormPowerChange,
  handlePowerFormPhaseChange,
  handlePowerFormNext,
  handlePowerFormPrevious,
  handlePowerFormAdd,

  showExhibitorEditForm,
  handlePowerUnlockRequest,
onFinalSubmit,
  previewTableList,
  powerData,
  handleResetPowerData,

  totalPrice,
  cgst,
  sgst,
  igst,
  grandTotal,

  ExhibitorPowerForm,
}) => {
  if (!currentExhibitor) return null;

  return (
    <>
      {/* ================= TOP WRAPPER ================= */}

      <div className="Exhibitor-power-requirement-wrapper">
        {/* ---------- LEFT FORM ---------- */}

        <div className="Exhibitor-power-requirement-form-left">
          <ul id="Exhibitor-progressbar">
            {["SETUP DAYS", "EXHIBITION DAYS"].map((type, index) => (
              <li key={type} className={index <= powerFormStep ? "active" : ""}>
                {type}
              </li>
            ))}
          </ul>

          <ExhibitorPowerForm
            exhibitorPricePerKw={exhibitorPricePerKw}
            isViewOnly={isViewOnly}
            setPowerFormStep={setPowerFormStep}
            powerFormStep={powerFormStep}
            exhibitorPowerRequired={exhibitorPowerRequired}
            exhibitorPhase={exhibitorPhase}
            exhibitorTotalAmount={exhibitorTotalAmount}
            onPowerChange={handlePowerFormPowerChange}
            onPhaseChange={handlePowerFormPhaseChange}
            onNext={handlePowerFormNext}
            onPrevious={handlePowerFormPrevious}
            onAdd={handlePowerFormAdd}
            onFinalSubmit={onFinalSubmit}
            handlePowerUnlockRequest={handlePowerUnlockRequest}
          />
        </div>

        {/* ---------- RIGHT INSTRUCTION ---------- */}

        <div className="Exhibitor-power-requirement-instruction-box">
          {/* <div className="Exhibitor-power-requirement-top-buttons-inside-box">
            {!isViewOnly ? (
              <button
                className="Exhibitor-power-btn submit-btn"
                onClick={handleExhibitorPowerSubmit}
              >
                {showExhibitorEditForm ? "Update" : "Submit"}
              </button>
            ) : (
              <button
                className="Exhibitor-power-btn unlock-request-btn"
                onClick={handlePowerUnlockRequest}
              >
                Request to Unlock
              </button>
            )}
          </div> */}

          <h3>Power Requirement Guidelines</h3>

          <ul>
            <li>
              Power requirements for setup days and exhibition days must be
              submitted separately.
            </li>
            <li>Power will be arranged as per the requirement form.</li>
            <li>Requests after deadline may incur additional charges.</li>
            <li>If unsure, consult your fabricator.</li>
            <li>Ensure proper wiring is used.</li>
            <li>Thank you for your cooperation.</li>
          </ul>
        </div>
      </div>

      {/* ================= TABLE + BILLING ================= */}

      <div className="Exhibitor-power-requirement-below-section">
        {/* ---------- TABLE ---------- */}

        <div className="Exhibitor-power-requirement-table-container">
          <div className="Exhibitor-power-table-scroll">
            <table className="Exhibitor-power-requirement-table">
              <thead>
                <tr>
                  <th>Days</th>
                  <th>Price per KW</th>
                  <th>Power Required</th>
                  <th>Phase</th>
                  <th>Total Amount</th>
                  {/* {!isViewOnly && <th>Action</th>} */}
                </tr>
              </thead>

              <tbody>
                {previewTableList.length > 0 && !isViewOnly ? (
                  previewTableList.map((item, index) => (
                    <tr key={index}>
                      <td>{item.day}</td>
                      <td>{item.pricePerKw}</td>
                      <td>{item.powerRequired}</td>
                      <td>{item.phase}</td>
                      <td>{item.totalAmount}</td>

                      {/* {index === 0 && (
                        <td rowSpan={previewTableList.length}>
                          <button
                            onClick={handleResetPowerData}
                            className="Exhibitor-Power-remove-btn"
                          >
                            Remove
                          </button>
                        </td>
                      )} */}
                    </tr>
                  ))
                ) : powerData.length > 0 ? (
                  powerData.map((item, i) => (
                    <tr key={i}>
                      <td>{item.day}</td>
                      <td>{item.price_per_kw}</td>
                      <td>{item.power_required}</td>
                      <td>{item.phase}</td>
                      <td>{item.total_amount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No data to display
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ===== MOBILE ONLY — POWER CARDS ===== */}
            <div className="power-mobile-only">
              {(previewTableList.length > 0 && !isViewOnly
                ? previewTableList
                : powerData
              ).map((item, index) => {
                const row =
                  previewTableList.length > 0 && !isViewOnly
                    ? item
                    : {
                        day: item.day,
                        pricePerKw: item.price_per_kw,
                        powerRequired: item.power_required,
                        phase: item.phase,
                        totalAmount: item.total_amount,
                      };

                return (
                  <div key={index} className="power-m-card">
                    <div className="pmc-title">{row.day}</div>

                    <div className="pmc-row">
                      <span>Price per KW</span>
                      <b className="pmc-row-details">{row.pricePerKw}</b>
                    </div>

                    <div className="pmc-row">
                      <span>Power Required</span>
                      <b className="pmc-row-details">{row.powerRequired}</b>
                    </div>

                    <div className="pmc-row">
                      <span>Phase</span>
                      <b className="pmc-row-details">{row.phase}</b>
                    </div>

                    <div className="pmc-divider" />

                    <div className="pmc-total">
                      Total Amount
                      <strong className="pmc-total">{row.totalAmount}</strong>
                    </div>

                    {/* {!isViewOnly &&
                      previewTableList.length > 0 &&
                      index === 0 && (
                        <button
                          onClick={handleResetPowerData}
                          className="pmc-remove-btn"
                        >
                          Remove
                        </button>
                      )} */}
                  </div>  
                );
              })}
            </div>
          </div>
        </div>
        {/* ---------- BILLING ---------- */}

        <div className="Exhibitor-power-requirement-billing">
          <h3>Power Requirement Billing</h3>

          <div className="Exhibitor-power-requirement-stalls-forms-group">
            <span>Company:</span>
            <strong>{currentExhibitor.company_name || "-"}</strong>
          </div>

          <div className="Exhibitor-power-requirement-stalls-forms-group">
            <span>State:</span>
            <strong>{currentExhibitor.state || "N/A"}</strong>
          </div>

          <div className="Exhibitor-power-requirement-stalls-forms-group">
            <span>Total Price:</span>
            <strong>{totalPrice.toFixed(2)} ₹</strong>
          </div>

          {currentExhibitor.state?.toLowerCase() === "delhi" ? (
            <>
              <div className="Exhibitor-power-requirement-stalls-forms-group">
                <span>CGST (9%):</span>
                <strong>{cgst.toFixed(2)} ₹</strong>
              </div>

              <div className="Exhibitor-power-requirement-stalls-forms-group">
                <span>SGST (9%):</span>
                <strong>{sgst.toFixed(2)} ₹</strong>
              </div>
            </>
          ) : (
            <div className="Exhibitor-power-requirement-stalls-forms-group">
              <span>IGST (18%):</span>
              <strong>{igst.toFixed(2)} ₹</strong>
            </div>
          )}

          <div className="Exhibitor-power-requirement-stalls-forms-group total">
            <span>Grand Total:</span>
            <strong>{grandTotal.toFixed(2)} ₹</strong>
          </div>
        </div>
      </div>
    </>
  );
};

export default PowerRequirementSection;
