import React, { useEffect, useState } from "react";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";
import "./ExtraFurnitureManager.css";
import toast from "react-hot-toast";

const ExtraFurnitureManager = ({ exhibitorData }) => {
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

  // Cache: company_name -> selected furniture array (pre-fetched)
  const [furnitureCache, setFurnitureCache] = useState({});

  // Cache: company_name -> exhibitor details (name, email, mobile, stall_no, state)
  const [exhibitorMap, setExhibitorMap] = useState({});
  const [showExhibitorList, setShowExhibitorList] = useState(false);
  const [exhibitorSearch, setExhibitorSearch] = useState("");
  const [selectedNewExhibitor, setSelectedNewExhibitor] = useState(null);

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
      // Step 1: Get unique company names that have selected furniture
      const res = await fetch(
        "https://inoptics.in/api/get_all_selected_furniture_by_exhibitor.php",
      );
      const data = await res.json();

      console.log("📋 get_all_selected_furniture_by_exhibitor RAW:", data);

      const allEntries = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
          ? data.data
          : [];

      if (allEntries.length === 0) {
        console.warn("⚠️ No companies found from API");
        setCompanies([]);
        setLoadingCompanies(false);
        return;
      }

      // Unique company names
      const uniqueCompanyNames = [
        ...new Set(allEntries.map((item) => item.company_name).filter(Boolean)),
      ];

      console.log("🏢 Unique companies count:", uniqueCompanyNames.length);

      // Step 2: Fetch furniture + exhibitor details for each company IN PARALLEL
      const results = await Promise.all(
        uniqueCompanyNames.map(async (companyName) => {
          try {
            const r = await fetch(
              `https://inoptics.in/api/get_selected_furniture.php?company_name=${encodeURIComponent(companyName)}`,
            );
            const d = await r.json();

            const furnitureList = Array.isArray(d.furniture) ? d.furniture : [];
            if (furnitureList.length === 0) return null;

            const parsedFurniture = furnitureList.map((item) => ({
              id: item.id,
              name: item.furniture_name || item.name,
              image: item.image_url || item.image,
              price: Number(item.price),
              quantity: Number(item.quantity),
            }));

            // Exhibitor details — check multiple possible locations in response
            const exhibitor =
              d.exhibitor || d.company || d.exhibitor_details || {};
            const firstFurItem = furnitureList[0] || {};

            // Match from allEntries too (company list API might have email/mobile)
            const fromList =
              allEntries.find((e) => e.company_name === companyName) || {};

            return {
              company: {
                company_name: companyName,
                name:
                  exhibitor.name ||
                  exhibitor.contact_person ||
                  d.name ||
                  fromList.name ||
                  fromList.contact_person ||
                  firstFurItem.contact_person ||
                  "",
                email:
                  exhibitor.email ||
                  d.email ||
                  fromList.email ||
                  firstFurItem.email ||
                  "",
                mobile:
                  exhibitor.mobile ||
                  exhibitor.phone ||
                  d.mobile ||
                  fromList.mobile ||
                  fromList.phone ||
                  firstFurItem.mobile ||
                  "",
                stall_no:
                  exhibitor.stall_no ||
                  d.stall_no ||
                  fromList.stall_no ||
                  firstFurItem.stall_no ||
                  "",
                state:
                  exhibitor.state ||
                  d.state ||
                  fromList.state ||
                  firstFurItem.state ||
                  "",
              },
              furniture: parsedFurniture,
            };
          } catch (err) {
            console.error(`❌ Failed for ${companyName}:`, err);
            return null;
          }
        }),
      );

      const cache = {};
      const companiesList = [];

      results.filter(Boolean).forEach(({ company, furniture }) => {
        cache[company.company_name] = furniture;
        companiesList.push(company);
      });

      console.log(
        "✅ Final companies with furniture:",
        companiesList.length,
        companiesList,
      );

      setFurnitureCache(cache);
      setCompanies(companiesList);
    } catch (err) {
      console.error("❌ fetchLockedCompanies error:", err);
    }

    setLoadingCompanies(false);
  };

  /* ================= FETCH EXHIBITORS ================= */

  const fetchExhibitors = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_exhibitors.php");
      const data = await res.json();

      const map = {};
      const list = Array.isArray(data) ? data : [];

      list.forEach((item) => {
        if (!item.company_name) return;

        const key = item.company_name
          ?.replace(/\s+/g, " ")
          .trim()
          .toLowerCase();

        if (!map[key]) {
          map[key] = {
            name: item.name || item.contact_person || "",
            email: item.email || "",
            mobile: item.mobile || item.phone || "",
            stall_no: item.stall_no || item.stall_number || "",
            state: item.state || "",
          };
        }
      });

      setExhibitorMap(map);

      console.log(
        "✅ Exhibitor map loaded:",
        Object.keys(map).length,
        "companies",
      );
    } catch (err) {
      console.error("❌ fetchExhibitors error:", err);
    }
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
    // ✅ Use cache if available — instant load, no API call needed
    if (furnitureCache[company]) {
      setSelectedFurniture(furnitureCache[company]);
      return;
    }

    try {
      const res = await fetch(
        `https://inoptics.in/api/get_selected_furniture.php?company_name=${encodeURIComponent(company)}`,
      );

      const data = await res.json();

      const list = Array.isArray(data.furniture) ? data.furniture : [];

      const parsedFurniture = list.map((item) => ({
        id: item.id,
        name: item.furniture_name || item.name,
        image: item.image_url || item.image,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));

      // Save to cache
      setFurnitureCache((prev) => ({
        ...prev,
        [company]: parsedFurniture,
      }));

      setSelectedFurniture(parsedFurniture);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= ADD ================= */

  const addFurniture = (item) => {
    const exists = selectedFurniture.find((f) => f.name === item.name);

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
          price: Number(item.price),
          quantity: Number(item.quantity),
          total: Number(item.price) * Number(item.quantity),
        })),
      };

      // check if furniture already exists for this company
      const hasExistingFurniture = furnitureCache[currentCompany]?.length > 0;

      const apiUrl = hasExistingFurniture
        ? "https://inoptics.in/api/Update_selected_furniture.php"
        : "https://inoptics.in/api/add_selected_furniture.php";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "success") {
        setFurnitureCache((prev) => ({
          ...prev,
          [currentCompany]: [...selectedFurniture],
        }));

        toast.success("Furniture saved successfully");

        // ✅ modal close
        setShowFurnitureList(false);

        // ✅ refresh list
        await fetchLockedCompanies();

        // ✅ auto open accordion
        const index = companies.findIndex(
          (c) => c.company_name === currentCompany,
        );

        if (index !== -1) {
          setOpenIndex(index);
        }
      } else {
        toast.error(data.message || "Failed to save furniture");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };
  /* ================= SEND MAIL ================= */

  const handleSendFurnitureMail = async (emailTemplateName) => {
    const sendMail = async () => {
      const vendorTemplate = emailMasterData.find(
        (t) => t.email_name === emailTemplateName,
      );

      const exhibitorTemplate = emailMasterData.find(
        (t) =>
          t.email_name ===
          "InOptics 2026 @ Extra Furniture Request Confirmation Exhibitor",
      );

      if (!vendorTemplate || !exhibitorTemplate) {
        throw new Error("Email template not found");
      }

      const { company_name, name, mobile, email, stall_no } = formData;

      if (!company_name || !email) {
        throw new Error("Missing exhibitor data");
      }

      const vendor = furnitureVendorDetails?.[0] || {};

      const vendorEmail =
        vendor.email ||
        vendor.vendor_email ||
        vendor.vendorEmail ||
        vendor.contact_email;

      if (!vendorEmail) {
        throw new Error("Vendor email missing");
      }

      if (!selectedFurniture || selectedFurniture.length === 0) {
        throw new Error("No furniture selected");
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
        </tr>`;
        })
        .join("");

      const furnitureTable = `
      <table border="1" cellpadding="6" cellspacing="0"
      style="border-collapse:collapse;width:100%">
      <tbody>${rows}</tbody></table>
    `;

      const replaceTemplate = (template) => {
        let html = template;

        const replaceData = {
          "[Company_Name]": company_name,
          "[Contact_Person_Name]": name,
          "[Mobile_Number]": mobile,
          "[Email_Address]": email,
          "[Stall_No]": stall_no,
          "[Furniture_Table]": furnitureTable,
        };

        Object.keys(replaceData).forEach((key) => {
          html = html.replaceAll(key, replaceData[key]);
        });

        return html.replace(/&n/g, "<br>");
      };

      const vendorHTML = replaceTemplate(vendorTemplate.content);
      const exhibitorHTML = replaceTemplate(exhibitorTemplate.content);

      /* ===== Vendor mail ===== */

      await fetch("https://inoptics.in/api/send_furniture_vendor_mail.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_name: emailTemplateName,
          to: vendorEmail,
          html: vendorHTML,
        }),
      });

      /* ===== Exhibitor mail ===== */

      await fetch("https://inoptics.in/api/send_furniture_vendor_mail.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_name:
            "InOptics 2026 @ Extra Furniture Request Confirmation Exhibitor",
          to: email,
          html: exhibitorHTML,
        }),
      });
    };

    toast.promise(sendMail(), {
      loading: "Sending email...",
      success: "Mail sent successfully",
      error: (err) => err.message || "Failed to send email",
    });
  };

  /* ================= ACCORDION ================= */

  const toggleAccordion = (index, company) => {
    if (openIndex === index) {
      setOpenIndex(null);
      return;
    }

    setOpenIndex(index);
    setCurrentCompany(company.company_name);

    // ✅ Get exhibitor details from exhibitorMap (fetched from get_exhibitors.php)
    const key = company.company_name?.replace(/\s+/g, " ").trim().toLowerCase();

    const exhibitor = exhibitorMap[key] || {};

    setState(exhibitor.state || company.state || "");

    setFormData({
      company_name: company.company_name,
      name: exhibitor.name || company.name || "",
      email: exhibitor.email || company.email || "",
      mobile: exhibitor.mobile || company.mobile || "",
      stall_no: exhibitor.stall_no || company.stall_no || "",
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
          fetchFurnitureVendor(),
          fetchExhibitors(),
        ]);
      } catch (err) {
        console.error(err);
      }
    };

    loadAllData();
  }, []);

  /* ================= EXPORT FURNITURE ================= */

  const exportFurnitureExcel = () => {
    if (!companies.length) {
      toast.error("No data to export");
      return;
    }

    const exportData = [];

    companies.forEach((company) => {
      const companyName = company.company_name;
      const furnitureList = furnitureCache[companyName] || [];

      const exhibitor = exhibitorMap[companyName] || {};
      const stateValue = (exhibitor.state || "").toLowerCase();

      furnitureList.forEach((item, index) => {
        const qty = Number(item.quantity);
        const price = Number(item.price);

        const amount = qty * price;

        let cgst = 0;
        let sgst = 0;
        let igst = 0;

        if (stateValue === "delhi") {
          cgst = amount * 0.09;
          sgst = amount * 0.09;
        } else {
          igst = amount * 0.18;
        }

        const total = amount + cgst + sgst + igst;

        exportData.push({
          "Company Name": companyName,
          "Contact Person": exhibitor.name || "",
          Email: exhibitor.email || "",
          Mobile: exhibitor.mobile || "",
          "Stall No": exhibitor.stall_no || "",
          State: exhibitor.state || "",
          "Furniture Name": item.name,
          Price: price,
          Quantity: qty,
          Amount: amount,
          "CGST (9%)": cgst,
          "SGST (9%)": sgst,
          "IGST (18%)": igst,
          Total: total,
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Extra Furniture");

    XLSX.writeFile(workbook, "Extra_Furniture_Report.xlsx");
  };

  const filteredCompanies = companies.filter((c) =>
    (c.company_name || "").toLowerCase().includes(search.toLowerCase()),
  );

  /* ================= UI ================= */

  return (
    <div className="accordion-container">
      <div className="furniture-company-search">
        <button className="furniture-export-btn" onClick={exportFurnitureExcel}>
          Export Excel
        </button>

        <button
          className="new-furniture-add-btn"
          onClick={() => setShowExhibitorList(true)}
        >
          Add New Exhibitor Furniture
        </button>
        <input
          placeholder="Search company..."
          value={search}
          className="furniture-name-search"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loadingCompanies && (
        <div className="loader-box">
          <div className="loader"></div>

          <h5>Loading...</h5>
        </div>
      )}

      {filteredCompanies.map((company, index) => (
        <div key={company.company_name} className="accordion-item">
          <div
            className="accordion-header"
            onClick={() => toggleAccordion(index, company)}
          >
            <span>
              {company.company_name}{" "}
              <span
                style={{
                  background: "red",
                  color: "#fff",
                  padding: "3px 8px",
                  marginLeft: "10px",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                Stall No:{" "}
                {exhibitorMap[
                  company.company_name
                    ?.replace(/\s+/g, " ")
                    .trim()
                    .toLowerCase()
                ]?.stall_no || "N/A"}
              </span>
            </span>

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
                    <th>Stall No.</th>
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
                        <td>{formData.stall_no || "-"}</td>

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
        <div
          className="exfurn-overlay"
          onClick={() => setShowFurnitureList(false)}
        >
          <div className="exfurn-modal" onClick={(e) => e.stopPropagation()}>
            {/* HEADER */}
            <div className="exfurn-header">
              <div className="exfurn-header-left">
                <span className="exfurn-header-icon"></span>
                <div>
                  <h2 className="exfurn-title">Furniture Catalog</h2>
                  <p className="exfurn-subtitle">
                    {furniture.length} items available
                  </p>
                </div>
              </div>
              <button
                className="exfurn-close"
                onClick={() => setShowFurnitureList(false)}
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="exfurn-body">
              {loadingFurniture ? (
                <div className="exfurn-loading">
                  <div className="exfurn-spinner" />
                  <p>Loading furniture...</p>
                </div>
              ) : (
                <div className="exfurn-grid">
                  {furniture.map((item) => {
                    const alreadyAdded = selectedFurniture.some(
                      (f) => f.id === item.id,
                    );
                    return (
                      <div
                        key={item.id}
                        className={`exfurn-card${alreadyAdded ? " exfurn-card--added" : ""}`}
                      >
                        {/* IMAGE */}
                        <div className="exfurn-img-wrap">
                          <img
                            src={`https://inoptics.in/api/uploads/${item.image}`}
                            alt={item.name}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                          <div
                            className="exfurn-img-fallback"
                            style={{ display: "none" }}
                          >
                            🪑
                          </div>
                          {alreadyAdded && (
                            <div className="exfurn-badge">✓ Added</div>
                          )}
                        </div>

                        {/* INFO */}
                        <div className="exfurn-info">
                          <p className="exfurn-name">{item.name}</p>
                          <p className="exfurn-price">
                            ₹{Number(item.price).toLocaleString("en-IN")}
                          </p>
                        </div>

                        {/* BUTTON */}
                        <button
                          className={`exfurn-btn${alreadyAdded ? " exfurn-btn--added" : ""}`}
                          onClick={() => !alreadyAdded && addFurniture(item)}
                          disabled={alreadyAdded}
                        >
                          {alreadyAdded ? "✓ Added" : "+ Add to List"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="exfurn-footer">
              <button
                className="exfurn-save-btn"
                onClick={updateSelectedFurniture}
              >
                Save Furniture
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
                    ?.toLowerCase()
                    .includes(exhibitorSearch.toLowerCase()),
                )
                .map((ex, i) => (
                  <div key={i} className="exhibitor-row">
                    <span>{ex.company_name}</span>

                    <button
                      className="select-btn"
                      onClick={() => {
                        setShowExhibitorList(false);

                        // ✅ selected exhibitor set
                        setSelectedNewExhibitor(ex);

                        // ✅ set current company
                        setCurrentCompany(ex.company_name);

                        // ✅ set form data (IMPORTANT)
                        setFormData({
                          company_name: ex.company_name,
                          name: ex.name || "",
                          email: ex.email || "",
                          mobile: ex.mobile || "",
                          stall_no: ex.stall_no || "",
                        });

                        // ✅ set state
                        setState(ex.state || "");

                        // ✅ reset furniture
                        setSelectedFurniture([]);

                        // ✅ open furniture modal
                        setShowFurnitureList(true);
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
    </div>
  );
};

export default ExtraFurnitureManager;
