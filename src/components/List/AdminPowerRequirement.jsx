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

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const [paymentType, setPaymentType] = useState("");
  const [paymentRemark, setPaymentRemark] = useState("");

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState({});

  const [paymentsMap, setPaymentsMap] = useState({});
  const [createdAtMap, setCreatedAtMap] = useState({});

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchAllPower();
    fetchPayments();
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
      console.log("fafhsofisf", result);

      if (result.success && Array.isArray(result.data)) {
        setRows(result.data);

        const uniqueCompanies = [
          ...new Set(
            result.data
              .filter((i) => i.company_name)
              .map((i) => i.company_name?.trim()),
          ),
        ];

        setCompanies(uniqueCompanies.sort((a, b) => a.localeCompare(b)));
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

        const map = {};

        result.data.forEach((row) => {
          if (row.id) {
            map[row.id] = formatToIST(row.created_at);
          }
        });

        setCreatedAtMap(map);

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

  const handlePrintAll = () => {
    if (rows.length === 0) {
      toast.error("No data available");
      return;
    }

    let html = `
  <html>
  <head>
  <title>Power Requirement - All</title>

  <style>
body {
  font-family: Arial;
  padding: 20px;
}

h2 {
  text-align: center;
}

/* ✅ ONLY ONE company-block */
.company-block {
  position: relative;
  page-break-after: always;
  min-height: 100vh;   /* 🔥 vh safe version */
}

/* 🔥 LAST PAGE BLANK FIX */
.company-block:last-child {
  page-break-after: auto;
}

/* 🔥 DUPLICATES */
.duplicate {
  width: 100%;
}

/* FIRST TABLE (TOP) */
.duplicate:first-child {
  position: absolute;
  top: 0;
}

/* SECOND TABLE (HALF PAGE) */
.duplicate:last-child {
  position: absolute;
  top: 52%;   /* 🔥 थोड़ा नीचे for gap */
}

h3 {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  border: 1px solid #000;
  padding: 6px;
  text-align: center;
  font-size: 12px;
}

th {
  background: #f2f2f2;
}
</style>
  </head>
  <body>

  <h2>Power Requirement</h2>
  `;

    companies.forEach((company) => {
      const companyRows = groupedData[company] || [];
      if (!companyRows.length) return;

      const exhibitor = exhibitorData?.find(
        (ex) => ex.company_name?.trim().toLowerCase() === company.toLowerCase(),
      );

      const stallNo = exhibitor?.stall_no || "N/A";

      // 🔥 FUNCTION TO GENERATE TABLE
      const generateTable = () => {
        let table = `
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

          let sgst = 0,
            cgst = 0,
            igst = 0;

          if (state === "delhi") {
            sgst = amount * 0.09;
            cgst = amount * 0.09;
          } else if (state) {
            igst = amount * 0.18;
          }

          const total = amount + sgst + cgst + igst;

          table += `
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

        table += `</tbody></table>`;
        return table;
      };

      // 🔥 ONE COMPANY → ONE PAGE → 2 DUPLICATES
      html += `
      <div class="company-block">

        <div class="duplicate">
          ${generateTable()}
        </div>

        <div class="duplicate">
          ${generateTable()}
        </div>

      </div>
    `;
    });

    html += `</body></html>`;

    const printWindow = window.open("", "", "width=1000,height=700");
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrint = (company) => {
    const companyRows = groupedData[company] || [];

    const exhibitor = exhibitorData?.find(
      (ex) => ex.company_name?.trim().toLowerCase() === company.toLowerCase(),
    );

    const stallNo = exhibitor?.stall_no || "N/A";

    // 🔥 function to generate table
    const generateTable = () => {
      let rowsHTML = "";

      companyRows.forEach((row, i) => {
        const amount = Number(row.total_amount || 0);
        const state = (row.state || "").toLowerCase();

        let sgst = 0,
          cgst = 0,
          igst = 0;

        if (state === "delhi") {
          sgst = amount * 0.09;
          cgst = amount * 0.09;
        } else if (state) {
          igst = amount * 0.18;
        }

        const total = amount + sgst + cgst + igst;

        rowsHTML += `
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

      return `
      <div class="half-page">
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
            ${rowsHTML}
          </tbody>
        </table>
      </div>
    `;
    };

    const html = `
  <html>
  <head>
    <title>Print</title>

    <style>
      body {
        font-family: Arial;
        margin: 0;
        padding: 0;
      }

      .half-page {
        height: 50vh;
        padding: 20px;
        box-sizing: border-box;
        border-bottom: 2px dashed #000;
      }

      h2 {
        text-align: center;
        margin: 5px 0;
      }

      h3 {
        margin: 5px 0 10px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }

      th, td {
        border: 1px solid #000;
        padding: 6px;
        text-align: center;
      }

      th {
        background: #f2f2f2;
      }

      @media print {
        body {
          margin: 0;
        }
      }
    </style>
  </head>

  <body>

    ${generateTable()}
    ${generateTable()}  <!-- 🔥 DUPLICATE -->

  </body>
  </html>
  `;

    const printWindow = window.open("", "", "width=900,height=650");

    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.print();
  };

  const formatToIST = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const exportToExcel = () => {
    const previousIds = JSON.parse(
      localStorage.getItem("lastExportIds") || "[]",
    );
    const currentIds = [];

    const wb = XLSX.utils.book_new();

    let sheetData = [];

    // 🔹 HEADER (image jaisa)
    sheetData.push([
      "ID",
      "Stall No",
      "Company Name",
      "Address",
      "City",
      "State",
      "Pin",
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
      "GST",
      "Date/Time",
      "IS_NEW",
    ]);

    let companyId = 1;

    companies.forEach((company) => {
      const companyRows = groupedData[company] || [];
      if (!companyRows.length) return;

      // ✅ Correct exhibitor fetch
      const exhibitor = exhibitorData?.find(
        (ex) => ex.company_name?.trim().toLowerCase() === company.toLowerCase(),
      );

      const stallNo = exhibitor?.stall_no || "N/A";
      const address = exhibitor?.address || "";
      const city = exhibitor?.city || "";
      const state = exhibitor?.state || "";
      const gst = exhibitor?.gst || "";
      const email = exhibitor?.email || "";
      const pin = exhibitor?.pin || "";
      const created_at = formatToIST(
        companyRows[companyRows.length - 1]?.created_at,
      );
      console.log("time [rint in export", created_at);

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
        currentIds.push(row.id); // 🔥 ADD THIS
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

      const newRows = companyRows.filter((r) => !previousIds.includes(r.id));

      const isNew = newRows.length > 0;

      const grandTotal = total + igst + cgst + sgst;

      // 🔥 SINGLE ROW (image jaisa)
      sheetData.push([
        companyId,
        stallNo,
        company,
        address,
        city,
        state,
        pin,
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
        gst,
        created_at,
        isNew,
      ]);

      companyId++;
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // 🔥 highlight NEW rows
    sheetData.forEach((row, rowIndex) => {
      if (rowIndex === 0) return;

      const isNew = row[row.length - 1]; // last column

      if (isNew) {
        for (let c = 0; c < row.length - 1; c++) {
          const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });

          if (!ws[cellRef]) continue;

          ws[cellRef].s = {
            fill: {
              patternType: "solid",
              fgColor: { rgb: "C6EFCE" },
            },
          };
        }
      }
    });

    sheetData = sheetData.map((row) => row.slice(0, -1));
    // 🔥 STYLE (center + border)
    const range = XLSX.utils.decode_range(ws["!ref"]);

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellRef]) continue;

        ws[cellRef].s = {
          ...(ws[cellRef].s || {}), // 🔥 KEEP OLD STYLE
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

    // 🔥 ONLY SAVE if new data found
    const hasNewData = currentIds.some((id) => !previousIds.includes(id));

    if (hasNewData) {
      localStorage.setItem("lastExportIds", JSON.stringify(currentIds));
    }

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

      const entries = [];

      const price = 4000;

      // 🔥 SETUP DAYS
      if (editingRow.setup_power > 0) {
        entries.push({
          company_name: editingRow.company_name.trim(),
          day: "Setup Days",
          price_per_kw: price,
          power_required: Number(editingRow.setup_power),
          phase:
            editingRow.setup_phase === "Three" ? "Three Phase" : "Single Phase",
          total_amount: Number(editingRow.setup_power) * price,
          is_locked: 0,
        });
      }

      // 🔥 EXHIBITION DAYS
      if (editingRow.exhibition_power > 0) {
        entries.push({
          company_name: editingRow.company_name.trim(),
          day: "Exhibition Days",
          price_per_kw: price,
          power_required: Number(editingRow.exhibition_power),
          phase:
            editingRow.exhibition_phase === "Three"
              ? "Three Phase"
              : "Single Phase",
          total_amount: Number(editingRow.exhibition_power) * price,
          is_locked: 0,
        });
      }

      // ❌ agar dono empty hain
      if (entries.length === 0) {
        toast.error("Enter at least one power");
        return;
      }

      const payload = { entries };

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

  const handlePaymentSelect = (type, company) => {
    if (!type) return;

    const summary = powerPaymentSummary[company];

    setPaymentType(type);
    setPaymentData({
      company_name: company,
      total: summary?.amount || 0,
      grand_total: summary?.total || 0,
    });

    setPaymentRemark("");
    setPaymentAmount("");
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    try {
      if (!paymentType) {
        toast.error("Select payment method");
        return;
      }

      if (!paymentAmount || paymentAmount <= 0) {
        toast.error("Enter valid amount");
        return;
      }

      const payload = {
        company_name: paymentData.company_name,
        stall_no:
          exhibitorData?.find(
            (ex) =>
              ex.company_name?.toLowerCase() ===
              paymentData.company_name.toLowerCase(),
          )?.stall_no || "",
        total: paymentData.total,
        grand_total: paymentData.grand_total,
        received_payment: Number(paymentAmount),
        payment_type: paymentType,
        payment_remark: paymentRemark || null,
      };

      const isUpdate = paymentStatus[paymentData.company_name];

      const url = isUpdate
        ? "https://inoptics.in/api/update_receive_power_payments.php"
        : "https://inoptics.in/api/create_receive_power_payments.php";

      // 🔥 IMPORTANT: wrap in entries
      const bodyData = isUpdate
        ? { entries: [{ ...payload, id: isUpdate }] }
        : { entries: [payload] };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      // 🔥 FIX: result array handle
      const success = data?.result?.[0]?.status === "success";

      if (success) {
        toast.success(isUpdate ? "Payment Updated" : "Payment Added");
        fetchPayments();
        setPaymentStatus((prev) => ({
          ...prev,
          [paymentData.company_name]: data.result[0].id,
        }));

        setShowPaymentModal(false);
      } else {
        toast.error(data?.result?.[0]?.error || "Payment failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/fetch_receive_power_payments.php",
      );

      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        const map = {};

        data.data.forEach((item) => {
          const company = item.company_name?.trim().toLowerCase();

          // 🔥 ALWAYS latest record hi lo
          if (!map[company] || item.id > map[company].id) {
            map[company] = {
              id: item.id,
              totalPaid: Number(item.received_payment || 0),
              lastPaymentType: item.payment_type || "",
              remark: item.payment_remark || "", // ✅ FIX
            };
          }
        });

        setPaymentsMap(map);
      }
    } catch (err) {
      console.error("Payment fetch error:", err);
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

                {paymentsMap[company?.toLowerCase()] && (
                  <span className="power-payment-flag paid">✔ Paid</span>
                )}

                <button
                  className="power-unlock-btn"
                  style={{
                    backgroundColor: unlockStatus?.[company]?.unlockRequested
                      ? "#FF0000" // 🔴 request
                      : "#ff9800", // 🟠 normal
                    cursor: unlockStatus?.[company]?.unlockRequested
                      ? "pointer"
                      : "not-allowed",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();

                    const status = unlockStatus?.[company];

                    // ❌ Agar request hi nahi hai → kuch mat karo
                    if (!status?.unlockRequested) {
                      toast.error("No unlock request found");
                      return;
                    }

                    // ✅ Yaha actual unlock call hoga
                    handleUnlockPowerRequirement(company);
                  }}
                >
                  {unlockStatus?.[company]?.unlockRequested
                    ? "Unlock Request"
                    : "Unlock"}
                </button>
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
                        <th>Payments Received</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {/* 🔥 TOTAL CALC */}
                      {(() => {
                        const totals = {
                          amount: 0,
                          sgst: 0,
                          cgst: 0,
                          igst: 0,
                          grand: 0,
                        };

                        return (
                          <>
                            {companyRows.map((row, i) => {
                              const amount = Number(row.total_amount || 0);
                              const state = (row.state || "")
                                .trim()
                                .toLowerCase();

                              let sgst = 0,
                                cgst = 0,
                                igst = 0;

                              if (state === "delhi") {
                                sgst = amount * 0.09;
                                cgst = amount * 0.09;
                              } else if (state !== "") {
                                igst = amount * 0.18;
                              }

                              const grandTotal = amount + sgst + cgst + igst;

                              // 🔥 accumulate totals
                              totals.amount += amount;
                              totals.sgst += sgst;
                              totals.cgst += cgst;
                              totals.igst += igst;
                              totals.grand += grandTotal;

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

                                  <td>
                                    {/* <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      className="power-payment-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();

                        const companyKey = company.toLowerCase();
                        const payment = paymentsMap[companyKey];
                        const summary = powerPaymentSummary[company];

                        setPaymentData({
                          company_name: company,
                          total: summary?.amount || 0,
                          grand_total: summary?.total || 0,
                        });

                        if (payment) {
                          setPaymentType(payment.lastPaymentType || "");
                          setPaymentAmount(payment.totalPaid || "");
                          setPaymentRemark(payment.remark || "");

                          setPaymentStatus((prev) => ({
                            ...prev,
                            [company]: payment.id,
                          }));
                        } else {
                          setPaymentType("");
                          setPaymentAmount("");
                          setPaymentRemark("");

                          setPaymentStatus((prev) => ({
                            ...prev,
                            [company]: null,
                          }));
                        }

                        setShowPaymentModal(true);
                      }}
                    >
                      {paymentsMap[company?.toLowerCase()]
                        ? "Update"
                        : "Add"}
                    </button>

                    {paymentsMap[company?.toLowerCase()] && (
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        ₹
                        {
                          paymentsMap[company.toLowerCase()]
                            .totalPaid
                        }
                      </span>
                    )}
                  </div> */}
                                  </td>

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
                                      Send Mail
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}

                            {/* 🔥 FINAL TOTAL ROW */}
                            <tr
                              style={{
                                background: "#e8f0fe",
                                fontWeight: "bold",
                              }}
                            >
                              {/* Remark */}
                              <td colSpan="5" style={{ textAlign: "left" }}>
                                {paymentsMap[company?.toLowerCase()]
                                  ?.remark && (
                                  <>
                                    <strong>Remark:</strong>{" "}
                                    {paymentsMap[company.toLowerCase()].remark}
                                  </>
                                )}
                              </td>

                              <td>{totals.amount.toFixed(2)}</td>
                              <td>{totals.sgst.toFixed(2)}</td>
                              <td>{totals.cgst.toFixed(2)}</td>
                              <td>{totals.igst.toFixed(2)}</td>
                              <td>{totals.grand.toFixed(2)}</td>

                              {/* Payment button */}
                              <td>
                                {paymentsMap[company?.toLowerCase()] && (
                                  <span
                                    style={{
                                      color: "green",
                                      marginLeft: "10px",
                                    }}
                                  >
                                    ₹
                                    {
                                      paymentsMap[company.toLowerCase()]
                                        .totalPaid
                                    }
                                  </span>
                                )}
                              </td>

                              <td>
                                <button
                                  className="power-payment-edit-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    const companyKey = company.toLowerCase();
                                    const payment = paymentsMap[companyKey];
                                    const summary =
                                      powerPaymentSummary[company];

                                    setPaymentData({
                                      company_name: company,
                                      total: summary?.amount || 0,
                                      grand_total: summary?.total || 0,
                                    });

                                    if (payment) {
                                      setPaymentType(
                                        payment.lastPaymentType || "",
                                      );
                                      setPaymentAmount(payment.totalPaid || "");
                                      setPaymentRemark(payment.remark || "");

                                      setPaymentStatus((prev) => ({
                                        ...prev,
                                        [company]: payment.id,
                                      }));
                                    } else {
                                      setPaymentType("");
                                      setPaymentAmount("");
                                      setPaymentRemark("");

                                      setPaymentStatus((prev) => ({
                                        ...prev,
                                        [company]: null,
                                      }));
                                    }

                                    setShowPaymentModal(true);
                                  }}
                                >
                                  {paymentsMap[company?.toLowerCase()]
                                    ? "Update/Edit"
                                    : "Add"}
                                </button>
                              </td>
                            </tr>
                          </>
                        );
                      })()}
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

      {showAddPowerModal && (
        <div className="power-modal-overlay">
          <div className="power-modal">
            <h3>Add Power Requirement</h3>

            <label>Company</label>
            <input value={editingRow.company_name} readOnly />

            {/* 🔥 SETUP DAYS */}
            <div className="power-box">
              <h4>Setup Days</h4>

              {/* 🔥 PRICE PER KW */}
              <label>Price Per KW</label>
              <input type="number" value={4000} readOnly />

              <label>Power Required (KW)</label>
              <input
                type="number"
                value={editingRow.setup_power || ""}
                onChange={(e) => {
                  const power = Number(e.target.value) || 0;
                  const price = 4000;

                  setEditingRow((prev) => ({
                    ...prev,
                    setup_power: power,
                    setup_price: price,
                    setup_total: power * price,
                  }));
                }}
              />

              <label>Total</label>
              <input
                type="number"
                value={editingRow.setup_total || 0}
                readOnly
              />

              <div className="phase-radio">
                <label>
                  <input
                    type="radio"
                    name="setupPhase"
                    value="Single"
                    checked={editingRow.setup_phase === "Single"}
                    onChange={(e) =>
                      setEditingRow({
                        ...editingRow,
                        setup_phase: e.target.value,
                      })
                    }
                  />
                  Single
                </label>

                <label>
                  <input
                    type="radio"
                    name="setupPhase"
                    value="Three"
                    checked={editingRow.setup_phase === "Three"}
                    onChange={(e) =>
                      setEditingRow({
                        ...editingRow,
                        setup_phase: e.target.value,
                      })
                    }
                  />
                  Three
                </label>
              </div>
            </div>

            {/* 🔥 EXHIBITION DAYS */}
            <div className="power-box">
              <h4>Exhibition Days</h4>

              {/* 🔥 PRICE PER KW */}
              <label>Price Per KW</label>
              <input type="number" value={4000} readOnly />

              <label>Power Required (KW)</label>
              <input
                type="number"
                value={editingRow.exhibition_power || ""}
                onChange={(e) => {
                  const power = Number(e.target.value) || 0;
                  const price = 4000;

                  setEditingRow((prev) => ({
                    ...prev,
                    exhibition_power: power,
                    exhibition_price: price,
                    exhibition_total: power * price,
                  }));
                }}
              />

              <label>Total</label>
              <input
                type="number"
                value={editingRow.exhibition_total || 0}
                readOnly
              />

              <div className="phase-radio">
                <label>
                  <input
                    type="radio"
                    name="exhibitionPhase"
                    value="Single"
                    checked={editingRow.exhibition_phase === "Single"}
                    onChange={(e) =>
                      setEditingRow({
                        ...editingRow,
                        exhibition_phase: e.target.value,
                      })
                    }
                  />
                  Single
                </label>

                <label>
                  <input
                    type="radio"
                    name="exhibitionPhase"
                    value="Three"
                    checked={editingRow.exhibition_phase === "Three"}
                    onChange={(e) =>
                      setEditingRow({
                        ...editingRow,
                        exhibition_phase: e.target.value,
                      })
                    }
                  />
                  Three
                </label>
              </div>
            </div>

            {/* 🔥 BUTTONS */}
            <div className="btn-main-action">
              <button
                className="power-cancle-btn"
                onClick={() => setShowAddPowerModal(false)}
              >
                Cancel
              </button>

              <button
                className="power-update-btn"
                onClick={() => {
                  const payload = [
                    {
                      company_name: editingRow.company_name,
                      day: "Setup Days",
                      price_per_kw: 4000,
                      power_required: editingRow.setup_power || 0,
                      phase: editingRow.setup_phase,
                      total_amount: editingRow.setup_total || 0,
                    },
                    {
                      company_name: editingRow.company_name,
                      day: "Exhibition Days",
                      price_per_kw: 4000,
                      power_required: editingRow.exhibition_power || 0,
                      phase: editingRow.exhibition_phase,
                      total_amount: editingRow.exhibition_total || 0,
                    },
                  ];

                  handleAddPower(payload); // 🔥 now array send hoga
                }}
              >
                Add Power
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="power-modal-overlay">
          <div className="power-modal">
            <h3>
              {paymentStatus[paymentData?.company_name]
                ? "Update Payment"
                : "Add Payment"}{" "}
              - {paymentData?.company_name}
            </h3>

            {/* 🔥 PAYMENT TYPE */}
            <label>Payment Method</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <option value="">Select Method</option>
              <option value="Cash">Cash</option>
              <option value="Cash">UPI</option>
              <option value="UPI">Online</option>
              <option value="Bank">Cheque</option>
            </select>

            {/* 🔥 AMOUNT */}
            <label>Amount</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />

            {/* 🔥 REMARK */}
            <label>Remark (Optional)</label>
            <textarea
              value={paymentRemark}
              onChange={(e) => setPaymentRemark(e.target.value)}
            />

            <div className="btn-main-action">
              <button
                className="power-cancle-btn"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>

              <button
                className="power-update-btn"
                onClick={handleSubmitPayment}
              >
                {paymentStatus[paymentData?.company_name] ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPowerRequirement;
