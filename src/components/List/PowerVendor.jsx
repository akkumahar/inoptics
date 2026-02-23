import React, { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import "./PowerVendor.css"
const PowerVendor = ({ activeCommunicationTab }) => {
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    vendor_name: "",
    company_name: "",
    email: "",
    contact_number: ""
  });
  const [editId, setEditId] = useState(null);

  // ================= FETCH VENDORS =================
  const fetchVendors = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_power_vendors.php"
      );
      const data = await res.json();

      if (data.success) {
        setVendors(data.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    if (activeCommunicationTab === "Power Vendor") {
      fetchVendors();
    }
  }, [activeCommunicationTab]);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ================= HANDLE SAVE =================
  const handleSave = async () => {
    if (!formData.vendor_name || !formData.email) {
      alert("Vendor name and email required");
      return;
    }

    const url = editId
      ? "https://inoptics.in/api/update_power_vendor.php"
      : "https://inoptics.in/api/add_power_vendor.php";

    const payload = editId
      ? { id: editId, ...formData }
      : formData;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editId ? "Vendor updated successfully!" : "Vendor added successfully!");

        setFormData({
          vendor_name: "",
          company_name: "",
          email: "",
          contact_number: ""
        });

        setEditId(null);
        fetchVendors();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ================= HANDLE EDIT =================
  const handleEdit = (vendor) => {
    setEditId(vendor.id);
    setFormData({
      vendor_name: vendor.vendor_name,
      company_name: vendor.company_name,
      email: vendor.email,
      contact_number: vendor.contact_number
    });
  };

  // ================= HANDLE DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vendor?")) return;

    try {
      const res = await fetch(
        "https://inoptics.in/api/delete_power_vendor.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Vendor deleted");
        fetchVendors();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ================= UI =================
  if (activeCommunicationTab !== "Power Vendor") return null;

  return (
    <div className="power-vendor-wrapper">
      
      <div className="power-vendor-body">
        {/* ================= TABLE ================= */}
        <div className="vendor-table-section">
          <table className="vendor-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Vendor Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No vendors found
                  </td>
                </tr>
              ) : (
                vendors.map((v, index) => (
                  <tr key={v.id}>
                    <td>{index + 1}</td>
                    <td>{v.vendor_name}</td>
                    <td>{v.company_name}</td>
                    <td>{v.email}</td>
                    <td>{v.contact_number}</td>
                    <td className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(v)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(v.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= FORM CARD ================= */}
        <div className="vendor-form-card">
          <h4>{editId ? "Update Vendor" : "Add Vendor"}</h4>

          <input
            type="text"
            name="vendor_name"
            placeholder="Vendor Name"
            value={formData.vendor_name}
            onChange={handleChange}
          />

          <input
            type="text"
            name="company_name"
            placeholder="Company Name"
            value={formData.company_name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="contact_number"
            placeholder="Contact Number"
            value={formData.contact_number}
            onChange={handleChange}
          />

          <button className="save-btn" onClick={handleSave}>
            {editId ? "Update Vendor" : "Add Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PowerVendor;