import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "./AdminTwoBadges.css";
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
  const [badgePaymentSummaryTable, setBadgePaymentSummaryTable] = useState({});

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
  // const deleteBadge = async (badgeId) => {
  //   if (!window.confirm("Delete this badge?")) return;

  //   try {
  //     const res = await fetch(`${SITE}/api/delete_exhibitor_badge.php`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ id: badgeId }),
  //     });

  //     const data = await res.json();
  //     if (!data.success) return toast.error("Delete failed");

  //     setCompanies((prev) =>
  //       prev
  //         .map((c) => ({
  //           ...c,
  //           badges: c.badges.filter((b) => b.id !== badgeId),
  //         }))
  //         .filter((c) => c.badges.length > 0),
  //     );

  //     toast.success("Badge deleted");
  //   } catch {
  //     toast.error("Server error");
  //   }
  // };

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
    return new Date() > new Date("2026-03-20") ? 200 : 100;
  };

 useEffect(() => {
  if (!companies.length) return;

  const fetchPayments = async () => {

    for (const company of companies) {
      try {

        const res = await fetch(
          `${SITE}/api/get_exhibitor_badge_payment.php?company_name=${encodeURIComponent(company.company_name)}`
        );

        const data = await res.json();
        const records = Array.isArray(data.records) ? data.records : [];

        const cleared = records.reduce(
          (sum, r) => sum + Number(r.amount_paid || 0) + Number(r.tds || 0),
          0
        );

        const freeQuota = freeQuotaMap[company.company_name] || 0;

        const paidBadgeCount = Math.max(
          0,
          (company.badges?.length || 0) - freeQuota
        );

        const rate = getBadgeRate();
        const amount = paidBadgeCount * rate;

        let cgst = 0;
        let sgst = 0;
        let igst = 0;

        const badgeState =
          company.badges?.find((b) => b.state)?.state?.toLowerCase() || "";

        if (badgeState === "delhi") {
          cgst = amount * 0.09;
          sgst = amount * 0.09;
        } else {
          igst = amount * 0.18;
        }

        const totalAmount = amount + cgst + sgst + igst;

        const pending = Math.max(0, totalAmount - cleared);

        setBadgePaymentSummary((prev) => ({
          ...prev,
          [company.company_name]: {
            paidBadgeCount,
            amount,
            cgst,
            sgst,
            igst,
            totalAmount,
            cleared,
            pending,
          },
        }));

      } catch (e) {
        console.error("Badge payment fetch failed", e);
      }
    }

  };

  fetchPayments();

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

  /* ================= EXPORT BADGES ================= */

  const exportBadgesExcel = () => {
  if (!companies.length) {
    toast.error("No data to export");
    return;
  }

  const exportData = [];

  companies.forEach((company) => {
    const freeQuota = Number(freeQuotaMap[company.company_name] || 0);

    const sortedBadges = [...(company.badges || [])].sort(
      (a, b) => a.id - b.id
    );

    sortedBadges.forEach((badge, index) => {

      const isFree = index < freeQuota;

      const rate = getBadgeRate();
      const amount = isFree ? 0 : rate;

      const state = (
        badge.state ||
        company.badges?.[0]?.state ||
        ""
      ).toLowerCase();

      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (!isFree) {
        if (state === "delhi") {
          cgst = amount * 0.09;
          sgst = amount * 0.09;
        } else {
          igst = amount * 0.18;
        }
      }

      const total = amount + cgst + sgst + igst;

      exportData.push({
        "Company Name": company.company_name,
        "Badge Name": badge.name,
        "Stall No": badge.stall_no,
        State: badge.state || "",
        City: badge.city || "",

        Type: isFree ? "FREE" : "PAID",

        Amount: amount.toFixed(2),

        CGST: cgst ? cgst.toFixed(2) : "-",
        SGST: sgst ? sgst.toFixed(2) : "-",
        IGST: igst ? igst.toFixed(2) : "-",

        Total: total.toFixed(2),

        "Print Status":
          badge.print_status === "ready" ? "READY" : "DISABLED",
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Badge Report");

  XLSX.writeFile(workbook, "Exhibitor_Badges_Report.xlsx");

  toast.success("Excel exported successfully");
};

  if (loading) return <p style={{ textAlign: "center" }}>Loading badges...</p>;

  return (
    <div className="badge-dashboard">
      {/* 🔍 SEARCH */}
      <div style={{ marginBottom: 18 }} className="badge-top-bar">
        <button className="badge-export-btn" onClick={exportBadgesExcel}>
          Export Excel
        </button>

        <input
          type="text"
          placeholder="Search by company or badge name..."
          value={search}
          className="badge-name-search"
          onChange={(e) => setSearch(e.target.value)}
          style={{}}
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
                  <span>Free Badge: {freeQuotaMap[company.company_name] || 0}</span>

                  <span>
                    Paid Badges:{" "}
                    {badgePaymentSummary[company.company_name]
                      ?.paidBadgeCount || 0}
                  </span>

                  <span>
                    Amount: ₹
                    {badgePaymentSummary[company.company_name]?.amount?.toFixed(
                      2,
                    ) || "0.00"}
                  </span>

                  {(company.badges?.[0]?.state || "").toLowerCase() ===
                  "delhi" ? (
                    <>
                      <span>
                        CGST: ₹
                        {badgePaymentSummary[
                          company.company_name
                        ]?.cgst?.toFixed(2) || "0.00"}
                      </span>

                      <span>
                        SGST: ₹
                        {badgePaymentSummary[
                          company.company_name
                        ]?.sgst?.toFixed(2) || "0.00"}
                      </span>
                    </>
                  ) : (
                    <span>
                      IGST: ₹
                      {badgePaymentSummary[company.company_name]?.igst?.toFixed(
                        2,
                      ) || "0.00"}
                    </span>
                  )}

                  <span>
                    Total: ₹
                    {badgePaymentSummary[
                      company.company_name
                    ]?.totalAmount?.toFixed(2) || "0.00"}
                  </span>

                  <span>
                    Cleared: ₹
                    {badgePaymentSummary[
                      company.company_name
                    ]?.cleared?.toFixed(2) || "0.00"}
                  </span>

                  <span>
                    Pending: ₹
                    {badgePaymentSummary[
                      company.company_name
                    ]?.pending?.toFixed(2) || "0.00"}
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
                      <th>Amount</th>
                      <th>Free Badge</th>
                      <th>Paid Badge</th>
                      <th>CGST</th>
                      <th>SGST</th>
                      <th>IGST</th>
                      <th>Total</th>
                      <th>Actions</th>
                      <th>Print Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(() => {
                      const freeQuota = Number(
                        freeQuotaMap[company.company_name] || 0,
                      );

                      let totalFree = 0;
                      let totalPaid = 0;
                      let totalAmount = 0;
                      let totalCGST = 0;
                      let totalSGST = 0;
                      let totalIGST = 0;
                      let grandTotalAll = 0;

                      const sortedBadges = [...(company.badges || [])].sort(
                        (a, b) => a.id - b.id,
                      );

                      return (
                        <>
                          {sortedBadges.map((badge, index) => {
                            const isFree = index < freeQuota;
                            const rate = getBadgeRate();

                            const amount = isFree ? 0 : rate;

                            const state = (
                              badge.state ||
                              company.badges?.[0]?.state ||
                              ""
                            ).toLowerCase();

                            let cgst = 0;
                            let sgst = 0;
                            let igst = 0;

                            if (!isFree) {
                              if (state === "delhi") {
                                cgst = amount * 0.09;
                                sgst = amount * 0.09;
                              } else {
                                igst = amount * 0.18;
                              }
                            }

                            const total = amount + cgst + sgst + igst;

                            if (isFree) totalFree++;
                            else totalPaid++;

                            totalAmount += amount;
                            totalCGST += cgst;
                            totalSGST += sgst;
                            totalIGST += igst;
                            grandTotalAll += total;

                            return (
                              <tr key={badge.id}>
                                <td>{badge.name}</td>

                                <td>{badge.stall_no}</td>

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

                                <td>₹{amount.toFixed(2)}</td>

                                <td>{isFree ? 1 : 0}</td>

                                <td>{!isFree ? 1 : 0}</td>

                                <td>{cgst ? `₹${cgst.toFixed(2)}` : "-"}</td>

                                <td>{sgst ? `₹${sgst.toFixed(2)}` : "-"}</td>

                                <td>{igst ? `₹${igst.toFixed(2)}` : "-"}</td>

                                <td>₹{total.toFixed(2)}</td>

                                <td className="actions">

                                  <button
                                    className="eye-btn"
                                    onClick={() => openPreview(badge.id)}
                                  >
                                    <FaEye /> Preview
                                  </button>


                                  

                                  <button onClick={() => openEditModal(badge)}>
                                    <FaEdit />
                                  </button>

                                  {/* <button
                                    className="danger"
                                    onClick={() => deleteBadge(badge.id)}
                                  >
                                    <FaTrash />
                                  </button> */}
                                </td>

                                <td>
                                  <button
                                  className="eye-btn"
                                    onClick={() => togglePrintStatus(badge)}
                                  >
                                    <FaPrint />

                                    {printToggle[badge.id] ? (
                                      <MdToggleOn size={36} color="#16a34a" />
                                    ) : (
                                      <MdToggleOff size={36} color="#9ca3af" />
                                    )}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}

                          {/* ===== TOTAL ROW ===== */}

                          <tr className="badge-total-row">
                            <td colSpan="3">
                              <strong>Total</strong>
                            </td>

                            <td>
                              <strong>₹{totalAmount.toFixed(2)}</strong>
                            </td>

                            <td>
                              <strong>{totalFree}</strong>
                            </td>

                            <td>
                              <strong>{totalPaid}</strong>
                            </td>

                            <td>
                              <strong>₹{totalCGST.toFixed(2)}</strong>
                            </td>

                            <td>
                              <strong>₹{totalSGST.toFixed(2)}</strong>
                            </td>

                            <td>
                              <strong>₹{totalIGST.toFixed(2)}</strong>
                            </td>

                            <td>
                              <strong>₹{grandTotalAll.toFixed(2)}</strong>
                            </td>

                            <td colSpan="3"></td>
                          </tr>
                        </>
                      );
                    })()}
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
