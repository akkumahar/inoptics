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
  companyRemarks,
  loadingRemarks,
  remarkError,
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
                      <div className="checklist-flex-both-icon">
                        <span className="checklist-icon">
                          {a.done ? "✓" : "!"}
                        </span>
                        <span className="checklist-status only-mobile-version">
                          {a.done ? "Completed" : "Pending"}
                        </span>
                      </div>
                      {a.name}
                    </div>
                    <span className="checklist-status only-desktop-version">
                      {a.done ? "Completed" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="exhibitordashboard-card-flex">
              {/* <div className="exhibitordashboard-card">
                <h3>Latest News</h3>
                {latestNewsData.map((n, i) => (
                  <div key={i} className="news-item">
                    <h4>{n.title}</h4>
                    <p>{n.text}</p>
                    {n.news_link && <a href={n.news_link}>Read more →</a>}
                  </div>
                ))}
              </div> */}

            
              <div className="exhibitordashboard-card">
                <h3>Event Schedule</h3>
                <div
                  dangerouslySetInnerHTML={{
                    __html: eventScheduleData?.[0]?.description || "",
                  }}
                />
              </div>
            </div>


            <div className="remarks-container ">
              <p>Remarks</p>

  {loadingRemarks && <p className="remarks-loading">Loading remarks...</p>}

  {remarkError && (
    <p className="remarks-error">{remarkError}</p>
  )}

  {!loadingRemarks && companyRemarks.length === 0 && (
    <p className="remarks-empty">No remarks available.</p>
  )}

  {companyRemarks.length > 0 && (
    <ul className="remarks-list">
      {companyRemarks.map((remark) => (
        <li key={remark.id} className="remark-card">
          <p className="remark-text">{remark.remark}</p>
        </li>
      ))}
    </ul>
  )}

</div>




          </div>

          {/* ================= STALL ================= */}
          {/* <div className="exhibitordashboard-card table-scroll-wrap">
            <h3 className="particular-heading-center">Stalls Payments Review</h3>

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

            
            <div className="stall-mobile-cards">
              {stallList.map((stall, i) => (
                <div key={i} className="stall-m-card">
                  <div className="sm-head">Stall Details</div>

                  <div className="sm-row">
                    <span>Stall No:</span>
                    <b className="sm-row-right">{stall.stall_number}</b>
                  </div>
                  <div className="sm-row">
                    <span>Category:</span>
                    <b className="sm-row-right">{stall.stall_category}</b>
                  </div>
                  <div className="sm-row">
                    <span>Area:</span>
                    <b className="sm-row-right">{stall.stall_area} sq. mtr</b>
                  </div>

                  <div className="sm-divider" />

                  <div className="sm-row">
                    <span>Price/sq mtr:</span>
                    <b className="sm-row-right">₹{stall.stall_price}</b>
                  </div>
                  <div className="sm-row">
                    <span>Amount:</span>
                    <b className="sm-row-right">₹{stall.total}</b>
                  </div>

                  {showSGST && (
                    <div className="sm-row">
                      <span>SGST (9%):</span>
                      <b className="sm-row-right">₹{stall.sgst_9_percent}</b>
                    </div>
                  )}

                  {showCGST && (
                    <div className="sm-row">
                      <span>CGST (9%):</span>
                      <b className="sm-row-right">₹{stall.cgst_9_percent}</b>
                    </div>
                  )}

                  {showIGST && (
                    <div className="sm-row">
                      <span>IGST (18%):</span>
                      <b className="sm-row-right">₹{stall.igst_18_percent}</b>
                    </div>
                  )}

                  <div className="sm-divider" />

                  <div className="sm-grand">
                    Grand Total
                    <strong className="sm-grand">₹{stall.grand_total}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* ================= POWER ================= */}
          {/* <div className="exhibitordashboard-card table-scroll-wrap">
            <h3 className="particular-heading-center">Power Payments Review</h3>

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

            
            <div className="power-mobile-only">
              {(() => {
                const setupRows = powerData.filter((p) =>
                  p.day?.toLowerCase().includes("setup"),
                );

                const exhibitionRows = powerData.filter((p) =>
                  p.day?.toLowerCase().includes("exhibition"),
                );

                const renderBlock = (title, rows) => {
                  if (!rows.length) return null;

                  // 👉 if multiple rows same type — sum them
                  const totals = rows.map((r) => calcPowerTotals(r));

                  const sum = totals.reduce(
                    (a, t) => ({
                      amount: a.amount + t.amount,
                      sgst: a.sgst + t.sgst,
                      cgst: a.cgst + t.cgst,
                      igst: a.igst + t.igst,
                      grand: a.grand + t.grand,
                    }),
                    { amount: 0, sgst: 0, cgst: 0, igst: 0, grand: 0 },
                  );

                  const first = rows[0];

                  return (
                    <div className="pm-card-block">
                      <div className="pm-title">{title}</div>

                      <div className="pm-row">
                        <span>Units</span>
                        <b className="sm-row-right">
                          {rows.reduce(
                            (u, r) => u + Number(r.power_required || 0),
                            0,
                          )}
                        </b>
                      </div>

                      <div className="pm-row">
                        <span>Price / KW</span>
                        <b className="sm-row-right">₹{first.price_per_kw}</b>
                      </div>

                      <div className="pm-row">
                        <span>Amount</span>
                        <b className="sm-row-right">₹{sum.amount.toFixed(2)}</b>
                      </div>

                      {showSGST && (
                        <div className="pm-row">
                          <span>SGST (9%)</span>
                          <b className="sm-row-right">₹{sum.sgst.toFixed(2)}</b>
                        </div>
                      )}

                      {showCGST && (
                        <div className="pm-row">
                          <span>CGST (9%)</span>
                          <b className="sm-row-right">₹{sum.cgst.toFixed(2)}</b>
                        </div>
                      )}

                      {showIGST && (
                        <div className="pm-row">
                          <span>IGST (18%)</span>
                          <b className="sm-row-right">₹{sum.igst.toFixed(2)}</b>
                        </div>
                      )}

                      <div className="pm-divider" />

                      <div className="pm-grand">
                        Grand Total
                        <strong className="pm-grand">₹{sum.grand.toFixed(2)}</strong>
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="pm-card">
                    {renderBlock("Setup Days", setupRows)}
                    {renderBlock("Exhibition Days", exhibitionRows)}
                  </div>
                );
              })()}
            </div>
          </div> */}

          {/* ================= BADGES ================= */}
          {/* <div className="exhibitordashboard-card table-scroll-wrap">
            <h3 className="particular-heading-center">Badges Payments Review</h3>

            {(() => {
              const b = getExhibitorBadgeBilling() || {};
              if (!b.count) return <p>No badge billing found.</p>;

              const showSG = b.sgst > 0;
              const showCG = b.cgst > 0;
              const showIG = b.igst > 0;

              return (
                <>
                 
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

                  
                  <div className="badge-mobile-only">
                    <div className="badge-m-card">
                      <div className="bm-row">
                        <span>Total Badges</span>
                        <b className="sm-row-right">{b.count}</b>
                      </div>

                      <div className="bm-row">
                        <span>Amount</span>
                        <b className="sm-row-right">₹{b.total.toFixed(2)}</b>
                      </div>

                      {showSG && (
                        <div className="bm-row">
                          <span>SGST (9%)</span>
                          <b className="sm-row-right">₹{b.sgst.toFixed(2)}</b>
                        </div>
                      )}

                      {showCG && (
                        <div className="bm-row">
                          <span>CGST (9%)</span>
                          <b className="sm-row-right">₹{b.cgst.toFixed(2)}</b>
                        </div>
                      )}

                      {showIG && (
                        <div className="bm-row">
                          <span>IGST (18%)</span>
                          <b className="sm-row-right">₹{b.igst.toFixed(2)}</b>
                        </div>
                      )}

                      <div className="bm-divider" />

                      <div className="bm-grand">
                        Grand Total
                        <strong className="bm-grand">₹{b.grandTotal.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div> */}

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
          {/* <div className="exhibitordashboard-card only-for-desktop-version">
            <h3>Latest News</h3>
            {latestNewsData.map((n, i) => (
              <div key={i} className="news-item">
                <h4>{n.title}</h4>
                <p>{n.text}</p>
                {n.news_link && <a href={n.news_link}>Read more →</a>}
              </div>
            ))}
          </div> */}

          <div className="remarks-container only-for-desktop-version">
            <p>Remarks</p>

  {loadingRemarks && <p className="remarks-loading">Loading remarks...</p>}

  {remarkError && (
    <p className="remarks-error">{remarkError}</p>
  )}

  {!loadingRemarks && companyRemarks.length === 0 && (
    <p className="remarks-empty">No remarks available.</p>
  )}

  {companyRemarks.length > 0 && (
    <ul className="remarks-list">
      {companyRemarks.map((remark) => (
        <li key={remark.id} className="remark-card">
          <p className="remark-text">{remark.remark}</p>
        </li>
      ))}
    </ul>
  )}

</div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitorDashboardOverview;
