import React, { useEffect, useState } from "react";
import "./AdminBadgesList.css";
import { toast } from "react-toastify";
import {
  FaChevronDown,
  FaChevronUp,
  FaPrint,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { MdToggleOff, MdToggleOn } from "react-icons/md";

const SITE = "https://inoptics.in";

const AdminBadges = () => {
  const [companies, setCompanies] = useState([]);
  const [openCompany, setOpenCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);

  const [printToggle, setPrintToggle] = useState({});

  // Preview modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewBadgeId, setPreviewBadgeId] = useState(null);

  useEffect(() => {
    fetch(`${SITE}/api/get_exhibitor_badges_grouped.php`)
      .then((res) => res.json())
      .then((data) => setCompanies(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load badges");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const state = {};
    companies.forEach((company) => {
      (company.badges || []).forEach((badge) => {
        state[badge.id] = badge.print_status === "ready";
      });
    });
    setPrintToggle(state);
  }, [companies]);

  const toggleCompany = (companyName) => {
    setOpenCompany((prev) => (prev === companyName ? null : companyName));
  };

  const deleteBadge = async (badgeId) => {
    if (!window.confirm("Delete this badge?")) return;

    try {
      const res = await fetch(`${SITE}/api/delete_exhibitor_badge.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: badgeId }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Delete failed");
        return;
      }

      setCompanies((prev) =>
        prev
          .map((company) => ({
            ...company,
            badges: company.badges.filter((b) => b.id !== badgeId),
          }))
          .filter((company) => company.badges.length > 0),
      );

      toast.success("Badge deleted");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const openEditModal = (badge) => {
    setEditingBadge({ ...badge });
    setShowEditModal(true);
  };

  const updateBadge = async () => {
    if (!editingBadge) return;

    try {
      const res = await fetch(`${SITE}/api/edit_exhibitor_badge.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBadge),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Update failed");
        return;
      }

      setCompanies((prev) =>
        prev.map((company) => ({
          ...company,
          badges: company.badges.map((b) =>
            b.id === editingBadge.id ? { ...b, ...editingBadge } : b,
          ),
        })),
      );

      toast.success("Badge updated");
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  const togglePrintStatus = async (badge) => {
    const current = !!printToggle[badge.id];
    const nextStatus = current ? "disabled" : "ready";

    try {
      const res = await fetch(`${SITE}/api/update_badge_print_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badge_id: badge.id, status: nextStatus }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Failed");
        return;
      }

      setPrintToggle((prev) => ({
        ...prev,
        [badge.id]: nextStatus === "ready",
      }));
      toast.success(
        nextStatus === "ready" ? "Print enabled" : "Print disabled",
      );
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const openPreview = (badgeId) => {
    setPreviewBadgeId(badgeId);
    setShowPreviewModal(true);
  };
  
  const closePreview = () => {
    setShowPreviewModal(false);
    setPreviewBadgeId(null);
  };

  // ✅ Print ONLY badge image (opens new window & prints)
  const printBadge = (badgeId) => {
    const url = `${SITE}/api/exhibitor_badges_preview.php?id=${badgeId}&t=${Date.now()}`;
    const win = window.open("", "_blank", "width=900,height=900");

    if (!win) {
      toast.error("Popup blocked");
      return;
    }

    win.document.write(`
    <html>
      <head>
        <title>Print Badge</title>
        <style>
          @page { margin: 0; }
          body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background: white;
          }
          img {
            width: 100%;
            max-width: 600px;
          }
        </style>
      </head>
      <body>
        <img src="${url}" onload="window.print(); window.close();" />
      </body>
    </html>
  `);

    win.document.close();
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading badges...</p>;

  return (
    <div className="badge-dashboard">
      

      {companies.length === 0 && (
        <p style={{ textAlign: "center" }}>No badges found</p>
      )}

      {companies.map((company) => (
        <div className="company-card" key={company.company_name}>
          <div
            className="company-header"
            onClick={() => toggleCompany(company.company_name)}
          >
            <div>
              <strong>{company.company_name}</strong>
              <span className="badge-count">
                Badges: {company.badges.length}
              </span>
            </div>
            {openCompany === company.company_name ? (
              <FaChevronUp className="badge-table-icon"/>
            ) : (
              <FaChevronDown className="badge-table-icon"/>
            )}
          </div>

          {openCompany === company.company_name && (
            <div className="badge-scroll-list">
              <div className="badge-list">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Stall</th>
                    <th>Actions</th>
                    <th>Preview</th>
                  </tr>
                </thead>

                <tbody>
                  {company.badges.map((badge) => (
                    <tr key={badge.id}>
                      <td>{badge.name}</td>
                      <td>{badge.stall_no}</td>

                      <td className="actions">
                        <button
                          type="button"
                          title="Toggle Print"
                          onClick={() => togglePrintStatus(badge)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <FaPrint />
                          {printToggle[badge.id] ? (
                            <MdToggleOn color="#16a34a" size={40} />
                          ) : (
                            <MdToggleOff color="#9ca3af" size={40} />
                          )}
                        </button>

                        <button
                          onClick={() => openEditModal(badge)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="danger"
                          onClick={() => deleteBadge(badge.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="eye-btn"
                          title="View Badge"
                          onClick={() => openPreview(badge.id)}
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )}
        </div>
      ))}

      {/* PREVIEW MODAL (badge image) */}
        {showPreviewModal && previewBadgeId && (
          <div className="modal-overlay">
            <div className="modal-box preview-box">
              <button className="modal-close" onClick={closePreview}>
                <IoClose />
              </button>

              <div className="badge-preview-wrapper">
                <img
                  src={`${SITE}/api/exhibitor_badges_preview.php?id=${previewBadgeId}&t=${Date.now()}`}
                  alt="Badge"
                  className="badge-preview-image"
                  onError={() =>
                    toast.error("Badge image failed to load")
                  }
                />
              </div>
            </div>
          </div>
        )}


      {/* EDIT MODAL */}
      {showEditModal && editingBadge && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button
              className="modal-close"
              onClick={() => setShowEditModal(false)}
            >
              <IoClose />
            </button>

            <h3>Edit Badge</h3>

            <input
              value={editingBadge.name}
              onChange={(e) =>
                setEditingBadge({ ...editingBadge, name: e.target.value })
              }
              placeholder="Name"
            />
            <input
              value={editingBadge.stall_no}
              onChange={(e) =>
                setEditingBadge({ ...editingBadge, stall_no: e.target.value })
              }
              placeholder="Stall No"
            />
            <input
              value={editingBadge.state}
              onChange={(e) =>
                setEditingBadge({ ...editingBadge, state: e.target.value })
              }
              placeholder="State"
            />
            <input
              value={editingBadge.city}
              onChange={(e) =>
                setEditingBadge({ ...editingBadge, city: e.target.value })
              }
              placeholder="City"
            />

            <button className="update-btn" onClick={updateBadge}>
              Update Badge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBadges;
