import React from "react";

const UnlockContractor = ({

  unlockRequests = [],
  loading = false,
  processing = null,
  handleUnlock = () => {},
}) => {

    

  return (
    <>
      <div className="table-scroll-wrapper">
        <div className="contractor-table-container">
          <table className="contractor-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Exhibitor Company</th>
                <th>Exhibitor Email</th>
                <th>Contractor Name</th>
                <th>Contractor Email</th>
                <th>Requested At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Loading...</td>
                </tr>
              ) : !Array.isArray(unlockRequests) ||
                unlockRequests.length === 0 ? (
                <tr>
                  <td colSpan="7">No unlock requests</td>
                </tr>
              ) : (
                unlockRequests.map((req, index) => (
                  <tr key={req.exhibitor_company || index}>
                    <td>{index + 1}</td>

                    <td>{req.exhibitor_company}</td>

                    <td>{req.exhibitor_email}</td>

                    <td>{req.contractor_name}</td>

                    <td className="contractor-email-cell">
                      {req.contractor_email}
                    </td>

                    <td>{req.requested_at}</td>

                    <td className="contractor-action-cell">
                      <button
                        className="action-btn edit-btn"
                        disabled={processing === req.exhibitor_company}
                        onClick={() => handleUnlock(req.exhibitor_company)}
                      >
                        {processing === req.exhibitor_company
                          ? "Unlocking..."
                          : "Unlock"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default UnlockContractor;
