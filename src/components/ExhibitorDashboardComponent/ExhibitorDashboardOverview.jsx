import ExhibitorPaymentReviewTable from "./ExhibitorPaymentReviewTable";

const ExhibitorDashboardOverview = ({
  importantPage,
  activeMenu,
  exhibitorData,

  eventScheduleData,
  latestNewsData,

  activities,

  stallList,
  powerData,
}) => {
  if (importantPage || activeMenu !== "Dashboard" || !exhibitorData) {
    return null;
  }

  return (
    <div className="exhibitordashboard-content">
      <div className="exhibitordashboard-dashboard-grid">
        <div className="exhibitordashboard-big-container">
          {/* ================= TOP ROW ================= */}
          <div className="exhibitordashboard-row">
            {/* LEFT SIDE */}
            <div className="exhibitordashboard-left-container">
       
              {/* ================= PAYMENT REVIEW ================= */}
              <div className="exhibitordashboard-bottom">
                <div className="exhibitordashboard-card">
                  <h2 className="particular-heading">
                    Exhibitor Payments Review
                  </h2>

                  {stallList.length === 0 ? (
                    <p className="profile-empty">No stall details found.</p>
                  ) : (
                    <ExhibitorPaymentReviewTable
                      stallList={stallList}
                      powerData={powerData}
                    />
                  )}
                </div>
                <div clsassName="exhibitordashboard-left-container-desktop">
                  <div className="exhibitordashboard-middle">
                    <div className="exhibitordashboard-card">
                      <div className="exhibitordashboard-section">
                        <h3>Event Schedule</h3>

                        {eventScheduleData.length === 0 ? (
                          <p>No event schedule found.</p>
                        ) : (
                          <div
                            className="event-schedule-description"
                            dangerouslySetInnerHTML={{
                              __html: eventScheduleData[0].description,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="exhibitordashboard-card">
                    <div className="exhibitordashboard-section">
                      <h3>Latest News</h3>

                      {latestNewsData.length === 0 ? (
                        <p>No latest news available.</p>
                      ) : (
                        latestNewsData.map((item, index) => (
                          <div key={index} className="news-item">
                            <h4>{item.title}</h4>
                            <p>{item.text}</p>

                            {item.news_link && (
                              <a
                                href={item.news_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="news-link"
                              >
                                Read more →
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              
            </div>

            {/* RIGHT SIDE – CHECKLIST */}
            <div className="exhibitordashboard-bottom">
              <div className="exhibitordashboard-card">
                <h3>Exhibitor Checklist</h3>

                <div className="checklist-list">
                  {activities.map((item) => {
                    const isDone = item.done;

                    return (
                      <div
                        key={item.id}
                        className={`checklist-row ${
                          isDone ? "completed" : "pending"
                        }`}
                      >
                        <div className="checklist-left">
                          <span className="checklist-icon">
                            {isDone ? "✓" : "!"}
                          </span>

                          <span className="checklist-name">{item.name}</span>
                        </div>

                        <span className="checklist-status">
                          {isDone ? "Completed" : "Pending"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitorDashboardOverview;
