import React from "react";

const ExhibitorPowerForm = ({
  exhibitorPricePerKw,
  isViewOnly,
  powerFormStep,          // ✅ renamed
  exhibitorPowerRequired,
  exhibitorPhase,
  exhibitorTotalAmount,
  onPowerChange,
  onPhaseChange,
  onNext,
  onPrevious,
  onAdd,
}) => {
  const steps = ["SETUP DAYS", "EXHIBITION DAYS"];

  const safeStep = powerFormStep ?? 0; // ✅ safety
  const type = steps[safeStep];

  return (
    <form className="Exhibitor-power-requirement-stalls-form-wrapper">
      <div className="Exhibitor-power-requirement-stalls-form-grid slide-active">
        {/* ROW 1 */}
        <div className="Exhibitor-power-requirement-stalls-form-row">
          <div className="Exhibitor-power-requirement-stalls-form-group">
            <label>TYPE:</label>
            <input type="text" value={type} readOnly />
          </div>

          <div className="Exhibitor-power-requirement-stalls-form-group">
            <label>PRICE PER KW:</label>
            <input type="text" value={exhibitorPricePerKw} readOnly />
          </div>
        </div>

        {/* ROW 2 */}
        <div className="Exhibitor-power-requirement-stalls-form-row">
          <div className="Exhibitor-power-requirement-stalls-form-group">
            <label>POWER REQUIRED:</label>
            <input
              type="number"
              value={exhibitorPowerRequired}
              onChange={onPowerChange}
              disabled={isViewOnly}
            />
          </div>

          <div className="Exhibitor-power-requirement-stalls-form-group">
            <label>PHASE:</label>
            <div className="Exhibitor-phase-options">
              <label>
                <input
                  type="radio"
                  name={`phase-${safeStep}`}   // ✅ stable
                  value="Single Phase"
                  checked={exhibitorPhase === "Single Phase"}
                  onChange={onPhaseChange}
                  disabled={isViewOnly}
                />
                Single
              </label>

              <label>
                <input
                  type="radio"
                  name={`phase-${safeStep}`}
                  value="Three Phase"
                  checked={exhibitorPhase === "Three Phase"}
                  onChange={onPhaseChange}
                  disabled={isViewOnly}
                />
                Three
              </label>
            </div>
          </div>
        </div>

        {/* ROW 3 */}
        <div className="Exhibitor-power-requirement-stalls-form-row">
          <div className="Exhibitor-power-requirement-stalls-form-group">
            <label>TOTAL AMOUNT:</label>
            <input type="text" value={exhibitorTotalAmount} readOnly />
          </div>

          <div className="Exhibitor-power-requirement-add-button-inline">
            {safeStep > 0 && (
              <button type="button" onClick={onPrevious}>
                Previous
              </button>
            )}

            {safeStep < 1 ? (
              <button
                type="button"
                onClick={onNext}
                disabled={isViewOnly}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={onAdd}
                disabled={isViewOnly}
              >
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default ExhibitorPowerForm;
