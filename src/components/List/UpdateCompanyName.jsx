import React, { useState } from "react";
import toast from "react-hot-toast";
import "./UpdateCompanyName.css";

const UpdateCompanyName = ({ fetchExhibitorData }) => {
  const [oldCompany, setOldCompany] = useState("");
  const [newCompany, setNewCompany] = useState("");

  const handleUpdate = async () => {
    if (!oldCompany || !newCompany) {
      toast.error("Both fields are required");
      return;
    }

    try {
      const res = await fetch(
        "https://inoptics.in/api/update_company_name_everywhere.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            old_company_name: oldCompany,
            new_company_name: newCompany,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Company name updated successfully");
        setOldCompany("");
        setNewCompany("");
        fetchExhibitorData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Server error");
    }
  };

  return (
    <div className="company-update-container">
      <h2>Update Company Name</h2>

      <div className="company-form">
        <input
          type="text"
          placeholder="Old Company Name"
          value={oldCompany}
          onChange={(e) => setOldCompany(e.target.value)}
        />

        <input
          type="text"
          placeholder="New Company Name"
          value={newCompany}
          onChange={(e) => setNewCompany(e.target.value)}
        />

        <button onClick={handleUpdate}>Update Company</button>
      </div>
    </div>
  );
};

export default UpdateCompanyName;
