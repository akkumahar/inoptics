import "./ExhibitorDashboardOverview.css";

const ExhibitorDashboardOverview = ({
  importantPage,
  activeMenu,
  exhibitorData,
  getExhibitorBadgeBilling,
  currentExhibitor,
  eventScheduleData,
  latestNewsData,
  activities,
  stallList,
  powerData,
}) => {
  if (importantPage || activeMenu !== "Dashboard" || !exhibitorData) {
    return null;
  }

  /* ---------- TAX VISIBILITY FROM STALL ---------- */

  const showSGST = stallList.some((s) => Number(s.sgst_9_percent) > 0);
  const showCGST = stallList.some((s) => Number(s.cgst_9_percent) > 0);
  const showIGST = stallList.some((s) => Number(s.igst_18_percent) > 0);

  const calcPowerTotals = (row) => {
    const amount = Number(row.total_amount || 0);

    let sgst = 0,
      cgst = 0,
      igst = 0,
      grand = amount;

    if (showSGST || showCGST) {
      sgst = amount * 0.09;
      cgst = amount * 0.09;
      grand = amount + sgst + cgst;
    } else if (showIGST) {
      igst = amount * 0.18;
      grand = amount + igst;
    }

    return { amount, sgst, cgst, igst, grand };
  };

  return (
    <div className="exhibitordashboard-content">
      <div className="exhibitordashboard-row">
        {/* ================= LEFT COLUMN ================= */}
        <div className="exhibitordashboard-left-container-desktop">
          <div className="only-for-mobile-version">
            <div className="exhibitordashboard-card">
              <h3>Exhibitor Checklist</h3>

              <div className="checklist-list">
                {activities.map((a) => (
                  <div
                    key={a.id}
                    className={`checklist-row ${a.done ? "completed" : "pending"}`}
                  >
                    <div className="checklist-left">
                      <span className="checklist-icon">
                        {a.done ? "✓" : "!"}
                      </span>
                      {a.name}
                    </div>
                    <span className="checklist-status">
                      {a.done ? "Completed" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="exhibitordashboard-card-flex">
              <div className="exhibitordashboard-card">
                <h3>Latest News</h3>
                {latestNewsData.map((n, i) => (
                  <div key={i} className="news-item">
                    <h4>{n.title}</h4>
                    <p>{n.text}</p>
                    {n.news_link && <a href={n.news_link}>Read more →</a>}
                  </div>
                ))}
              </div>

              {/* EVENT */}
              <div className="exhibitordashboard-card">
                <h3>Event Schedule</h3>
                <div
                  dangerouslySetInnerHTML={{
                    __html: eventScheduleData?.[0]?.description || "",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ================= STALL ================= */}
          <div className="exhibitordashboard-card table-scroll-wrap">
            <h2 className="particular-heading">
              Exhibitor Stalls Payments Review
            </h2>

            <table className="stall-payment-table">
              <thead>
                <tr>
                  <th>Particular</th>
                  <th>Price/sq mtr</th>
                  <th>Amount</th>
                  {showSGST && <th>SGST (9%)</th>}
                  {showCGST && <th>CGST (9%)</th>}
                  {showIGST && <th>IGST (18%)</th>}
                  <th>Grand Total</th>
                </tr>
              </thead>

              <tbody>
                {stallList.map((stall, i) => (
                  <tr key={i}>
                    <td>
                      Stall No: {stall.stall_number}
                      <br />
                      Category: {stall.stall_category}
                      <br />
                      Area: {stall.stall_area} sq. mtr
                    </td>

                    <td>₹{stall.stall_price}</td>
                    <td>₹{stall.total}</td>

                    {showSGST && <td>₹{stall.sgst_9_percent}</td>}
                    {showCGST && <td>₹{stall.cgst_9_percent}</td>}
                    {showIGST && <td>₹{stall.igst_18_percent}</td>}

                    <td className="grand-total-cell">₹{stall.grand_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= POWER ================= */}
          <div className="exhibitordashboard-card table-scroll-wrap">
            <h2 className="particular-heading">
              Exhibitor Power Payments Review
            </h2>

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
                {powerData.map((p, i) => {
                  const t = calcPowerTotals(p);
                  return (
                    <tr key={i}>
                      <td>
                        Power {p.day} — {p.power_required} Unit
                      </td>

                      <td>₹{p.price_per_kw}</td>
                      <td>₹{t.amount.toFixed(2)}</td>

                      {showSGST && <td>₹{t.sgst.toFixed(2)}</td>}
                      {showCGST && <td>₹{t.cgst.toFixed(2)}</td>}
                      {showIGST && <td>₹{t.igst.toFixed(2)}</td>}

                      <td className="grand-total-cell">
                        ₹{t.grand.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ================= BADGES ================= */}
          <div className="exhibitordashboard-card table-scroll-wrap">
            <h2 className="particular-heading">
              Exhibitor Badges Payments Review
            </h2>

            {(() => {
              const b = getExhibitorBadgeBilling() || {};
              if (!b.count) return <p>No badge billing found.</p>;

              const showSG = b.sgst > 0;
              const showCG = b.cgst > 0;
              const showIG = b.igst > 0;

              return (
                <table className="stall-payment-table">
                  <thead>
                    <tr>
                      <th>Particular</th>
                      <th>Total Badges</th>
                      <th>Amount</th>
                      {showSG && <th>SGST (9%)</th>}
                      {showCG && <th>CGST (9%)</th>}
                      {showIG && <th>IGST (18%)</th>}
                      <th>Grand Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td>Extra Badges — {currentExhibitor?.company_name}</td>
                      <td>{b.count}</td>
                      <td>₹{b.total.toFixed(2)}</td>

                      {showSG && <td>₹{b.sgst.toFixed(2)}</td>}
                      {showCG && <td>₹{b.cgst.toFixed(2)}</td>}
                      {showIG && <td>₹{b.igst.toFixed(2)}</td>}

                      <td className="grand-total-cell">
                        ₹{b.grandTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              );
            })()}
          </div>

          {/* EVENT */}
          <div className="exhibitordashboard-card only-for-desktop-version">
            <h3>Event Schedule</h3>
            <div
              dangerouslySetInnerHTML={{
                __html: eventScheduleData?.[0]?.description || "",
              }}
            />
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="exhibitordashboard-right-col">
          {/* CHECKLIST */}
          <div className="exhibitordashboard-card only-for-desktop-version">
            <h3>Exhibitor Checklist</h3>

            <div className="checklist-list">
              {activities.map((a) => (
                <div
                  key={a.id}
                  className={`checklist-row ${a.done ? "completed" : "pending"}`}
                >
                  <div className="checklist-left">
                    <span className="checklist-icon">{a.done ? "✓" : "!"}</span>
                    {a.name}
                  </div>
                  <span className="checklist-status">
                    {a.done ? "Completed" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* NEWS */}
          <div className="exhibitordashboard-card only-for-desktop-version">
            <h3>Latest News</h3>
            {latestNewsData.map((n, i) => (
              <div key={i} className="news-item">
                <h4>{n.title}</h4>
                <p>{n.text}</p>
                {n.news_link && <a href={n.news_link}>Read more →</a>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitorDashboardOverview;
