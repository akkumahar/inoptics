import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import "./FasciaNameAdmin.css";

const FasciaNameAdmin = ({}) => {
  const [companies, setCompanies] = useState([]);
  const [rows, setRows] = useState([]);
  const [openCompany, setOpenCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editData, setEditData] = useState(null);

  const [exhibitorData, setExhibitorData] = useState([]);

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchAllFascia();
    fetchExhibitorData(); // 👈 IMPORTANT
  }, []);

  const fetchExhibitorData = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_exhibitors.php");
      const data = await res.json();
      console.log("sfskjfhsd",data);
      
      setExhibitorData(data);
    } catch (error) {
      console.error("Failed to fetch exhibitors:", error);
    }
  };

  const exhibitorGrouped = Object.values(
    exhibitorData.reduce((acc, item) => {
      if (!acc[item.company_name]) {
        acc[item.company_name] = {
          company_name: item.company_name,
          category: [],
          stall_no: [],
        };
      }

      if (item.category) acc[item.company_name].category.push(item.category);
      if (item.stall_no) acc[item.company_name].stall_no.push(item.stall_no);

      return acc;
    }, {}),
  );

  const getStallWithBS = (company) => {
    if (!company) return "";

  const normalize = (str) =>
    str?.toLowerCase().replace(/\s+/g, " ").trim();

  const exhibitor = exhibitorGrouped.find(
    (e) => normalize(e.company_name) === normalize(company)
  );

  if (!exhibitor) {
    console.log("❌ Not matched:", company); // debug
    return "";
  }

  const values = [
    ...new Set(
      exhibitor.category.map((cat) => {
        const c = (cat || "").toLowerCase();

        if (c.includes("bare")) return "Bare";
        if (c.includes("shell")) return "Shell";

        return "";
      })
    ),
  ].filter(Boolean);

  return values.join(", ");
  };

  const fetchAllFascia = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_all_fascia.php");
      const data = await res.json();

      if (data.success) {
        setRows(data.records);

        const uniqueCompanies = [
          ...new Set(data.records.map((i) => i.exhibitor_company_name)),
        ].sort((a, b) => a.localeCompare(b));

        setCompanies(uniqueCompanies);
      }
    } catch {
      toast.error("Failed to load fascia data");
    }
  };

  /* ================= EXPORT EXCEL ================= */

  const exportToExcel = () => {
    if (!rows.length) {
      toast.error("No data to export");
      return;
    }

    const exportData = rows.map((row, index) => ({
      ID: index + 1,
      "Stall No": row.stall_no,
      "Company Name": row.exhibitor_company_name,
      "Fascia Name": row.facia_company_name,
      City: row.city,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Fascia Data");

    XLSX.writeFile(workbook, "Fascia_Companies.xlsx");
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this fascia?")) return;

    try {
      const res = await fetch("https://inoptics.in/api/delete_fascia.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Deleted successfully");
        fetchAllFascia();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= EDIT ================= */

  const handleEditClick = (row) => {
    setEditData({ ...row });
    setShowEditPopup(true);
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/update_fascia.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Updated successfully");
        setShowEditPopup(false);
        fetchAllFascia();
      }
    } catch {
      toast.error("Update failed");
    }
  };

  /* ================= GROUP DATA ================= */

  const groupedData = rows.reduce((acc, row) => {
    if (!acc[row.exhibitor_company_name]) {
      acc[row.exhibitor_company_name] = [];
    }

    acc[row.exhibitor_company_name].push(row);

    return acc;
  }, {});

  /* ================= PRINT ================= */

  const handlePrintAll = () => {
    let html = `
  <html>
  <head>

  <title>Fascia Report</title>

  <style>

  body{
  font-family:Arial;
  padding:20px;
  }

  h2{
  text-align:center;
  margin-bottom:40px;
  }

  h3{
  margin-top:40px;
  }

  table{
  width:100%;
  border-collapse:collapse;
  margin-top:10px;
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

  <h2>Fascia Report</h2>

  `;

    companies.forEach((company) => {
      const companyRows = groupedData[company] || [];

      html += `<h3>${company}</h3>`;

      html += `
    <table>
    <thead>
    <tr>
    <th>ID</th>
    <th>Fascia Name</th>
    <th>Stall No</th>
    <th>Bare/Shell</th>
    <th>City</th>
    </tr>
    </thead>
    <tbody>
    `;

      companyRows.forEach((row, i) => {
        html += `
      <tr>
      <td>${i + 1}</td>
      <td>${row.facia_company_name}</td>
      <td>${row.stall_no}</td>
      <td>${getStallWithBS(row.exhibitor_company_name)}</td>
      <td>${row.city}</td>
      </tr>
      `;
      });

      html += `</tbody></table>`;
    });

    html += `
  </body>
  </html>
  `;

    const printWindow = window.open("", "", "width=1200,height=700");

    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.print();
  };

  const handlePrintCompany = (company) => {
    const companyRows = groupedData[company] || [];

    let html = `
  <html>
  <head>

  <title>Fascia Report</title>

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

  <h2>Fascia Report</h2>

  <h3>${company}</h3>

  <table>

  <thead>
  <tr>
  <th>ID</th>
  <th>Fascia Name</th>
  <th>Stall No</th>
  <th>Bare/Shell</th>
  <th>City</th>
  </tr>
  </thead>

  <tbody>
  `;

    companyRows.forEach((row, i) => {
      html += `
    <tr>
    <td>${i + 1}</td>
    <td>${row.facia_company_name}</td>
    <td>${row.stall_no}</td>
   <td>${getStallWithBS(row.exhibitor_company_name)}</td>
    <td>${row.city}</td>
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

  return (
    <>
      <div className="fascia-admin-container">
        {/* TOP BAR */}

        <div className="fascia-top-bar">
          <button className="fascia-export-btn" onClick={exportToExcel}>
            Export Excel
          </button>

          <button className="print-btn" onClick={handlePrintAll}>
            Print All
          </button>

          <input
            type="text"
            placeholder="Search company or fascia name..."
            value={searchTerm}
            className="fascia-name-search"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* COMPANY ACCORDION */}

        {companies
          .filter((company) => {
            const term = searchTerm.toLowerCase();

            if (company.toLowerCase().includes(term)) return true;

            const fasciaMatch = groupedData[company]?.some((row) =>
              row.facia_company_name?.toLowerCase().includes(term),
            );

            return fasciaMatch;
          })
          .map((company, index) => {
            const isOpen = openCompany === company;

            return (
              <div key={index} className="accordion-item">
                <div
                  className="accordion-header"
                  onClick={() => setOpenCompany(isOpen ? null : company)}
                >
                  {company}

                  <button
                    className="particular-print-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintCompany(company);
                    }}
                  >
                    Print
                  </button>

                  <span>{isOpen ? "▲" : "▼"}</span>
                </div>

                {isOpen && (
                  <div className="accordion-body">
                    <table className="fascia-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Fascia Name</th>
                          <th>Stall No</th>
                          <th>Bare/Shell</th>
                          <th>City</th>
                          <th>Edit</th>
                          <th>Delete</th>
                        </tr>
                      </thead>

                      <tbody>
                        {groupedData[company]?.map((row, i) => (
                          <tr key={row.id}>
                            <td>{i + 1}</td>
                            <td>{row.facia_company_name}</td>
                            <td>{row.stall_no}</td>
                            <td>
                              {getStallWithBS(row.exhibitor_company_name)}
                            </td>
                            <td>{row.city}</td>

                            <td>
                              <button
                                className="btn edit"
                                onClick={() => handleEditClick(row)}
                              >
                                Edit
                              </button>
                            </td>

                            <td>
                              <button
                                className="btn delete"
                                onClick={() => handleDelete(row.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* ================= PRINT ALL DATA ================= */}

      <div id="fascia-print-all">
        <h2 style={{ textAlign: "center" }}>Fascia Report</h2>

        {companies.map((company) => {
          const companyRows = groupedData[company] || [];

          return (
            <div
              key={company}
              className="print-company"
              style={{ marginBottom: "30px" }}
            >
              <h3>{company}</h3>

              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fascia Name</th>
                    <th>Stall No</th>
                    <th>City</th>
                  </tr>
                </thead>

                <tbody>
                  {companyRows.map((row, i) => (
                    <tr key={row.id}>
                      <td>{i + 1}</td>
                      <td>{row.facia_company_name}</td>
                      <td>{row.stall_no}</td>
                      <td>{row.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FasciaNameAdmin;
