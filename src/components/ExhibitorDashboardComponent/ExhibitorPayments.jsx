import React from "react";
import "./ExhibitorPayments.css"
const ExhibitorPaymentCards = ({
  stallSummary,
  stallPaymentCleared,
  isDelhi,
  getDiscountPercent,

  totalPrice,
  cgst,
  sgst,
  igst,
  grandTotal,
  powerCleared,

  getExhibitorBadgeBilling,
}) => {
  return (
    <div className="exhibitordashboard-content exhibitordashboard-content-payments ">
      <div className="payment-cards-container">

        {/* ================= BANK DETAILS ================= */}
        <div className="bank-details">
          <div className="bank-row">

            {[
              {
                bank: "Kotak Mahindra Bank",
                acc: "01992000000491",
                addr: "Defence Colony, New Delhi",
                ifsc: "KKBK0004620",
              },
              {
                bank: "HDFC BANK",
                acc: "99999811045088",
                addr: "Delhi",
                ifsc: "HDFC0000578",
              },
              {
                bank: "IndusInd Bank",
                acc: "259811045088",
                addr: "Karol Bagh, New Delhi",
                ifsc: "INDB0000169",
              },
              {
                bank: "Axis Bank",
                acc: "0032144225",
                addr: "Delhi",
                ifsc: "UTIB0005109",
              },
            ].map((b, i) => (
              <div className="bank-column" key={i}>
                <p><strong>A/C Name:</strong> RSD EXPOSITIONS</p>
                <p><strong>Bank Name:</strong> {b.bank}</p>
                <p><strong>Bank A/c No.:</strong> {b.acc}</p>
                <p><strong>Address:</strong> {b.addr}</p>
                <p><strong>IFSC Code:</strong> {b.ifsc}</p>
              </div>
            ))}

          </div>
        </div>

        {/* ================= PAYMENT CARDS ================= */}
        <div className="payment-card-grid">

          {/* ===== Stall Card ===== */}
          {(() => {
            const s = stallSummary || {};

            const safeTotal = Number(s.total || 0);
            const safeDiscount = Number(s.discounted_amount || 0);
            const safeSgst = Number(s.sgst || 0);
            const safeCgst = Number(s.cgst || 0);
            const safeIgst = Number(s.igst || 0);
            const safeGrand = Number(s.grand_total || 0);
            const safeCleared = Number(stallPaymentCleared || 0);

            const pending = Math.max(0, safeGrand - safeCleared);

            return (
              <div className="payment-card">
                <h4>Stall Particulars</h4>

                <div className="billing-summary">
                  <Row label="Total" value={safeTotal} />

                  {safeDiscount > 0 && (
                    <Row
                      label={`Discount (${getDiscountPercent(s)}%)`}
                      value={safeDiscount}
                    />
                  )}

                  {isDelhi ? (
                    <>
                      <Row label="SGST (9%)" value={safeSgst} />
                      <Row label="CGST (9%)" value={safeCgst} />
                    </>
                  ) : (
                    <Row label="IGST (18%)" value={safeIgst} />
                  )}

                  <Row label="Grand Total" value={safeGrand} total />

                  <Row label="Cleared Amount" value={safeCleared} />

                  <StatusRow pending={pending} />
                </div>
              </div>
            );
          })()}

          {/* ===== Power Card ===== */}
          {(() => {
            const total = Number(grandTotal || 0);
            const cleared = Number(powerCleared || 0);
            const pending = Math.max(0, total - cleared);

            return (
              <div className="payment-card">
                <h4>Power Requirement</h4>

                <div className="billing-summary">
                  <Row label="Total" value={totalPrice} />

                  {isDelhi ? (
                    <>
                      <Row label="CGST (9%)" value={cgst} />
                      <Row label="SGST (9%)" value={sgst} />
                    </>
                  ) : (
                    <Row label="IGST (18%)" value={igst} />
                  )}

                  <Row label="Grand Total" value={total} total />
                  <Row label="Cleared Amount" value={cleared} />

                  <StatusRow pending={pending} />
                </div>
              </div>
            );
          })()}

          {/* ===== Badge Card ===== */}
          {(() => {
            const b = getExhibitorBadgeBilling() || {};

            return (
              <div className="payment-card">
                <h4>Exhibitor Badges</h4>

                <div className="billing-summary">
                  <div className="billing-row">
                    <span>Extra Badges</span>
                    <strong>{b.count || 0}</strong>
                  </div>

                  <Row label="Total Amount" value={b.total} />

                  {b.isDelhi ? (
                    <>
                      <Row label="CGST (9%)" value={b.cgst} />
                      <Row label="SGST (9%)" value={b.sgst} />
                    </>
                  ) : (
                    <Row label="IGST (18%)" value={b.igst} />
                  )}

                  <Row label="Grand Total" value={b.grandTotal} total />
                  <Row label="Cleared Amount" value={b.cleared} />

                  {b.pending > 0 && (
                    <Row label="Pending Amount" value={b.pending} />
                  )}
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
};

/* ================= SUB COMPONENTS ================= */

const Row = ({ label, value = 0, total }) => (
  <div className={`billing-row ${total ? "total" : ""}`}>
    <span>{label}:</span>
    <strong>₹ {Number(value || 0).toFixed(2)}</strong>
  </div>
);

const StatusRow = ({ pending }) => (
  <div
    className="billing-row"
    style={{
      color: pending <= 0 ? "green" : "red",
      fontWeight: "bold",
      marginTop: 10,
    }}
  >
    <span>{pending <= 0 ? "PAYMENT CLEARED" : "PENDING AMOUNT"}</span>
    <strong>₹ {pending.toFixed(2)}</strong>
  </div>
);

export default ExhibitorPaymentCards;
