import React from "react";
import "./ExhibitorPayments.css";
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
  powerPreviewRows,

  getExhibitorBadgeBilling,
}) => {

   const currency = stallSummary?.currency || "₹";
  return (
    <div className="exhibitordashboard-content exhibitordashboard-content-payments ">
      <div className="payment-cards-container">
        {/* ================= BANK DETAILS ================= */}
        <div className="bank-details">
          <h3>Our Bank Details</h3>
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
                <p>
                  <strong>A/C Name:</strong> RSD EXPOSITIONS
                </p>
                <p>
                  <strong>Bank Name:</strong> {b.bank}
                </p>
                <p>
                  <strong>Bank A/c No.:</strong> {b.acc}
                </p>
                <p>
                  <strong>Address:</strong> {b.addr}
                </p>
                <p>
                  <strong>IFSC Code:</strong> {b.ifsc}
                </p>
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
            const currency = s.currency || currency;
            const pending = Math.max(0, safeGrand - safeCleared);

            return (
              <div className="payment-card">
                <h4>Stall Particulars</h4>

                {/* ✅ NEW — Stall detail rows */}
                {s.stalls?.length > 0 && (
                  <div className="stall-detail-card">
                    {s.stalls.map((stall, i) => (
                      <div key={i} className="stall-detail-grid">
                        <div className="sd-label">Stall Number:</div>
                        <div className="sd-value">
                          {stall.stall_number || "-"}
                        </div>

                        {/* <div className="sd-label">Stall Category:</div>
                            <div className="sd-value">{stall.stall_category || "-"}</div> */}

                        <div className="sd-label">Stall Area:</div>
                        <div className="sd-value">
                          {stall.stall_area
                            ? `${stall.stall_area} sq. mtr.`
                            : "-"}
                        </div>

                        <div className="sd-label">Stall Price:</div>
                        <div className="sd-value">
                         {stall.stall_price
  ? `${stall.currency || currency} ${stall.stall_price}`
  : "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="billing-summary">
                  {/* ✅ existing rows */}
                  <Row label="Total" value={safeTotal}  currency={currency}/>

                  {safeDiscount > 0 && (
                    <Row
                      label={`Discount (${getDiscountPercent(s)}%)`}
                      value={safeDiscount}
                      currency={currency}
                    />
                  )}

                  {isDelhi ? (
                    <>
                      <Row label="SGST (9%)" value={safeSgst} currency={currency}/>
                      <Row label="CGST (9%)" value={safeCgst} currency={currency} />
                    </>
                  ) : (
                    <Row label="IGST (18%)" value={safeIgst} currency={currency} />
                  )}

                  <Row label="Grand Total" value={safeGrand} total  currency={currency}/>

                  <Row label="Amount Received" value={safeCleared}  currency={currency}/>

                  <StatusRow pending={pending} currency={currency}/>
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
              <div className="payment-card power-card">
                <h4 className="card-title">Power Requirement</h4>

                {/* ✅ Detail Table */}
                {powerPreviewRows?.length > 0 && (
                  <div className="power-table">
                    <div className="power-table-head">
                      <span>Days</span>
                      <span>Phase</span>
                      <span>Price/KW</span>
                      <span>Power/KW</span>
                      <span>Amount</span>
                    </div>

                    {powerPreviewRows.map((row, i) => (
                      <div key={i} className="power-table-row">
                        <span> {row.day?.replace(/days?/i, "").trim()}</span>
                        <span>{row.phase?.replace(/phase?/i, "").trim()}</span>
                        <span>{row.pricePerKw}</span>
                        <span>{row.powerRequired}</span>
                        <span className="amt">{row.totalAmount}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ✅ Billing Summary */}
                <div className="billing-summary modern-summary">
                 <Row label="Total" value={totalPrice} currency={currency} />

                  {isDelhi ? (
                    <>
                      <Row label="CGST (9%)" value={cgst} currency={currency}/>
                      <Row label="SGST (9%)" value={sgst} currency={currency}/>
                    </>
                  ) : (
                    <Row label="IGST (18%)" value={igst} currency={currency}/>
                  )}

                  <Row label="Grand Total" value={total} total currency={currency}/>
                  <Row label="Amount Received" value={cleared} currency={currency}/>

                  <StatusRow pending={pending} currency={currency}/>
                </div>
              </div>
            );
          })()}

          {/* ===== Badge Card ===== */}
          {(() => {
            const b = getExhibitorBadgeBilling() || {};

            // ✅ date based badge price
            const cutoff = new Date("2026-03-21");
            const now = new Date();
            const amountPerBadge = now <= cutoff ? 100 : 200;

            return (
              <div className="payment-card">
                <h4>Exhibitor Paid Badges</h4>

                <div className="billing-summary">
                  {/* ✅ NEW ROW — Amount per badge */}
                  <div className="billing-row highlight-row">
                    <span>Amount Per Badge</span>
                    <strong>{currency} {amountPerBadge}</strong>
                  </div>

                  <div className="billing-row">
                    <span>Total Extra Badges</span>
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
                  <Row label="Amount Received" value={b.cleared} />

                  {b.pending > 0 && (
                    <Row label="Balance Amount" value={b.pending} />
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

const Row = ({ label, value = 0, currency = " ", total }) => (
  <div className={`billing-row ${total ? "total" : ""}`}>
    <span>{label}:</span>
    <strong>
      {currency} {Number(value || 0).toFixed(2)}
    </strong>
  </div>
);

const StatusRow = ({ pending, currency = "₹" }) => (
  <div
    className="billing-row"
    style={{
      color: pending <= 0 ? "green" : "red",
      fontWeight: "bold",
      marginTop: 10,
    }}
  >
    <span>{pending <= 0 ? "Amount Paid" : "Balance Amount"}</span>
    <strong>
      {currency} {Number(pending || 0).toFixed(2)}
    </strong>
  </div>
);

export default ExhibitorPaymentCards;
