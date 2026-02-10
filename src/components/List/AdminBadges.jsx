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
import { MdToggleOff,MdVerified, MdToggleOn } from "react-icons/md";

import { RiMoneyRupeeCircleFill } from "react-icons/ri";

const SITE = "https://inoptics.in";

const AdminBadges = () => {
  const [companies, setCompanies] = useState([]);
  const [openCompany, setOpenCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);

  const [printToggle, setPrintToggle] = useState({});
  const [search, setSearch] = useState("");

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewBadgeId, setPreviewBadgeId] = useState(null);


  const [freeQuotaMap, setFreeQuotaMap] = useState({});

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch(`${SITE}/api/get_exhibitor_badges_grouped.php`)
      .then((res) => res.json())
      .then((data) => setCompanies(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load badges"))
      .finally(() => setLoading(false));
  }, []);

  /* ================= PRINT STATE ================= */
  useEffect(() => {
    const state = {};
    companies.forEach((company) => {
      (company.badges || []).forEach((badge) => {
        state[badge.id] = badge.print_status === "ready";
      });
    });
    setPrintToggle(state);
  }, [companies]);

  /* ================= SEARCH FILTER ================= */
  const filteredCompanies = companies
    .map((company) => {
      const term = search.toLowerCase().trim();
      if (!term) return company;

      const companyMatch = company.company_name
        ?.toLowerCase()
        .includes(term);

      const badgeMatches = (company.badges || []).filter((b) =>
        b.name?.toLowerCase().includes(term)
      );

      if (companyMatch) return company;

      if (badgeMatches.length > 0) {
        return { ...company, badges: badgeMatches };
      }

      return null;
    })
    .filter(Boolean);

  const toggleCompany = (companyName) => {
    setOpenCompany((prev) => (prev === companyName ? null : companyName));
  };

  /* ================= DELETE ================= */
  const deleteBadge = async (badgeId) => {
    if (!window.confirm("Delete this badge?")) return;

    try {
      const res = await fetch(`${SITE}/api/delete_exhibitor_badge.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: badgeId }),
      });

      const data = await res.json();
      if (!data.success) return toast.error("Delete failed");

      setCompanies((prev) =>
        prev
          .map((c) => ({
            ...c,
            badges: c.badges.filter((b) => b.id !== badgeId),
          }))
          .filter((c) => c.badges.length > 0),
      );

      toast.success("Badge deleted");
    } catch {
      toast.error("Server error");
    }
  };

  /* ================= EDIT ================= */
  const openEditModal = (badge) => {
    setEditingBadge({ ...badge });
    setShowEditModal(true);
  };

  const updateBadge = async () => {
    try {
      const res = await fetch(`${SITE}/api/edit_exhibitor_badge.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBadge),
      });

      const data = await res.json();
      if (!data.success) return toast.error("Update failed");

      setCompanies((prev) =>
        prev.map((c) => ({
          ...c,
          badges: c.badges.map((b) =>
            b.id === editingBadge.id ? editingBadge : b,
          ),
        })),
      );

      toast.success("Updated");
      setShowEditModal(false);
    } catch {
      toast.error("Update failed");
    }
  };

  /* ================= PRINT TOGGLE ================= */
  const togglePrintStatus = async (badge) => {
    const next = printToggle[badge.id] ? "disabled" : "ready";

    try {
      const res = await fetch(`${SITE}/api/update_badge_print_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badge_id: badge.id, status: next }),
      });

      const data = await res.json();
      if (!data.success) return toast.error("Failed");

      setPrintToggle((p) => ({ ...p, [badge.id]: next === "ready" }));
      toast.success("Updated");
    } catch {
      toast.error("Server error");
    }
  };


useEffect(() => {
  companies.forEach(c => {
    fetch(`${SITE}/api/get_Exhibitor_badges.php?company_name=${encodeURIComponent(c.company_name)}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setFreeQuotaMap(prev => ({
            ...prev,
            [c.company_name]: Number(d.free_badges || 0)
          }));
        }
      });
  });
}, [companies]);



  /* ================= PREVIEW ================= */
  const openPreview = (id) => {
    setPreviewBadgeId(id);
    setShowPreviewModal(true);
  };

  const closePreview = () => {
    setShowPreviewModal(false);
    setPreviewBadgeId(null);
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading badges...</p>;

  return (
    <div className="badge-dashboard">

      {/* 🔍 SEARCH */}
      <div style={{ marginBottom: 18 }}>
        <input
          type="text"
          placeholder="Search by company or badge name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 14,
          }}
        />
      </div>

      {filteredCompanies.length === 0 && (
        <p style={{ textAlign: "center" }}>No badges found</p>
      )}

      {filteredCompanies.map((company) => (
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

            {openCompany === company.company_name
              ? <FaChevronUp className="badge-table-icon"/>
              : <FaChevronDown className="badge-table-icon"/>}
          </div>

          {openCompany === company.company_name && (
            <div className="badge-scroll-list">
              <div className="badge-list">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Stall</th>
                      <th>Type</th>
                      <th>Actions</th>
                      <th>Preview</th>
                    </tr>
                  </thead>

                  <tbody>
  {[...(company.badges || [])]
    .sort((a, b) => a.id - b.id)
    .map((badge, index) => {

      // ✅ CORRECT SOURCE
      const freeQuota = freeQuotaMap[company.company_name] || 0;
      const isFree = index < freeQuota;

      return (
        <tr key={badge.id}>
          <td>{badge.name}</td>
          <td>{badge.stall_no}</td>

          {/* ✅ TYPE COLUMN */}
          <td>
            {isFree ? (
              <span className="badge-flag free">
                <MdVerified /> FREE
              </span>
            ) : (
              <span className="badge-flag paid">
                <RiMoneyRupeeCircleFill className="badge-rupee-icon" />
                PAID
              </span>
            )}
          </td>

          <td className="actions">
            <button onClick={() => togglePrintStatus(badge)}>
              <FaPrint />
              {printToggle[badge.id]
                ? <MdToggleOn size={36} color="#16a34a"/>
                : <MdToggleOff size={36} color="#9ca3af"/>}
            </button>

            <button onClick={() => openEditModal(badge)}>
              <FaEdit />
            </button>

            <button
              className="danger"
              onClick={() => deleteBadge(badge.id)}
            >
              <FaTrash />
            </button>
          </td>

          <td>
            <button
              className="eye-btn"
              onClick={() => openPreview(badge.id)}
            >
              <FaEye />
            </button>
          </td>
        </tr>
      );
    })}
</tbody>


                </table>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="modal-overlay">
          <div className="modal-box preview-box">
            <button className="modal-close" onClick={closePreview}>
              <IoClose />
            </button>

            <img
              src={`${SITE}/api/exhibitor_badges_preview.php?id=${previewBadgeId}&t=${Date.now()}`}
              alt="Badge"
              className="badge-preview-image"
            />
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editingBadge && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="modal-close" onClick={() => setShowEditModal(false)}>
              <IoClose />
            </button>

            <h3>Edit Badge</h3>

            <input value={editingBadge.name}
              onChange={e => setEditingBadge({...editingBadge, name:e.target.value})} />

            <input value={editingBadge.stall_no}
              onChange={e => setEditingBadge({...editingBadge, stall_no:e.target.value})} />

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
