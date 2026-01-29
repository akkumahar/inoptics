const ExhibitorPaymentReviewTable = ({ stallList, powerData }) => {
  const showSGST = stallList.some(
    (s) => parseFloat(s.sgst_9_percent) > 0,
  );
  const showCGST = stallList.some(
    (s) => parseFloat(s.cgst_9_percent) > 0,
  );
  const showIGST = stallList.some(
    (s) => parseFloat(s.igst_18_percent) > 0,
  );

  const calcTotals = (row) => {
    if (!row) {
      return { amount: 0, sgst: 0, cgst: 0, igst: 0, grandTotal: 0 };
    }

    const amount = parseFloat(row.total_amount || 0);
    let sgst = 0,
      cgst = 0,
      igst = 0,
      grandTotal = amount;

    if (showSGST || showCGST) {
      sgst = amount * 0.09;
      cgst = amount * 0.09;
      grandTotal = amount + sgst + cgst;
    } else if (showIGST) {
      igst = amount * 0.18;
      grandTotal = amount + igst;
    }

    return { amount, sgst, cgst, igst, grandTotal };
  };

  const setup = powerData.find((p) =>
    p.day?.toLowerCase().includes("setup"),
  );
  const exhibition = powerData.find((p) =>
    p.day?.toLowerCase().includes("exhibition"),
  );

  const setupTotals = calcTotals(setup);
  const exhibitionTotals = calcTotals(exhibition);






//   payment row data 
const PowerRow = ({
  label,
  row,
  totals,
  showSGST,
  showCGST,
  showIGST,
}) => {
  if (!row) return null;

  return (
    <tr>
      <td className="particular-cell">
        Power Requirement {label} : {row.power_required} Unit
      </td>

      <td>{row.price_per_kw ? `₹${row.price_per_kw}` : "-"}</td>
      <td>{`₹${totals.amount.toFixed(2)}`}</td>

      {showSGST && <td>{`₹${totals.sgst.toFixed(2)}`}</td>}
      {showCGST && <td>{`₹${totals.cgst.toFixed(2)}`}</td>}
      {showIGST && <td>{`₹${totals.igst.toFixed(2)}`}</td>}

      <td className="grand-total-cell">
        {`₹${totals.grandTotal.toFixed(2)}`}
      </td>
    </tr>
  );
};


  return (
    <table className="stall-payment-table">
      <thead>
        <tr>
          <th className="particular-col">Particular</th>
          <th>Price/sq mtr</th>
          <th>Amount</th>
          {showSGST && <th>SGST (9%)</th>}
          {showCGST && <th>CGST (9%)</th>}
          {showIGST && <th>IGST (18%)</th>}
          <th>Grand Total</th>
        </tr>
      </thead>

      <tbody>
        {stallList.map((stall, idx) => (
          <tr key={idx}>
            <td className="particular-cell">
              {`Stall No: ${stall.stall_number || "N/A"}, 
              Category: ${stall.stall_category || "N/A"}, 
              Area: ${
                stall.stall_area
                  ? `${stall.stall_area} sq. mtr`
                  : "N/A"
              }`}
            </td>

            <td>{stall.stall_price ? `₹${stall.stall_price}` : "-"}</td>
            <td>{stall.total ? `₹${stall.total}` : "-"}</td>

            {showSGST && (
              <td>
                {stall.sgst_9_percent > 0
                  ? `₹${stall.sgst_9_percent}`
                  : "-"}
              </td>
            )}
            {showCGST && (
              <td>
                {stall.cgst_9_percent > 0
                  ? `₹${stall.cgst_9_percent}`
                  : "-"}
              </td>
            )}
            {showIGST && (
              <td>
                {stall.igst_18_percent > 0
                  ? `₹${stall.igst_18_percent}`
                  : "-"}
              </td>
            )}

            <td className="grand-total-cell">
              {stall.grand_total ? `₹${stall.grand_total}` : "-"}
            </td>
          </tr>
        ))}

        {powerData.length > 0 && (
          <>
            <PowerRow
              label="SETUP DAYS"
              row={setup}
              totals={setupTotals}
              showSGST={showSGST}
              showCGST={showCGST}
              showIGST={showIGST}
            />

            <PowerRow
              label="EXHIBITION DAYS"
              row={exhibition}
              totals={exhibitionTotals}
              showSGST={showSGST}
              showCGST={showCGST}
              showIGST={showIGST}
            />
          </>
        )}
      </tbody>
    </table>
  );
};

export default ExhibitorPaymentReviewTable;
