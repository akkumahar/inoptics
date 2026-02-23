import React, { useEffect, useState } from "react";
import "./FurnitureVendor.css";

const FurnitureVendor = () => {

  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    id: null,
    vendor_name: "",
    company_name: "",
    email: "",
    contact_number: ""
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    const res = await fetch("https://inoptics.in/api/get_furniture_vendor.php");
    const data = await res.json();
    if (data.success) {
      setVendors(data.data);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const res = await fetch("https://inoptics.in/api/add_furniture_vendor.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (data.success) {
      fetchVendors();
      setForm({
        id: null,
        vendor_name: "",
        company_name: "",
        email: "",
        contact_number: ""
      });
    }
  };

  const handleEdit = (vendor) => {
    setForm(vendor);
  };

  const handleDelete = async (id) => {
    await fetch("https://inoptics.in/api/delete_furniture_vendor.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    fetchVendors();
  };

  return (
    <div className="furniture-vendor-wrapper">
 
      <div className="furniture-vendor-body">

        {/* TABLE SECTION */}
        <div className="furniture-table-section">
          <table className="furniture-table">
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
                  <td colSpan="5" style={{ textAlign: "center", padding: "15px" }}>
                    No vendors found
                  </td>
                </tr>
              ) : (
                vendors.map(v => (
                  <tr key={v.id}>
                    <td>{v.id}</td>
                    <td>{v.vendor_name}</td>
                    <td>{v.company_name}</td>
                    <td>{v.email}</td>
                    <td>{v.contact_number}</td>
                    <td>
                      <div className="furniture-action-buttons">
                        <button
                          className="furniture-edit-btn"
                          onClick={() => handleEdit(v)}
                        >
                          Edit
                        </button>
                        <button
                          className="furniture-delete-btn"
                          onClick={() => handleDelete(v.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FORM SECTION */}
        <div className="furniture-form-card">
          <h4>{form.id ? "Update Vendor" : "Add Vendor"}</h4>

          <input
            name="vendor_name"
            placeholder="Vendor Name"
            value={form.vendor_name}
            onChange={handleChange}
          />

          <input
            name="company_name"
            placeholder="Company Name"
            value={form.company_name}
            onChange={handleChange}
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="contact_number"
            placeholder="Contact Number"
            value={form.contact_number}
            onChange={handleChange}
          />

          <button
            className="furniture-save-btn"
            onClick={handleSubmit}
          >
            {form.id ? "Update Vendor" : "Add Vendor"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default FurnitureVendor;