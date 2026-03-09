import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import "./ExtraFurnitureManager.css";

const ExtraFurnitureManager = () => {
  const [companies, setCompanies] = useState([]);
  const [furniture, setFurniture] = useState([]);
  const [selectedFurniture, setSelectedFurniture] = useState([]);

  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [showFurnitureList, setShowFurnitureList] = useState(false);

  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingFurniture, setLoadingFurniture] = useState(true);

  const [currentCompany, setCurrentCompany] = useState("");
  const [state, setState] = useState("");

  const [emailMasterData, setEmailMasterData] = useState([]);
  const [furnitureVendorDetails, setFurnitureVendorDetails] = useState([]);
  const [formData, setFormData] = useState({});

  const [isSendingMail, setIsSendingMail] = useState(false);

  /* ================= FETCH COMPANIES ================= */

  const fetchEmailMessages = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_email_messages.php");
      const json = await res.json();
      console.log("all email data templates", json);

      setEmailMasterData(json.data || []); // ✅ Use json.data, not json
    } catch (err) {
      console.error("Failed to fetch email messages", err);
    }
  };

  const fetchLockedCompanies = async () => {
    setLoadingCompanies(true);

    try {
      const res = await fetch("https://inoptics.in/api/get_exhibitors.php");
      const data = await res.json();

      const uniqueCompanies = Array.from(
        new Map(data.map((i) => [i.company_name, i])).values(),
      );

      const results = await Promise.all(
        uniqueCompanies.map(async (company) => {
          try {
            const r = await fetch(
              `https://inoptics.in/api/get_selected_furniture.php?company_name=${encodeURIComponent(company.company_name)}`,
            );

            const d = await r.json();

            if (d?.is_locked === 1 || d?.lockState?.is_locked === 1) {
              return company;
            }

            return null;
          } catch {
            return null;
          }
        }),
      );

      setCompanies(results.filter(Boolean));
    } catch (err) {
      console.error(err);
    }

    setLoadingCompanies(false);
  };

  /* ================= FETCH FURNITURE ================= */

  const fetchFurniture = async () => {
    setLoadingFurniture(true);

    try {
      const res = await fetch(
        "https://inoptics.in/api/get_furniture_requirement.php",
      );

      const data = await res.json();

      const list = Array.isArray(data)
        ? data
        : data.data || data.furniture || [];

      setFurniture(
        list.map((item) => ({
          id: item.id,
          name: item.furniture_name || item.name,
          image: item.image,
          price: Number(item.price) || 0,
        })),
      );
    } catch (err) {
      console.error(err);
    }

    setLoadingFurniture(false);
  };

  /* ================= EMAIL TEMPLATE ================= */

  /* ================= VENDOR DETAILS ================= */

  const fetchFurnitureVendor = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_furniture_vendor_details.php",
      );

      const data = await res.json();
      console.log("furniture vendor details", data);

      if (data.status === "success") {
        setFurnitureVendorDetails(data.vendors || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FETCH SELECTED ================= */

  const fetchSelectedFurniture = async (company) => {
    try {
      const res = await fetch(
        `https://inoptics.in/api/get_selected_furniture.php?company_name=${encodeURIComponent(company)}`,
      );

      const data = await res.json();

      const list = Array.isArray(data.furniture) ? data.furniture : [];

      setSelectedFurniture(
        list.map((item) => ({
          id: item.id,
          name: item.furniture_name || item.name,
          image: item.image_url || item.image,
          price: Number(item.price),
          quantity: Number(item.quantity),
        })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= ADD ================= */

  const addFurniture = (item) => {
    const exists = selectedFurniture.find((f) => f.id === item.id);

    if (exists) return;

    setSelectedFurniture([...selectedFurniture, { ...item, quantity: 1 }]);
  };

  /* ================= QTY ================= */

  const changeQty = (index, type) => {
    const updated = [...selectedFurniture];

    if (type === "inc") {
      updated[index].quantity += 1;
    } else {
      updated[index].quantity = Math.max(1, updated[index].quantity - 1);
    }

    setSelectedFurniture(updated);
  };

  /* ================= DELETE ================= */

  const deleteFurniture = (index) => {
    setSelectedFurniture(selectedFurniture.filter((_, i) => i !== index));
  };

  /* ================= UPDATE ================= */

  const updateSelectedFurniture = async () => {
    try {
      const payload = {
        company_name: currentCompany,

        furniture: selectedFurniture.map((item) => ({
          image: item.image,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
        })),
      };

      const res = await fetch(
        "https://inoptics.in/api/Update_selected_furniture.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (data.status === "success") {
        alert("Furniture updated");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SEND MAIL ================= */

  const handleSendFurnitureMail = async (emailTemplateName) => {
    if (isSendingMail) return;
    setIsSendingMail(true);

    try {
      /* ================= TEMPLATE FETCH ================= */

      const vendorTemplate = emailMasterData.find(
        (t) => t.email_name === emailTemplateName,
      );

      const exhibitorTemplate = emailMasterData.find(
        (t) =>
          t.email_name ===
          "InOptics 2026 @ Extra Furniture Request Confirmation Exhibitor",
      );

      if (!vendorTemplate || !exhibitorTemplate) {
        alert("Email template not found");
        return;
      }

      /* ================= EXHIBITOR DETAILS ================= */

      const { company_name, name, mobile, email, stall_no } = formData;

      console.log("Exhibitor rishab furnicuture email details:", {
        company_name,
        name,
        mobile,
        email,
        stall_no,
      });
      if (!company_name || !email) {
        alert("Missing exhibitor data");
        return;
      }

      /* ================= VENDOR DETAILS ================= */

      const vendor = furnitureVendorDetails?.[0] || {};

      const vendorName = vendor.vendor_name || "";
      const vendorEmail =
        vendor.email ||
        vendor.vendor_email ||
        vendor.vendorEmail ||
        vendor.contact_email;

      const vendorCompany = vendor.company_name || "";
      const vendorPhone = vendor.contact_number || vendor.mobile || "";

      if (!vendorEmail) {
        alert("Vendor email missing");
        return;
      }

      /* ================= VALIDATE FURNITURE ================= */

      if (!selectedFurniture || selectedFurniture.length === 0) {
        alert("No furniture selected");
        return;
      }

      /* ================= TABLE CALCULATION ================= */

      let totalAmount = 0;
      let totalSGST = 0;
      let totalCGST = 0;
      let grandTotal = 0;

      const rows = selectedFurniture
        .map((item) => {
          const qty = Number(item.quantity);
          const rate = Number(item.price);

          const amount = qty * rate;
          const sgst = amount * 0.09;
          const cgst = amount * 0.09;
          const total = amount + sgst + cgst;

          totalAmount += amount;
          totalSGST += sgst;
          totalCGST += cgst;
          grandTotal += total;

          return `
        <tr>
          <td>${item.name}</td>
          <td align="center">${qty}</td>
          <td align="right">${rate.toFixed(2)}</td>
          <td align="right">${amount.toFixed(2)}</td>
          <td align="right">${sgst.toFixed(2)}</td>
          <td align="right">${cgst.toFixed(2)}</td>
          <td align="right">${total.toFixed(2)}</td>
        </tr>
        `;
        })
        .join("");

      /* ================= FURNITURE TABLE ================= */

      const furnitureTable = `
      <table border="1" cellpadding="6" cellspacing="0"
      style="border-collapse:collapse;width:100%;font-family:Arial;font-size:13px">

      <thead style="background:#f2f2f2">
      <tr>
        <th>Item Name</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Amount</th>
        <th>SGST (9%)</th>
        <th>CGST (9%)</th>
        <th>Total</th>
      </tr>
      </thead>

      <tbody>

      ${rows}

      <tr style="font-weight:bold;background:#fafafa">
        <td colspan="3" align="right">TOTAL</td>
        <td align="right">${totalAmount.toFixed(2)}</td>
        <td align="right">${totalSGST.toFixed(2)}</td>
        <td align="right">${totalCGST.toFixed(2)}</td>
        <td align="right">${grandTotal.toFixed(2)}</td>
      </tr>

      </tbody>

      </table>
    `;

      /* ================= PLACEHOLDER DATA ================= */

      const replaceData = {
        "[Company_Name]": company_name,
        "[Contact_Person_Name]": name,
        "[Mobile_Number]": mobile,
        "[Email_Address]": email,
        "[Stall_No]": stall_no,

        "[Vendor_Name]": vendorName,
        "[Vendor_Company]": vendorCompany,
        "[Vendor_Email]": vendorEmail,
        "[Vendor_Phone]": vendorPhone,

        "[Furniture_Table]": furnitureTable,

        "[Exhibitor_Name]": name,
        "[Phone_Number]": mobile,
      };

      /* ================= TEMPLATE REPLACEMENT ================= */

      const replaceTemplate = (template) => {
        let html = template;

        Object.keys(replaceData).forEach((key) => {
          html = html.replaceAll(key, replaceData[key]);
        });

        return html.replace(/&n/g, "<br>");
      };

      const vendorHTML = replaceTemplate(vendorTemplate.content);
      const exhibitorHTML = replaceTemplate(exhibitorTemplate.content);

      /* ================= SEND VENDOR MAIL ================= */

      const vendorRes = await fetch(
        "https://inoptics.in/api/send_furniture_vendor_mail.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_name: emailTemplateName,
            to: vendorEmail,
            html: vendorHTML,
          }),
        },
      );

      const vendorResult = await vendorRes.json();

      if (!vendorResult.message?.includes("successfully")) {
        alert("Vendor mail failed");
        return;
      }

      /* ================= SEND EXHIBITOR MAIL ================= */

      const exhibitorRes = await fetch(
        "https://inoptics.in/api/send_furniture_vendor_mail.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_name:
              "InOptics 2026 @ Extra Furniture Request Confirmation Exhibitor",
            to: email,
            html: exhibitorHTML,
          }),
        },
      );

      const exhibitorResult = await exhibitorRes.json();

      if (exhibitorResult.message?.includes("successfully")) {
        alert("✅ Mail sent successfully!");
      } else {
        alert("Vendor mail sent but exhibitor mail failed.");
      }
    } catch (error) {
      console.error("Mail error:", error);
      alert("Error sending mail");
    } finally {
      setIsSendingMail(false);
    }
  };

  /* ================= ACCORDION ================= */

  const toggleAccordion = (index, company) => {
    if (openIndex === index) {
      setOpenIndex(null);
      return;
    }

    setOpenIndex(index);
    setCurrentCompany(company.company_name);
    setState(company.state);

    setFormData({
      company_name: company.company_name,
      name: company.name,
      email: company.email,
      mobile: company.mobile,
      stall_no: company.stall_no,
    });

    fetchSelectedFurniture(company.company_name);
  };

  /* ================= INIT ================= */

useEffect(() => {
  const loadAllData = async () => {
    try {
      await Promise.all([
        fetchLockedCompanies(),
        fetchFurniture(),
        fetchEmailMessages(),
        fetchFurnitureVendor()
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  loadAllData();
}, []);

  const filteredCompanies = companies.filter((c) =>
    (c.company_name || "").toLowerCase().includes(search.toLowerCase()),
  );

  /* ================= UI ================= */

  return (
    <div className="accordion-container">
      <div className="company-search">
        <input
          placeholder="Search company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loadingCompanies && <div className="loader-box">
        <div className="loader"></div>
        
        <h5>Loading...</h5>
        
        </div>}

      {filteredCompanies.map((company, index) => (
        <div key={company.company_name} className="accordion-item">
          <div
            className="accordion-header"
            onClick={() => toggleAccordion(index, company)}
          >
            <span>{company.company_name}</span>

            <span>{openIndex === index ? "▲" : "▼"}</span>
          </div>

          {openIndex === index && (
            <div className="accordion-body">
              <div className="furniture-action-bar">
                <button
                  className="add-btn"
                  onClick={() => setShowFurnitureList(true)}
                >
                  Add Furniture
                </button>

                <button
                  className="add-btn update-button"
                  onClick={updateSelectedFurniture}
                >
                  Update Furniture
                </button>

                <button
                  className="add-btn email-button"
                  onClick={() =>
                    handleSendFurnitureMail(
                      "InOptics 2026 @ Extra Furniture Request Confirmation",
                    )
                  }
                  disabled={isSendingMail}
                >
                  {isSendingMail ? "Sending..." : "Send Mail"}
                </button>
              </div>

              <table className="furniture-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>CGST (9%)</th>
                    <th>SGST (9%)</th>
                    <th>IGST (18%)</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedFurniture.map((item, index) => {
                    const qty = Number(item.quantity);
                    const price = Number(item.price);

                    const amount = price * qty;

                    const isDelhi = state?.toLowerCase() === "delhi";

                    const cgst = isDelhi ? amount * 0.09 : 0;
                    const sgst = isDelhi ? amount * 0.09 : 0;
                    const igst = !isDelhi ? amount * 0.18 : 0;

                    const total = amount + cgst + sgst + igst;

                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>

                        <td>{item.name}</td>

                        <td>₹{price.toFixed(2)}</td>

                        <td className="qty-box">
                          <button onClick={() => changeQty(index, "dec")}>
                            <FaMinus />
                          </button>

                          {qty}

                          <button onClick={() => changeQty(index, "inc")}>
                            <FaPlus />
                          </button>
                        </td>

                        <td>₹{amount.toFixed(2)}</td>

                        <td>{cgst ? `₹${cgst.toFixed(2)}` : "-"}</td>

                        <td>{sgst ? `₹${sgst.toFixed(2)}` : "-"}</td>

                        <td>{igst ? `₹${igst.toFixed(2)}` : "-"}</td>

                        <td>₹{total.toFixed(2)}</td>

                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => deleteFurniture(index)}
                          >
                            <FaTrash />
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
      ))}

      {showFurnitureList && (
        <div className="exfurn-modal-overlay">
          <div className="exfurn-modal-box">
            <div className="exfurn-modal-header">
              <h2>Furniture List</h2>

              <button
                className="exfurn-modal-close"
                onClick={() => setShowFurnitureList(false)}
              >
                ×
              </button>
            </div>

            <div className="exfurn-modal-body">
              <div className="exfurn-grid">
                {furniture.map((item) => (
                  <div key={item.id} className="exfurn-card">
                    <img
                      src={`https://inoptics.in/api/uploads/${item.image}`}
                      alt=""
                    />

                    <h4>{item.name}</h4>

                    <p>₹{item.price}</p>

                    <button
                      className="exfurn-select-btn"
                      onClick={() => addFurniture(item)}
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtraFurnitureManager;
