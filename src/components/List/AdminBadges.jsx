import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx-js-style";
import "./AdminBadges.css";
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

  const [showExhibitorPopup, setShowExhibitorPopup] = useState(false);
  const [showBadgePopup, setShowBadgePopup] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [exhibitors, setExhibitors] = useState([]);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ name: "", photo: "" });

  const [allExhibitors, setAllExhibitors] = useState([]);
  const [exhibitorSearch, setExhibitorSearch] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    exhibitor_company_name: "",
    stall_no: "",
    state: "",
    city: "",
    name: "",
    candidate_photo: null,
  });

  const filteredExhibitors = allExhibitors.filter((ex) =>
    ex.company_name?.toLowerCase().includes(exhibitorSearch.toLowerCase()),
  );

  useEffect(() => {
    fetch("https://inoptics.in/api/get_exhibitors.php")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllExhibitors(data);
        }
      })
      .catch(() => toast.error("Failed to load exhibitors"));
  }, []);
  /* ================= FETCH ================= */
  useEffect(() => {
    fetch(`${SITE}/api/get_exhibitor_badges_grouped.php`)
      .then((res) => res.json())
      .then((data) => {
        console.log("🔥 API DATA:", data); // 👈 full response

        if (Array.isArray(data)) {
          data.forEach((company) => {
            console.log("🏢 Company:", company.company_name);
            console.log("📦 Badges:", company.badges);
          });
        }

        setCompanies(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
        toast.error("Failed to load badges");
      })
      .finally(() => setLoading(false));
  }, []);

  const totalBadges = companies.reduce((total, company) => {
    return total + (company.badges?.length || 0);
  }, 0);

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

      // const badgeMatches = (company.badges || []).filter((b) =>
      //   b.name?.toLowerCase().includes(term),
      // );

      if (companyMatch) return company;

      // if (badgeMatches.length > 0) {
      //   return { ...company, badges: badgeMatches };
      // }

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
      setDeletingId(badgeId); // 🔥 loader start

      const res = await fetch(`${SITE}/api/delete_exhibitor_badge.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: badgeId }),
      });

      const data = await res.json();
      if (!data.success) {
        setDeletingId(null);
        return toast.error("Delete failed");
      }

      // 🔥 ⚡ INSTANT UI UPDATE (NO WAIT)
      setCompanies((prev) =>
        prev
          .map((c) => ({
            ...c,
            badges: c.badges.filter((b) => b.id !== badgeId),
          }))
          .filter((c) => c.badges.length > 0),
      );

      toast.success("Badge deleted");

      setDeletingId(null); // 🔥 stop immediately

      // 🔥 background refresh (NO await)
      fetch(`${SITE}/api/get_exhibitor_badges_grouped.php`)
        .then((res) => res.json())
        .then((fresh) => {
          if (Array.isArray(fresh)) {
            setCompanies(fresh);
          }
        })
        .catch(() => {});
    } catch {
      setDeletingId(null);
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
    return 100;
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
        // ✅ cleared
        const cleared = records.reduce(
          (sum, r) => sum + Number(r.amount_paid || 0) + Number(r.tds || 0),
          0,
        );

        // ✅ free quota
        const freeQuota = Number(freeQuotaMap[company.company_name] || 0);

        // ✅ SORT badges (IMPORTANT)
        const badges = [...(company.badges || [])].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at),
        );

        // ✅ CORRECT PAID BADGES (🔥 FIX)
        const paidBadges = badges.slice(freeQuota);

        // ✅ count
        const paidBadgeCount = paidBadges.length;

        // ✅ calculation
        let amount = 0;
        let cgst = 0;
        let sgst = 0;
        let igst = 0;

        paidBadges.forEach((badge) => {
          const rate = getBadgeRate();

          amount += rate;

          const state = (badge.state || "").toLowerCase();

          if (state === "delhi") {
            cgst += rate * 0.09;
            sgst += rate * 0.09;
          } else {
            igst += rate * 0.18;
          }
        });

        const totalAmount =
          Number(amount) + Number(cgst) + Number(sgst) + Number(igst);

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
        setBadgePaymentSummaryTable((prev) => ({
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

  /* ================= EXPORT BADGES ================= */

  const exportBadgesExcel = () => {
    if (!companies.length) {
      toast.error("No data to export");
      return;
    }

    const exportData = [];
    const merges = [];

    let rowIndex = 1; // header ke baad start

    companies.forEach((company) => {
      const freeQuota = Number(freeQuotaMap[company.company_name] || 0);

      const sortedBadges = [...(company.badges || [])].sort(
        (a, b) => a.id - b.id,
      );

      let companyPaidTotal = 0;
      let paidRowStart = null;
      let paidRowEnd = null;

      sortedBadges.forEach((badge, index) => {
        const isFree = index < freeQuota;

        const rate = getBadgeRate();
        const amount = isFree ? 0 : rate;

        const state = (
          badge.state ||
          company.badges?.[0]?.state ||
          ""
        ).toLowerCase();

        let cgst = 0,
          sgst = 0,
          igst = 0;

        if (!isFree) {
          if (state === "delhi") {
            cgst = amount * 0.09;
            sgst = amount * 0.09;
          } else {
            igst = amount * 0.18;
          }
        }

        const total = amount + cgst + sgst + igst;

        // 🔥 ONLY PAID total
        if (!isFree) {
          companyPaidTotal += total;

          if (paidRowStart === null) paidRowStart = rowIndex;
          paidRowEnd = rowIndex;
        }

        exportData.push({
          "Company Name": company.company_name,
          "Badge Name": badge.name,
          "Stall No": badge.stall_no,
          State: badge.state || "",
          City: badge.city || "",

          // ✅ NEW FIELDS ADDED
          "Badge Code": `${badge.badge_series || ""}-${badge.badge_series_num || ""}`,

          Type: isFree ? "FREE" : "",
          Paid: !isFree ? "PAID" : "",

          Amount: amount.toFixed(2),

          CGST: cgst ? cgst.toFixed(2) : "-",
          SGST: sgst ? sgst.toFixed(2) : "-",
          IGST: igst ? igst.toFixed(2) : "-",

          Total: total.toFixed(2),

          "Grand Total (Paid Only)": "",

          "Print Status": badge.print_status === "ready" ? "READY" : "DISABLED",
        });

        rowIndex++;
      });

      // 🔥 APPLY GRAND TOTAL + MERGE
      if (paidRowStart !== null && paidRowEnd !== null) {
        // column index (Grand Total)
        const colIndex = 12; // adjust if needed

        // set value only in first row
        exportData[paidRowStart - 1]["Grand Total (Paid Only)"] =
          companyPaidTotal.toFixed(2);

        // merge rows
        merges.push({
          s: { r: paidRowStart, c: colIndex },
          e: { r: paidRowEnd, c: colIndex },
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportData);

    ws["!merges"] = merges;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Badge Report");

    XLSX.writeFile(wb, "Exhibitor_Badges_Report.xlsx");

    toast.success("Excel exported successfully");
  };

  const selectedCompanyData = companies.find(
    (c) => c.company_name === selectedCompany?.company_name,
  );

  const freeRemaining =
    (freeQuotaMap[selectedCompany?.company_name] || 0) -
    (selectedCompanyData?.badges?.length || 0);

  const isFree = freeRemaining > 0;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max 2MB allowed");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      candidate_photo: file,
    }));

    setPhotoPreview(URL.createObjectURL(file));
  };

  const fetchExhibitorData = async (email) => {
    setLoading(true);

    try {
      const res = await fetch("https://inoptics.in/api/get_exhibitors.php");
      const data = await res.json();

      if (Array.isArray(data)) {
        const matched = data.find(
          (ex) => ex.email.toLowerCase() === email.toLowerCase(),
        );

        if (matched) {
          setExhibitors([matched]);

          setFormData((prev) => ({
            ...prev,
            exhibitor_company_name: matched.company_name || "",
            state: matched.state || "",
            city: matched.city || "",
            exhibitor_id: matched.id || "",
            exhibitor_email: matched.email || "",
          }));
        } else {
          setExhibitors([]);
        }
      }
    } catch (error) {
      alert({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (file) => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    // ✅ only CSV allowed
    if (!file.name.endsWith(".csv")) {
      toast.error("Only CSV file allowed");
      return;
    }

    try {
      setUploading(true);

      const fd = new FormData();
      fd.append("excel", file); // 🔥 EXACT NAME

      const res = await fetch("https://inoptics.in/api/exhibitor_badge_by_excel.php", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      toast.success(`✅ ${data.total_badges_generated} badges created`);

      // 🔥 refresh data
      const updated = await fetch(
        `${SITE}/api/get_exhibitor_badges_grouped.php`,
      );
      const fresh = await updated.json();

      if (Array.isArray(fresh)) {
        setCompanies(fresh);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!formData.name.trim()) {
      setFieldErrors({ name: "Name required" });
      return;
    }

    if (!formData.exhibitor_company_name) {
      toast.error("Company missing");
      return;
    }

    try {
      setIsSubmitting(true); // 🔥 START

      const fd = new FormData();

      fd.append("name", formData.name.trim());
      fd.append("company_name", formData.exhibitor_company_name);
      fd.append("stall_no", formData.stall_no);
      fd.append("state", formData.state || "");
      fd.append("city", formData.city || "");
      fd.append("exhibitor_id", formData.exhibitor_id || "");

      if (formData.candidate_photo) {
        fd.append("candidate_photo", formData.candidate_photo);
      }

      const res = await fetch("https://inoptics.in/api/submit-badge.php", {
        method: "POST",
        body: fd,
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!data.success) throw new Error(data.message);

      toast.success("✅ Badge created successfully");

      setShowBadgePopup(false);
      setPhotoPreview(null);

      setFormData((prev) => ({
        ...prev,
        name: "",
        candidate_photo: null,
      }));

      // 🔥 refresh
      const updated = await fetch(
        `${SITE}/api/get_exhibitor_badges_grouped.php`,
      );
      const fresh = await updated.json();
      setCompanies(Array.isArray(fresh) ? fresh : []);
    } catch (err) {
      toast.error(err.message || "Error creating badge");
    } finally {
      setIsSubmitting(false); // 🔥 STOP
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading badges...</p>;

  return (
    <div className="badge-dashboard-admin">
      {/* 🔍 SEARCH */}
      <div style={{ marginBottom: 18 }} className="badge-top-bar">
        <button className="badge-export-btn" onClick={exportBadgesExcel}>
          Export Excel
        </button>

        <label className="upload-btn">
          {uploading ? "Uploading..." : "Upload CSV"}
          <input
            type="file"
            accept=".csv"
            hidden
            onChange={(e) => handleCSVUpload(e.target.files[0])}
          />
        </label>

        <button
          className="add-exhibitor-new-badge-btn"
          onClick={() => setShowExhibitorPopup(true)}
        >
          Add Exhibitor Badge
        </button>
        <span className="add-exhibitor-new-badge-btn company-count">
          {companies.length}
        </span>
        <span className="add-exhibitor-new-badge-btn company-count">
          {totalBadges}
        </span>

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

                // ✅ cleared (API se)
                const cleared =
                  badgePaymentSummary[company.company_name]?.cleared || 0;

                const sortedBadges = [...(company.badges || [])].sort(
                  (a, b) => new Date(a.created_at) - new Date(b.created_at),
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

                  if (isFree) totalFree++;
                  else totalPaid++;

                  totalAmount += amount;
                  totalCGST += cgst;
                  totalSGST += sgst;
                  totalIGST += igst;
                  grandTotalAll += total;
                });

                // ✅ pending
                const pending = Math.max(0, grandTotalAll - cleared);

                return (
                  <div className="badge-pay-summary">
                    <span>Free Badges: {totalFree}</span>

                    <span
                      className="badge-flag"
                      style={{
                        background:
                          freeQuota - sortedBadges.length > 0
                            ? "#d1fae5"
                            : "#fee2e2",
                        color:
                          freeQuota - sortedBadges.length > 0
                            ? "#065f46"
                            : "#991b1b",
                        fontWeight: "bold",
                      }}
                    >
                      REMAINING: {Math.max(0, freeQuota - sortedBadges.length)}
                    </span>

                    <span>Paid Badges: {totalPaid}</span>

                    <span>Amount: ₹{totalAmount.toFixed(2)}</span>

                    {(company.badges?.[0]?.state || "").toLowerCase() ===
                    "delhi" ? (
                      <>
                        <span>CGST: ₹{totalCGST.toFixed(2)}</span>
                        <span>SGST: ₹{totalSGST.toFixed(2)}</span>
                      </>
                    ) : (
                      <span>IGST: ₹{totalIGST.toFixed(2)}</span>
                    )}

                    <span>Total: ₹{grandTotalAll.toFixed(2)}</span>

                    <span>Cleared: ₹{Number(cleared).toFixed(2)}</span>

                    <span>Pending: ₹{pending.toFixed(2)}</span>
                  </div>
                );
              })()}
            </div>

            <button
              className="add-badge-btn"
              onClick={(e) => {
                e.stopPropagation();

                const exhibitor = allExhibitors.find(
                  (ex) => ex.company_name === company.company_name,
                );

                if (!exhibitor) {
                  toast.error("Exhibitor not found");
                  return;
                }

                setSelectedCompany(exhibitor);

                setFormData({
                  exhibitor_company_name: exhibitor.company_name,
                  stall_no: exhibitor.stall_no || "",
                  state: exhibitor.state || "",
                  city: exhibitor.city || "",
                  exhibitor_id: exhibitor.id || "", // 🔥 MOST IMPORTANT
                  name: "",
                  candidate_photo: null,
                });

                setShowBadgePopup(true);
              }}
            >
              Add Badge
            </button>

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
                      <th>Preview</th>
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
                        (a, b) =>
                          new Date(a.created_at) - new Date(b.created_at),
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
                                    onClick={() => togglePrintStatus(badge)}
                                  >
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
                                    {deletingId === badge.id ? (
                                      <span className="spinner"></span>
                                    ) : (
                                      <FaTrash />
                                    )}
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

      {showBadgePopup && (
        <div className="modal-overlay">
          <div className="exhibitor-form-container">
            <div className="form-wrapper">
              <button
                className="exhibitor-modal-close"
                onClick={() => {
                  setShowBadgePopup(false);
                  setPhotoPreview(null);
                }}
              >
                <IoClose />
              </button>

              <h2>Add Exhibitor Badge</h2>

              <div className="badge-header-row">
                {isFree ? (
                  <span className="badge-flag free">
                    <MdVerified /> FREE
                  </span>
                ) : (
                  <span className="badge-flag paid">
                    <RiMoneyRupeeCircleFill /> PAID
                  </span>
                )}

                <span className="badge-remaining">
                  Remaining: {freeRemaining}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="badge-form">
                <input
                  className="badge-input"
                  value={formData.exhibitor_company_name}
                  disabled
                />
                <input
                  className="badge-input"
                  value={formData.stall_no}
                  disabled
                />
                <input
                  className="badge-input"
                  value={formData.state}
                  disabled
                />
                <input className="badge-input" value={formData.city} disabled />

                <input
                  className="badge-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter Name"
                />

                <input
                  className="badge-file"
                  type="file"
                  onChange={handlePhotoChange}
                />

                {photoPreview && (
                  <img
                    src={photoPreview}
                    className="badge-preview"
                    width={80}
                  />
                )}

                <button
                  type="submit"
                  className="badge-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Generating..." : "Generate Badge"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showExhibitorPopup && (
        <div className="modal-overlay">
          <div className="power-modal large">
            <h3>Select Exhibitor</h3>

            {/* 🔍 SEARCH */}
            <input
              type="text"
              placeholder="Search exhibitor..."
              value={exhibitorSearch}
              onChange={(e) => setExhibitorSearch(e.target.value)}
              className="badge-name-search"
              style={{ marginBottom: 10 }}
            />

            <div className="exhibitor-list">
              {filteredExhibitors.length === 0 ? (
                <p>No exhibitors found</p>
              ) : (
                filteredExhibitors.map((ex, i) => (
                  <div key={i} className="exhibitor-row">
                    <span>{ex.company_name}</span>

                    <button
                      className="select-btn"
                      onClick={() => {
                        const fullCompany = companies.find(
                          (c) => c.company_name === ex.company_name,
                        );

                        setSelectedCompany(fullCompany || ex);
                        setShowExhibitorPopup(false);

                        // 🔥 FORM AUTO FILL
                        setFormData({
                          exhibitor_company_name: ex.company_name,
                          stall_no: ex.stall_no || "",
                          state: ex.state || "",
                          city: ex.city || "",
                          exhibitor_id: ex.id || "",
                          name: "",
                          candidate_photo: null,
                        });

                        setShowBadgePopup(true);
                      }}
                    >
                      Select
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              className="power-cancle-btn"
              onClick={() => setShowExhibitorPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBadges;
