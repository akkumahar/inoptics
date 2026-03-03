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
import { MdToggleOff, MdVerified, MdToggleOn } from "react-icons/md";

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
  const [badgePaymentSummary, setBadgePaymentSummary] = useState({});

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

      const companyMatch = company.company_name?.toLowerCase().includes(term);

      const badgeMatches = (company.badges || []).filter((b) =>
        b.name?.toLowerCase().includes(term),
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
    setEditingBadge({
      ...badge,
      preview: badge.photo ? `${SITE}/${badge.photo}` : null,
      candidate_photo: null, // reset file
    });

    setShowEditModal(true);
  };
  const updateBadge = async () => {
    try {
      const fd = new FormData();
      fd.append("id", editingBadge.id);
      fd.append("name", editingBadge.name);
      fd.append("stall_no", editingBadge.stall_no);
      fd.append("state", editingBadge.state || "");
      fd.append("city", editingBadge.city || "");

      // ✅ image optional
      if (editingBadge.candidate_photo instanceof File) {
        fd.append("candidate_photo", editingBadge.candidate_photo);
      }

      const res = await fetch(`${SITE}/api/edit_exhibitor_badge.php`, {
        method: "POST",
        body: fd, // ✅ NO content-type header
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Update failed");
        return;
      }

      /* ===== refresh UI ===== */
      setCompanies((prev) =>
        prev.map((c) => ({
          ...c,
          badges: c.badges.map((b) =>
            b.id === editingBadge.id
              ? {
                  ...b,
                  name: editingBadge.name,
                  stall_no: editingBadge.stall_no,
                  state: editingBadge.state,
                  city: editingBadge.city,
                  photo: data.candidate_photo
                    ? data.candidate_photo + "?t=" + data.ts
                    : b.photo,
                }
              : b,
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
    companies.forEach((c) => {
      fetch(
        `${SITE}/api/get_Exhibitor_badges.php?company_name=${encodeURIComponent(c.company_name)}`,
      )
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setFreeQuotaMap((prev) => ({
              ...prev,
              [c.company_name]: Number(d.free_badges || 0),
            }));
          }
        });
    });
  }, [companies]);

  const getBadgeRate = () => {
    return new Date() > new Date("2026-02-28") ? 200 : 100;
  };

  useEffect(() => {
    if (!companies.length) return;

    companies.forEach(async (company) => {
      try {
        const res = await fetch(
          `${SITE}/api/get_exhibitor_badge_payment.php?company_name=${encodeURIComponent(company.company_name)}`,
        );

        const data = await res.json();
        const records = Array.isArray(data.records) ? data.records : [];

        // ✅ cleared amount
        const cleared = records.reduce(
          (sum, r) => sum + Number(r.amount_paid || 0) + Number(r.tds || 0),
          0,
        );

        // ✅ free quota
        const freeQuota = freeQuotaMap[company.company_name] || 0;

        // ✅ paid badge count
        const paidBadgeCount = Math.max(
          0,
          (company.badges?.length || 0) - freeQuota,
        );

        const rate = getBadgeRate();
        const totalAmount = paidBadgeCount * rate;

        const pending = Math.max(0, totalAmount - cleared);

        setBadgePaymentSummary((prev) => ({
          ...prev,
          [company.company_name]: {
            paidBadgeCount,
            totalAmount,
            cleared,
            pending,
          },
        }));
      } catch (e) {
        console.error("Badge payment fetch failed", e);
      }
    });
  }, [companies, freeQuotaMap]);

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
        <div className="company-card-admin" key={company.company_name}>
          <div
            className="company-header-admin"
            onClick={() => toggleCompany(company.company_name)}
          >
            <div
              className="company-header"
              onClick={() => toggleCompany(company.company_name)}
            >
              {" "}
              <div>
                {" "}
                <strong>{company.company_name}</strong>{" "}
              </div>{" "}
            </div>
            <div>
              {badgePaymentSummary[company.company_name] && (
                <div className="badge-pay-summary">
                  <span> Badges: {company.badges.length} </span>{" "}
                  <span>
                    Paid Badges:{" "}
                    {badgePaymentSummary[company.company_name].paidBadgeCount}
                  </span>
                  <span>
                    Total: ₹{" "}
                    {badgePaymentSummary[company.company_name].totalAmount}
                  </span>
                  <span>
                    Cleared: ₹{" "}
                    {badgePaymentSummary[company.company_name].cleared}
                  </span>
                  <span>
                    Pending: ₹{" "}
                    {badgePaymentSummary[company.company_name].pending}
                  </span>
                </div>
              )}
            </div>

            {openCompany === company.company_name ? (
              <FaChevronUp className="badge-table-icon" />
            ) : (
              <FaChevronDown className="badge-table-icon" />
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
                        const freeQuota =
                          freeQuotaMap[company.company_name] || 0;
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
                                {printToggle[badge.id] ? (
                                  <MdToggleOn size={36} color="#16a34a" />
                                ) : (
                                  <MdToggleOff size={36} color="#9ca3af" />
                                )}
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
              placeholder="Candidate Name"
            />

            <input
              value={editingBadge.stall_no}
              onChange={(e) =>
                setEditingBadge({
                  ...editingBadge,
                  stall_no: e.target.value,
                })
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

            {/* ===== IMAGE UPLOAD + PREVIEW ===== */}
            <div className="image-upload-wrapper">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  // Clean old preview
                  if (editingBadge.preview?.startsWith("blob:")) {
                    URL.revokeObjectURL(editingBadge.preview);
                  }

                  setEditingBadge((prev) => ({
                    ...prev,
                    candidate_photo: file,
                    preview: URL.createObjectURL(file),
                  }));
                }}
              />

              {editingBadge?.preview && (
                <img
                  src={editingBadge.preview}
                  alt="preview"
                  className="edit-preview-img"
                />
              )}
            </div>

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
