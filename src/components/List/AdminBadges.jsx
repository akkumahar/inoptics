import React, { useEffect, useState } from "react";
import "./AdminBadgesList.css";
import { toast } from "react-toastify";
import {
  FaChevronDown,
  FaChevronUp,
  FaPrint,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { MdToggleOff, MdToggleOn } from "react-icons/md";

const AdminBadges = () => {
  const [companies, setCompanies] = useState([]);
  const [openCompany, setOpenCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);

  // 🔘 badgeId => true/false
  const [printToggle, setPrintToggle] = useState({});

  /* ===============================
     FETCH BADGES
  =============================== */
  useEffect(() => {
    fetch("https://inoptics.in/api/get_exhibitor_badges_grouped.php")
      .then(res => res.json())
      .then(data => {
        setCompanies(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to load badges");
      })
      .finally(() => setLoading(false));
  }, []);

  /* ===============================
     INIT PRINT TOGGLE FROM DB
  =============================== */
  useEffect(() => {
    const state = {};

    companies.forEach(company => {
      company.badges.forEach(badge => {
        state[badge.id] = badge.print_status === "ready";
      });
    });

    setPrintToggle(state);
  }, [companies]);

  /* ===============================
     UI HELPERS
  =============================== */
  const toggleCompany = (companyName) => {
    setOpenCompany(prev => (prev === companyName ? null : companyName));
  };

  /* ===============================
     DELETE BADGE
  =============================== */
  const deleteBadge = async (badgeId) => {
    if (!window.confirm("Delete this badge?")) return;

    try {
      const res = await fetch(
        "https://inoptics.in/api/delete_exhibitor_badge.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: badgeId }),
        }
      );

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Delete failed");
        return;
      }

      // ✅ frontend sync
      setCompanies(prev =>
        prev
          .map(company => ({
            ...company,
            badges: company.badges.filter(b => b.id !== badgeId),
          }))
          .filter(company => company.badges.length > 0)
      );

      toast.success("Badge deleted");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  /* ===============================
     EDIT BADGE
  =============================== */
  const openEditModal = (badge) => {
    setEditingBadge({ ...badge });
    setShowEditModal(true);
  };

  const updateBadge = async () => {
    if (!editingBadge) return;

    try {
      const res = await fetch(
        "https://inoptics.in/api/edit_exhibitor_badge.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingBadge),
        }
      );

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message);
        return;
      }

      setCompanies(prev =>
        prev.map(company => ({
          ...company,
          badges: company.badges.map(b =>
            b.id === editingBadge.id
              ? { ...b, ...editingBadge }
              : b
          ),
        }))
      );

      toast.success("Badge updated");
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  /* ===============================
     TOGGLE PRINT STATUS
  =============================== */
  const togglePrintStatus = async (badge) => {
    const current = !!printToggle[badge.id];
    const nextStatus = current ? "disabled" : "ready";

    try {
      const res = await fetch(
        "https://inoptics.in/api/update_badge_print_status.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badge_id: badge.id,
            status: nextStatus,
          }),
        }
      );

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Failed");
        return;
      }

      // ✅ only this badge toggle
      setPrintToggle(prev => ({
        ...prev,
        [badge.id]: nextStatus === "ready",
      }));

      toast.success(
        nextStatus === "ready" ? "Print enabled" : "Print disabled"
      );
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  /* ===============================
     RENDER
  =============================== */
  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading badges...</p>;
  }

  return (
    <div className="badge-dashboard">
      <h2>🎫 Exhibitor Badges</h2>

      {companies.length === 0 && (
        <p style={{ textAlign: "center" }}>No badges found</p>
      )}

      {companies.map(company => (
        <div className="company-card" key={company.company_name}>
          {/* HEADER */}
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
              <FaChevronUp />
            ) : (
              <FaChevronDown />
            )}
          </div>

          {/* BADGES */}
          {openCompany === company.company_name && (
            <div className="badge-list">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Stall</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {company.badges.map(badge => (
                    <tr key={badge.id}>
                      <td>{badge.name}</td>
                      <td>{badge.stall_no}</td>

                      <td className="actions">
                        {/* PRINT TOGGLE */}
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

                        {/* EDIT */}
                        <button onClick={() => openEditModal(badge)}>
                          <FaEdit />
                        </button>

                        {/* DELETE */}
                        <button
                          className="danger"
                          onClick={() => deleteBadge(badge.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

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
              onChange={e =>
                setEditingBadge({ ...editingBadge, name: e.target.value })
              }
              placeholder="Name"
            />

            <input
              value={editingBadge.stall_no}
              onChange={e =>
                setEditingBadge({ ...editingBadge, stall_no: e.target.value })
              }
              placeholder="Stall No"
            />

            <input
              value={editingBadge.state}
              onChange={e =>
                setEditingBadge({ ...editingBadge, state: e.target.value })
              }
              placeholder="State"
            />

            <input
              value={editingBadge.city}
              onChange={e =>
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
