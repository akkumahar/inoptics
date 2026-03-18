import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import "./AdminPowerRequirement.css";

const AdminPowerRequirement = ({ exhibitorData }) => {
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [openCompany, setOpenCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [powerPaymentSummary, setPowerPaymentSummary] = useState({});
  const [unlockRequests, setUnlockRequests] = useState({});

  const [showExhibitorList, setShowExhibitorList] = useState(false);
  const [showAddPowerModal, setShowAddPowerModal] = useState(false);
  const [selectedExhibitor, setSelectedExhibitor] = useState(null);

  const [unlockStatus, setUnlockStatus] = useState({});

  const [exhibitorSearch, setExhibitorSearch] = useState("");
  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchAllPower();
  }, []);

  useEffect(() => {
    const summary = {};

    rows.forEach((row) => {
      const company = row.company_name?.trim();
      const amount = Number(row.total_amount || 0);
      const state = (row.state || "").toLowerCase();

      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (state === "delhi") {
        cgst = amount * 0.09;
        sgst = amount * 0.09;
      } else if (state) {
        igst = amount * 0.18;
      }

      const total = amount + cgst + sgst + igst;

      if (!summary[company]) {
        summary[company] = {
          amount: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          total: 0,
          cleared: 0,
          pending: 0,
        };
      }

      summary[company].amount += amount;
      summary[company].cgst += cgst;
      summary[company].sgst += sgst;
      summary[company].igst += igst;
      summary[company].total += total;
    });

    setPowerPaymentSummary(summary);
  }, [rows]);

  const fetchAllPower = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        "https://inoptics.in/api/get_all_power_requirement.php",
      );

      const result = await res.json();

      if (result.success && Array.isArray(result.data)) {
        setRows(result.data);

        const uniqueCompanies = [
          ...new Set(
            result.data
              .filter((i) => i.company_name)
              .map((i) => i.company_name?.trim()),
          ),
        ];

        setCompanies(uniqueCompanies);
        const requestMap = {};

        result.data.forEach((row) => {
          const company = row.company_name?.trim();
          if (!company) return;

          if (!requestMap[company]) {
            requestMap[company] = {
              unlockRequested: false,
            };
          }

          if (row.unlock_requested == 1) {
            requestMap[company].unlockRequested = true;
          }
        });

        setUnlockStatus(requestMap);
      } else {
        toast.error("No data found");
      }
    } catch {
      toast.error("Failed to load data");
    }

    setLoading(false);
  };

  /* ================= GROUP DATA ================= */

  const groupedData = rows.reduce((acc, row) => {
    const name = row.company_name?.trim();

    if (!name) return acc;

    if (!acc[name]) {
      acc[name] = [];
    }

    acc[name].push(row);
    return acc;
  }, {});

  /* ================= DELETE ================= */

  const handleDelete = async (row) => {
    if (!window.confirm("Delete this entry?")) return;

    const res = await fetch("https://inoptics.in/api/delete_power_by_id.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: row.company_name,
        id: row.id,
      }),
    });

    const result = await res.json();

    if (result.success) {
      toast.success("Deleted successfully");
      fetchAllPower();
    } else {
      toast.error(result.error);
    }
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {
    try {
      const payload = {
        company_name: editingRow.company_name,
        entries: [
          {
            day: editingRow.day,
            price_per_kw: editingRow.price_per_kw,
            power_required: editingRow.power_required,
            phase: editingRow.phase,
          },
        ],
      };

      const res = await fetch(
        "https://inoptics.in/api/update_power_requirement.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Updated successfully");
        setShowEditModal(false);
        fetchAllPower();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch {
      toast.error("Server error");
    }
  };

  /* ================= SEND MAIL ================= */

  const handleSendPowerMail = async (row) => {
    const toastId = toast.loading("Sending power update mails...");

    try {
      await sendPowerRevisedMail(row.company_name, row.email);
      await sendPowerVendorMail(row.company_name);

      toast.dismiss(toastId);
      toast.success("Power update mails sent successfully");
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to send mail");
    }
  };

  const sendPowerVendorMail = async (companyName) => {
    await fetch("https://inoptics.in/api/send_power_vendor_mail.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_name: "Revised Power Load Vendor",
        company_name: companyName,
      }),
    });
  };

  const sendPowerRevisedMail = async (companyName, email) => {
    await fetch("https://inoptics.in/api/send_power_revised_mail.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_name: companyName,
        template_name: "POWER LOAD INCREASED",
        email: email,
      }),
    });
  };

  /* ================= EXPORT EXCEL ================= */

  const exportToExcel = () => {
    if (rows.length === 0) {
      toast.error("No data available");
      return;
    }

    const exportData = rows.map((row, index) => {
      const amount = Number(row.total_amount || 0);
      const state = (row.state || "").toLowerCase();

      let sgst = 0;
      let cgst = 0;
      let igst = 0;

      if (state === "delhi") {
        sgst = amount * 0.09;
        cgst = amount * 0.09;
      } else if (state) {
        igst = amount * 0.18;
      }

      const grandTotal = amount + sgst + cgst + igst;

      return {
        ID: index + 1,
        "Company Name": row.company_name,
        Day: row.day,
        "Price Per KW": row.price_per_kw,
        "Power Required": row.power_required,
        Phase: row.phase,
        Amount: amount,
        SGST: sgst,
        CGST: cgst,
        IGST: igst,
        "Grand Total": grandTotal,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Power Requirement");

    XLSX.writeFile(workbook, "Power_Requirement.xlsx");
  };

  const handlePrint = (company) => {
    const companyRows = groupedData[company] || [];

    const exhibitor = exhibitorData?.find(
      (ex) => ex.company_name?.trim().toLowerCase() === company.toLowerCase(),
    );

    const stallNo = exhibitor?.stall_no || "N/A";

    let html = `
  <html>
  <head>
  <title>Power Requirement</title>

  <style>

  body{
  font-family:Arial;
  padding:20px;
  }

  h2{
  text-align:center;
  }

  table{
  width:100%;
  border-collapse:collapse;
  margin-top:20px;
  }

  th,td{
  border:1px solid #000;
  padding:8px;
  text-align:center;
  }

  th{
  background:#f2f2f2;
  }

  </style>

  </head>

  <body>

  <h2>Power Requirement</h2>

  <h3>${company} (Stall No: ${stallNo})</h3>

  <table>

  <thead>
  <tr>
  <th>ID</th>
  <th>Day</th>
  <th>Price/KW</th>
  <th>Power</th>
  <th>Phase</th>
  <th>Amount</th>
  <th>SGST</th>
  <th>CGST</th>
  <th>IGST</th>
  <th>Grand Total</th>
  </tr>
  </thead>

  <tbody>
  `;

    companyRows.forEach((row, i) => {
      const amount = Number(row.total_amount || 0);

      const state = (row.state || "").toLowerCase();

      let sgst = 0;
      let cgst = 0;
      let igst = 0;

      if (state === "delhi") {
        sgst = amount * 0.09;
        cgst = amount * 0.09;
      } else if (state) {
        igst = amount * 0.18;
      }

      const total = amount + sgst + cgst + igst;

      html += `
    <tr>
    <td>${i + 1}</td>
    <td>${row.day}</td>
    <td>${row.price_per_kw}</td>
    <td>${row.power_required}</td>
    <td>${row.phase}</td>
    <td>${amount.toFixed(2)}</td>
    <td>${sgst.toFixed(2)}</td>
    <td>${cgst.toFixed(2)}</td>
    <td>${igst.toFixed(2)}</td>
    <td>${total.toFixed(2)}</td>
    </tr>
    `;
    });

    html += `
  </tbody>
  </table>
  </body>
  </html>
  `;

    const printWindow = window.open("", "", "width=900,height=650");

    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.print();
  };

  const handlePrintAll = () => {
  const wb = XLSX.utils.book_new();

  let sheetData = [];

  // 🔹 HEADER (image jaisa)
  sheetData.push([
    "ID",
    "Stall No",
    "Company Name",
    "Address",
    "City",
    "Setup Days",
    "Exhibition Days",
    "Setup Load",
    "Exhibition Load",
    "Setup Phase",
    "Exhibition Phase",
    "Total",
    "IGST",
    "CGST",
    "SGST",
    "Grand Total",
    "Email",
  ]);

  let companyId = 1;

  companies.forEach((company) => {
    const companyRows = groupedData[company] || [];
    if (!companyRows.length) return;

    // ✅ Correct exhibitor fetch
    const exhibitor = exhibitorData?.find(
      (ex) =>
        ex.company_name?.trim().toLowerCase() === company.toLowerCase()
    );

    const stallNo = exhibitor?.stall_no || "N/A";
    const address = exhibitor?.address || "";
    const city = exhibitor?.city || "";
    const email = exhibitor?.email || "";

    // 🔹 Summary calculation
    let setupDays = 0,
      exhibDays = 0,
      setupLoad = 0,
      exhibLoad = 0,
      total = 0,
      igst = 0,
      cgst = 0,
      sgst = 0;

    let setupPhase = "";
    let exhibPhase = "";

    companyRows.forEach((row) => {
      const amount = Number(row.total_amount || 0);
      const state = (row.state || "").toLowerCase();

      if (row.day?.toLowerCase().includes("setup")) {
        setupDays += amount;
        setupLoad += Number(row.power_required || 0);
        setupPhase = row.phase;
      } else {
        exhibDays += amount;
        exhibLoad += Number(row.power_required || 0);
        exhibPhase = row.phase;
      }

      total += amount;

      if (state === "delhi") {
        sgst += amount * 0.09;
        cgst += amount * 0.09;
      } else if (state) {
        igst += amount * 0.18;
      }
    });

    const grandTotal = total + igst + cgst + sgst;

    // 🔥 SINGLE ROW (image jaisa)
    sheetData.push([
      companyId,
      stallNo,
      company,
      address,
      city,
      setupDays,
      exhibDays,
      setupLoad,
      exhibLoad,
      setupPhase,
      exhibPhase,
      total,
      igst,
      cgst,
      sgst,
      grandTotal,
      email,
    ]);

    companyId++;
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // 🔥 STYLE (center + border)
  const range = XLSX.utils.decode_range(ws["!ref"]);

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) continue;

      ws[cellRef].s = {
        alignment: {
          horizontal: "left",
          vertical: "center",
        },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, "Power Report");

  const excelBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
    cellStyles: true,
  });

  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(blob, "Power_Report.xlsx");
};

  const handleUnlockPowerRequirement = async (companyName) => {
    if (!companyName) {
      toast.error("Company name missing!");
      return;
    }

    try {
      const res = await fetch(
        "https://inoptics.in/api/update_unlock_power_requirement.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company_name: companyName }),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to unlock panel");
        return;
      }

      // ✅ SUCCESS UI UPDATE FIRST (FAST UX)
      setUnlockStatus((prev) => ({
        ...prev,
        [companyName]: {
          ...(prev[companyName] || {}),
          unlockRequested: false,
        },
      }));

      toast.success("Power Requirement unlocked successfully");

      /* ================= SEND MAIL ================= */
      try {
        await fetch("https://inoptics.in/api/send_power_unlocked_mail.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_name: companyName,
            template_name:
              "InOptics 2026 @ Successfully Unlocked Power Requirement",
          }),
        });
      } catch (mailErr) {
        console.error("Mail failed:", mailErr);
        // ❗ mail fail ho to bhi unlock already ho chuka hai
      }

      /* ================= REFRESH DATA ================= */
      fetchAllPower();
    } catch (error) {
      console.error("Unlock error:", error);
      toast.error("Unlock failed");
    }
  };

  const handleAddPower = async () => {
    try {
      if (!editingRow?.company_name) {
        toast.error("Company name missing");
        return;
      }

      if (!editingRow?.day) {
        toast.error("Please select day");
        return;
      }

      if (!editingRow?.power_required || editingRow.power_required <= 0) {
        toast.error("Enter valid power required");
        return;
      }

      const price = Number(editingRow.price_per_kw || 4000);
      const power = Number(editingRow.power_required);
      const total = price * power;

      const payload = {
        entries: [
          {
            company_name: editingRow.company_name.trim(),
            day: editingRow.day,
            price_per_kw: price,
            power_required: power,
            phase:
              editingRow.phase === "Three" ? "Three Phase" : "Single Phase",
            total_amount: total,
            is_locked: 0,
          },
        ],
      };

      console.log("Sending payload:", payload);

      const res = await fetch(
        "https://inoptics.in/api/add_Exhibitor_power_requirement_Extra_Component.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const text = await res.text();
      console.log("Server response:", text);

      let data = {};
      if (text) data = JSON.parse(text);

      if (res.ok) {
        toast.success("Power added successfully");

        setShowAddPowerModal(false);
        setEditingRow(null);

        fetchAllPower();
      } else {
        toast.error(data.error || "Submission failed");
      }
    } catch (error) {
      console.error("Add power error:", error);
      toast.error("Server error");
    }
  };

  return (
    <div className="admin-power-wrapper">
      <div className="power-top-bar">
        <button className="power-export-btn" onClick={exportToExcel}>
          Export Excel
        </button>

        <button className="print-all-btn" onClick={handlePrintAll}>
          Print All
        </button>

        <button
          className="new-power-add-btn"
          onClick={() => setShowExhibitorList(true)}
        >
          Add New Exhibitor Power
        </button>

        <input
          type="text"
          placeholder="Search company..."
          value={searchTerm}
          className="power-name-search"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <p>Loading...</p>}

      {companies
        .filter((company) =>
          company.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .map((company, index) => {
          const isOpen = openCompany === company;
          const companyRows =
            rows.filter(
              (r) =>
                r.company_name?.trim().toLowerCase() === company.toLowerCase(),
            ) || [];

          const exhibitor = exhibitorData?.find(
            (ex) =>
              ex.company_name?.trim().toLowerCase() === company.toLowerCase(),
          );

          const stallNo = exhibitor?.stall_no || "N/A";

          return (
            <div key={index} className="power-accordion">
              <div
                className="power-accordion-header"
                onClick={() => setOpenCompany(isOpen ? null : company)}
              >
                {company}
                <div className="power-summary">
                  <span
                    style={{
                      background: "red",
                      color: "#ffff",
                      fontWeight: "bold",
                    }}
                  >
                    Stall No: {stallNo}
                  </span>
                  {powerPaymentSummary[company] && (
                    <>
                      <span>
                        Power Amount: ₹
                        {powerPaymentSummary[company].amount.toFixed(2)}
                      </span>

                      {companyRows?.[0]?.state?.toLowerCase() === "delhi" ? (
                        <>
                          <span>
                            CGST: ₹
                            {powerPaymentSummary[company].cgst.toFixed(2)}
                          </span>
                          <span>
                            SGST: ₹
                            {powerPaymentSummary[company].sgst.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span>
                          IGST: ₹{powerPaymentSummary[company].igst.toFixed(2)}
                        </span>
                      )}

                      <span>
                        Grand Total: ₹
                        {powerPaymentSummary[company].total.toFixed(2)}
                      </span>
                      <span>
                        Cleared: ₹
                        {powerPaymentSummary[company].cleared.toFixed(2)}
                      </span>
                      <span>
                        Pending: ₹
                        {powerPaymentSummary[company].pending.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
                <button
                  className="power-print-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrint(company);
                  }}
                >
                  Print
                </button>

                {unlockStatus?.[company]?.unlockRequested && (
                  <button
                    className="power-btn unlock-btn"
                    style={{
                      backgroundColor: "#ff9800",
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnlockPowerRequirement(company);
                    }}
                  >
                    Unlock
                  </button>
                )}
                <span>{isOpen ? "▲" : "▼"}</span>
              </div>

              {isOpen && (
                <div className="power-accordion-body">
                  <table className="power-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Day</th>
                        <th>Price/KW</th>
                        <th>Power</th>
                        <th>Phase</th>
                        <th>Amount</th>
                        <th>SGST (9%)</th>
                        <th>CGST (9%)</th>
                        <th>IGST (18%)</th>
                        <th>Grand Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {companyRows.map((row, i) => {
                        const amount = Number(row.total_amount || 0);

                        const state = (row.state || "").trim().toLowerCase();

                        let sgst = 0;
                        let cgst = 0;
                        let igst = 0;

                        if (state === "delhi") {
                          sgst = amount * 0.09;
                          cgst = amount * 0.09;
                        } else if (state !== "") {
                          igst = amount * 0.18;
                        }

                        const grandTotal = amount + sgst + cgst + igst;
                        return (
                          <tr key={row.id}>
                            <td>{i + 1}</td>
                            <td>{row.day}</td>
                            <td>{row.price_per_kw}</td>
                            <td>{row.power_required}</td>
                            <td>{row.phase}</td>

                            <td>{amount.toFixed(2)}</td>
                            <td>{sgst.toFixed(2)}</td>
                            <td>{cgst.toFixed(2)}</td>
                            <td>{igst.toFixed(2)}</td>
                            <td>{grandTotal.toFixed(2)}</td>

                            <td className="power-action-cell">
                              <button
                                className="power-edit-btn"
                                onClick={() => {
                                  setEditingRow(row);
                                  setShowEditModal(true);
                                }}
                              >
                                Edit
                              </button>

                              <button
                                className="power-delete-btn"
                                onClick={() => handleDelete(row)}
                              >
                                Delete
                              </button>

                              <button
                                className="power-mail-btn"
                                onClick={() => handleSendPowerMail(row)}
                              >
                                Send Mail Update Power
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

      {/* EDIT MODAL */}

      {showEditModal && editingRow && (
        <div className="power-modal-overlay">
          <div className="power-modal">
            <h3>Edit Power Requirement</h3>

            <label>Day</label>
            <input type="text" value={editingRow.day} readOnly />

            <label>Price Per KW</label>
            <input type="number" value={editingRow.price_per_kw} readOnly />

            <label>Power Required</label>
            <input
              type="number"
              value={editingRow.power_required}
              onChange={(e) =>
                setEditingRow({
                  ...editingRow,
                  power_required: e.target.value,
                })
              }
            />

            <label>Phase</label>

            <div className="phase-radio">
              <label>
                <input
                  type="radio"
                  value="Single"
                  checked={editingRow.phase === "Single"}
                  onChange={(e) =>
                    setEditingRow({ ...editingRow, phase: e.target.value })
                  }
                />
                Single Phase
              </label>

              <label>
                <input
                  type="radio"
                  value="Three"
                  checked={editingRow.phase === "Three"}
                  onChange={(e) =>
                    setEditingRow({ ...editingRow, phase: e.target.value })
                  }
                />
                Three Phase
              </label>
            </div>

            <div className="btn-main-action">
              <button
                className="power-cancle-btn"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>

              <button className="power-update-btn" onClick={handleUpdate}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {showExhibitorList && (
        <div className="power-modal-overlay">
          <div className="power-modal large">
            <h3>Select Exhibitor</h3>
            <input
              type="text"
              placeholder="Search exhibitor..."
              className="exhibitor-search"
              value={exhibitorSearch}
              onChange={(e) => setExhibitorSearch(e.target.value)}
            />

            <div className="exhibitor-list">
              {exhibitorData
                .filter((ex) =>
                  ex.company_name
                    .toLowerCase()
                    .includes(exhibitorSearch.toLowerCase()),
                )
                .map((ex, i) => (
                  <div key={i} className="exhibitor-row">
                    <span>{ex.company_name}</span>

                    <button
                      className="select-btn"
                      onClick={() => {
                        setSelectedExhibitor(ex);
                        setShowExhibitorList(false);

                        setEditingRow({
                          company_name: ex.company_name,
                          day: "Setup Days",
                          price_per_kw: 4000,
                          power_required: "",
                          total_amount: 0,
                          phase: "Single",
                        });

                        setShowAddPowerModal(true);
                      }}
                    >
                      Select
                    </button>
                  </div>
                ))}
            </div>

            <button
              className="power-cancle-btn"
              onClick={() => setShowExhibitorList(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showAddPowerModal && editingRow && (
        <div className="power-modal-overlay">
          <div className="power-modal">
            <h3>Add Power Requirement</h3>

            <label>Company</label>
            <input value={editingRow.company_name} readOnly />

            <label>Day</label>
            <select
              value={editingRow.day}
              onChange={(e) =>
                setEditingRow({ ...editingRow, day: e.target.value })
              }
            >
              <option value="">Select Day</option>
              <option value="Setup Days">Setup Days</option>
              <option value="Exhibition Days">Exhibition Days</option>
            </select>

            <label>Price Per KW</label>
            <input
              type="number"
              value={editingRow.price_per_kw || 4000}
              readOnly
            />

            <label>Power Required (KW)</label>
            <input
              type="number"
              value={editingRow.power_required}
              onChange={(e) => {
                const power = Number(e.target.value) || 0;
                const price = 4000;

                setEditingRow((prev) => ({
                  ...prev,
                  power_required: power,
                  price_per_kw: price,
                  total_amount: power * price,
                }));
              }}
            />

            <label>Total Amount</label>
            <input type="number" value={editingRow.total_amount} readOnly />

            <label>Phase</label>

            <div className="phase-radio">
              <label>
                <input
                  type="radio"
                  value="Single"
                  checked={editingRow.phase === "Single"}
                  onChange={(e) =>
                    setEditingRow({ ...editingRow, phase: e.target.value })
                  }
                />
                Single Phase
              </label>

              <label>
                <input
                  type="radio"
                  value="Three"
                  checked={editingRow.phase === "Three"}
                  onChange={(e) =>
                    setEditingRow({ ...editingRow, phase: e.target.value })
                  }
                />
                Three Phase
              </label>
            </div>

            <div className="btn-main-action">
              <button
                className="power-cancle-btn"
                onClick={() => setShowAddPowerModal(false)}
              >
                Cancel
              </button>

              <button className="power-update-btn" onClick={handleAddPower}>
                Add Power
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPowerRequirement;
