import React, { useState, useEffect } from "react";

import "./AdminEmailsMasterComponent.css";

import CustomEditor from "../../components/CustomEditor";

const AdminEmailsMasterComponent = () => {
  // ================= STATE =================
  const [emailMasterData, setEmailMasterData] = useState([]);
  const [searchEmailQuery, setSearchEmailQuery] = useState("");

  const [showEmailMasterAddForm, setShowEmailMasterAddForm] = useState(false);
  const [showEmailMasterEditForm, setShowEmailMasterEditForm] = useState(false);

  const [selectedEmailId, setSelectedEmailId] = useState(null);

  const [emailName, setEmailName] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [appliedPlace, setAppliedPlace] = useState([]);
  const [fromEmail, setFromEmail] = useState("");
  const [attachPdf, setAttachPdf] = useState("No");
  const [adminCopyEmail, setAdminCopyEmail] = useState("");

  // ================= FETCH =================
  const fetchEmails = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_email_messages.php",
      );
      const data = await res.json();
      setEmailMasterData(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  // ================= FUNCTIONS =================

  const handleAppliedPlace = (place) => {
    if (appliedPlace.includes(place)) {
      setAppliedPlace(appliedPlace.filter((p) => p !== place));
    } else {
      setAppliedPlace([...appliedPlace, place]);
    }
  };

  const resetEmailForm = () => {
    setEmailName("");
    setEmailContent("");
    setAppliedPlace([]);
    setFromEmail("");
    setAttachPdf("No");
    setAdminCopyEmail("");
    setShowEmailMasterAddForm(false);
    setShowEmailMasterEditForm(false);
  };

  const addEmailMaster = async () => {
    try {
      await fetch("https://inoptics.in/api/add_email_message.php", {
        email_name: emailName,
        content: emailContent,
        applied_place: appliedPlace,
        set_from_email: fromEmail,
        attach_pdf: attachPdf,
        admin_copy_email: adminCopyEmail,
      });

      fetchEmails();
      resetEmailForm();
    } catch (err) {
      console.error(err);
    }
  };

  const updateEmailMaster = async () => {
    try {
      await fetch("https://inoptics.in/api/update_email_message.php", {
        id: selectedEmailId,
        email_name: emailName,
        content: emailContent,
        applied_place: appliedPlace,
        set_from_email: fromEmail,
        attach_pdf: attachPdf,
        admin_copy_email: adminCopyEmail,
      });

      fetchEmails();
      resetEmailForm();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteEmailMaster = async (id) => {
    try {
      await fetch("https://inoptics.in/api/delete_email_message.php", {
        id,
      });
      fetchEmails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setSelectedEmailId(item.id);
    setEmailName(item.email_name);
    setEmailContent(item.content);

    setAppliedPlace(
      Array.isArray(item.applied_place)
        ? item.applied_place
        : item.applied_place?.split(",") || [],
    );

    setFromEmail(item.set_from_email);
    setAttachPdf(item.attach_pdf);
    setAdminCopyEmail(item.admin_copy_email);

    setShowEmailMasterEditForm(true);
    setShowEmailMasterAddForm(false);
  };

  // ================= FILTER =================
  const filteredData = emailMasterData.filter((item) => {
    const applied = Array.isArray(item.applied_place)
      ? item.applied_place.join(", ")
      : item.applied_place || "";

    return (
      item.email_name?.toLowerCase().includes(searchEmailQuery.toLowerCase()) ||
      applied.toLowerCase().includes(searchEmailQuery.toLowerCase())
    );
  });

  // ================= UI =================
  return (
    <div className="emails-master-wrapper">
      {/* HEADER */}
      <div className="emails-header">

        <div className="emails-actions">
          <input
            placeholder="Search..."
            value={searchEmailQuery}
            className="emails-actions"
            onChange={(e) => setSearchEmailQuery(e.target.value)}
          />

          <button onClick={() => setShowEmailMasterAddForm(true)}>
            + Add Email
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="emails-table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Template</th>
              <th>Applied</th>
              <th>From</th>
              <th>PDF</th>
              <th>Admin</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, i) => (
                <tr key={item.id}>
                  <td>{i + 1}</td>

                  <td>
                    <strong>{item.email_name}</strong>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: item.content?.slice(0, 60) + "...",
                      }}
                    />
                  </td>

                  <td>
                    {Array.isArray(item.applied_place)
                      ? item.applied_place.join(", ")
                      : item.applied_place}
                  </td>

                  <td>{item.set_from_email}</td>
                  <td>{item.attach_pdf}</td>
                  <td>{item.admin_copy_email}</td>

                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteEmailMaster(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= ADD FORM (YOUR ORIGINAL UI) ================= */}
      {showEmailMasterAddForm && (
        <div className="EmailsMaster-modal-form">
          <h3>Add Email Template</h3>

          <div className="EmailsMaster-grid">
            <div className="EmailsMaster-left">
              <div className="EmailsMaster-row">
                <label>Email Name</label>
                <input
                  value={emailName}
                  onChange={(e) => setEmailName(e.target.value)}
                />
              </div>

              <div className="EmailsMaster-row">
                <label>Applied Place</label>
                <div className="EmailsMaster-checkboxes">
                  {[
                    "Exhibitor Password",
                    "Payment Receive",
                    "Stall Details",
                    "Stall Performa",
                    "Power Requirement",
                    "Exhibition Badges",
                    "Appointed Contractors",
                    "Extra Furniture Requirement",
                    "Exhibitor Unlock Request",
                    "Succesfully Unlocked Request",
                    "Exhibitor Power Unlock Request",
                    "Succesfully Power Unlocked Request",
                    "Exhibitor Power Requirement",
                    "Exhibitor Badges Unlock Request",
                    "Successfully Badges Unlocked Request",
                    "Exhibitor Badges Requirement",
                    "Exhibitor Contractor Unlock Request",
                    "Electrical Vendor Power Requirement",
                    "Stall Balance Payment",
                    "Remark Mail",
                    "Contractor Badges Unlock Request",
                    "Contractor Badges Submit",
                    "UnderTaking and Declaration Accept",
                    "Contractor Selection",
                    "Fascia Email",
                    "Booth Design Approve",
                  ].map((place) => (
                    <label key={place}>
                      <input
                        type="checkbox"
                        checked={appliedPlace.includes(place)}
                        onChange={() => handleAppliedPlace(place)}
                      />
                      {place}
                    </label>
                  ))}
                </div>
              </div>

              <div className="EmailsMaster-row">
                <label>Set From Email</label>
                <input
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                />
              </div>

              <div className="EmailsMaster-row">
                <label>Attach PDF?</label>
                <label>
                  <input
                    type="radio"
                    value="Yes"
                    checked={attachPdf === "Yes"}
                    onChange={(e) => setAttachPdf(e.target.value)}
                  />{" "}
                  Yes
                </label>

                <label>
                  <input
                    type="radio"
                    value="No"
                    checked={attachPdf === "No"}
                    onChange={(e) => setAttachPdf(e.target.value)}
                  />{" "}
                  No
                </label>
              </div>

              <div className="EmailsMaster-row">
                <label>Admin Copy Email</label>
                <input
                  value={adminCopyEmail}
                  onChange={(e) => setAdminCopyEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="EmailsMaster-right">
              <label>Email Content</label>
              <CustomEditor value={emailContent} onChange={setEmailContent} />

              <div className="EmailsMaster-actions">
                <button onClick={addEmailMaster}>Add</button>
                <button onClick={resetEmailForm}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT FORM ================= */}
      {showEmailMasterEditForm && (
        <div className="EmailsMaster-modal-form">
          <h3>Edit Email Template</h3>
          <div className="EmailsMaster-grid">
            <div className="EmailsMaster-left">
              <div className="EmailsMaster-row">
                <label>Email Name</label>
                <input
                  type="text"
                  value={emailName}
                  onChange={(e) => setEmailName(e.target.value)}
                />
              </div>

              {/* Applied Place */}
              <div className="EmailsMaster-row">
                <label>Applied Place</label>
                <div className="EmailsMaster-checkboxes">
                  {[
                    "Exhibitor Password",
                    "Payment Receive",
                    "Stall Details",
                    "Stall Performa",
                    "Power Requirement",
                    "Exhibition Badges",
                    "Appointed Contractors",
                    "Extra Furniture Requirement",
                    "Exhibitor Unlock Request",
                    "Succesfully Unlocked Request",
                    "Exhibitor Power Unlock Request",
                    "Succesfully Power Unlocked Request",
                    "Exhibitor Power Requirement",
                    "Exhibitor Badges Unlock Request",
                    "Successfully Badges Unlocked Request",
                    "Exhibitor Badges Requirement",
                    "Exhibitor Contractor Unlock Request",
                    "Electrical Vendor Power Requirement",
                    "Stall Balance Payment",
                    "Remark Mail",
                    "Contractor Badges Unlock Request",
                    "Contractor Badges Submit",
                    "UnderTaking and Declaration Accept",
                    "Contractor Selection",
                    "Fascia Email",
                    "Booth Design Approve",
                  ].map((place) => (
                    <label key={place}>
                      <input
                        type="checkbox"
                        checked={appliedPlace.includes(place)}
                        onChange={() => handleAppliedPlace(place)}
                      />
                      {place}
                    </label>
                  ))}
                </div>
              </div>

              {/* Set From Email */}
              <div className="EmailsMaster-row">
                <label>Set From Email</label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="Enter sender email"
                />
              </div>

              {/* Attach PDF */}
              <div className="EmailsMaster-row">
                <label>Attach PDF?</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      value="Yes"
                      checked={attachPdf === "Yes"}
                      onChange={(e) => setAttachPdf(e.target.value)}
                    />{" "}
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="No"
                      checked={attachPdf === "No"}
                      onChange={(e) => setAttachPdf(e.target.value)}
                    />{" "}
                    No
                  </label>
                </div>
              </div>

              {/* Admin Email */}
              <div className="EmailsMaster-row">
                <label>Need a Copy of Sent Mail for Admin</label>
                <input
                  type="email"
                  value={adminCopyEmail}
                  onChange={(e) => setAdminCopyEmail(e.target.value)}
                  placeholder="Enter admin copy email"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="EmailsMaster-right">
              <label>Email Content</label>
              <CustomEditor value={emailContent} onChange={setEmailContent} />
              <div className="EmailsMaster-actions">
                <button onClick={updateEmailMaster}>Update</button>
                <button onClick={resetEmailForm}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailsMasterComponent;
