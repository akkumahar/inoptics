import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "./ExportContractorList.css"

const ContractorList = () => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        "https://inoptics.in/api/get_contractor_requirement.php"
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setContractors(data);
      } else if (data.success) {
        setContractors(data.data);
      }

    } catch (error) {
      console.error("Fetch error:", error);
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this contractor?")) return;

    try {
      const res = await fetch(
        "https://inoptics.in/api/delete_contractor.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Deleted successfully");
        fetchContractors();
      } else {
        alert("Delete failed");
      }

    } catch (error) {
      console.error(error);
    }
  };

  /* ================= EXPORT EXCEL ================= */

  const exportToExcel = () => {

    if (contractors.length === 0) {
      alert("No data available");
      return;
    }

    const exportData = contractors.map((item, index) => ({
      ID: index + 1,
      "Company Name": item.company_name,
      Name: item.name,
      City: item.city,
      Pincode: item.pincode,
      Mobile: item.mobile_numbers,
      Email: item.email,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Contractors");

    XLSX.writeFile(workbook, "Contractors_List.xlsx");
  };

  return (
    <div className="contractor-wrapper">

      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"15px"}}>
        <h2>Contractors</h2>

        <button
          onClick={exportToExcel}
          style={{
            background:"#2e7d32",
            color:"#fff",
            border:"none",
            padding:"8px 16px",
            cursor:"pointer"
          }}
        >
          Export Excel
        </button>
      </div>

      {loading && <p>Loading contractors...</p>}

      <table className="contractor-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Company Name</th>
            <th>Name</th>
            <th>City</th>
            <th>Pincode</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {contractors.map((item, index) => (
            <tr key={item.id || index}>
              <td>{index + 1}</td>
              <td>{item.company_name}</td>
              <td>{item.name}</td>
              <td>{item.city}</td>
              <td>{item.pincode}</td>
              <td>{item.mobile_numbers}</td>
              <td>{item.email}</td>

              <td className="action-buttons">
                <button
                  className="edit-btn"
                  onClick={() => console.log("Edit", item)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
};

export default ContractorList;