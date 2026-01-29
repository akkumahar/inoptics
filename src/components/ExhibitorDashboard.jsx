import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTachometerAlt,
  FaUser,
  FaWpforms,
  FaClipboardList,
  FaHardHat,
  FaBullhorn,
  FaMoneyBill,
  FaSignOutAlt,
  FaEnvelope,
  FaEye,
  FaDownload,
  FaUpload,
  FaLockOpen,
  FaCloudUploadAlt,
} from "react-icons/fa";
import "./ExhibitorDashboard.css";
import ExhibitorBadgeForm from "./ExhibitorBadgeForm";
import ExhibitorPowerForm from "./ExhibitorDashboardComponent/ExhibitorPowerForm";
import ExhibitorDashboardOverview from "./ExhibitorDashboardComponent/ExhibitorDashboardOverview";

const ExhibitorDashboard = () => {
  const navigate = useNavigate();
  const [uploadedSteps, setUploadedSteps] = useState({
    step1: false,
    step2: false,
    step3: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    step1: null,
    step2: null,
    step3: null,
  });
  const [boothDesignStatus, setBoothDesignStatus] = useState("pending");
  const [boothDesignName, setBoothDesignName] = useState("");

  const [selectedPreviewStep, setSelectedPreviewStep] = useState("step1");
  const [powerFormStep, setPowerFormStep] = useState(0);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showBoothDesignPreview, setShowBoothDesignPreview] = useState(false);
  const [exhibitorData, setExhibitorData] = useState(null);
  const [showDeclaration, setShowDeclaration] = useState(false);
  const [declarationUndertakingData, setDeclarationUndertakingData] = useState(
    [],
  );
  const [contractorFormSubmitted, setContractorFormSubmitted] = useState(false);

  const [agreed, setAgreed] = useState(false);

  const [boothDesignPreview, setBoothDesignPreview] = useState(null);

  // 🔹 New states
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [importantPage, setImportantPage] = useState("");

  // 🔹 Mail states
  const [mailsList, setMailsList] = useState([]);
  const [loadingMails, setLoadingMails] = useState(false);
  const [selectedMail, setSelectedMail] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [instructionsList, setInstructionsList] = useState([]);
  const [rulesList, setRulesList] = useState([]);
  const [exhibitionData, setExhibitionData] = useState([]);
  const [guidelinesList, setGuidelinesList] = useState([]);
  const [exhibitors, setExhibitors] = useState([]);
  const [stallList, setStallList] = useState([]);
  const [eventScheduleData, setEventScheduleData] = useState([]);
  const [latestNewsData, setLatestNewsData] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [furnitureList, setFurnitureList] = useState([]);
  const [powerList, setPowerList] = useState([]);
  const [badgeList, setBadgeList] = useState([]);

  const [furnitureVendorDetails, setFurnitureVendorDetails] = useState([]);
  const [isFurnitureSaved, setIsFurnitureSaved] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [emailMasterData, setEmailMasterData] = useState([]);
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    contact_number: "",
  });

  const [coreFormData, setCoreFormData] = useState([]);
  const [selectedPreview, setSelectedPreview] = useState(null);

  const [exhibitor, setExhibitor] = useState({});

  const [showFurnitureList, setShowFurnitureList] = useState(false);

  const [furnitureData, setFurnitureData] = useState([]);
  const [selectedFurniture, setSelectedFurniture] = useState([]);
  const [furnitureBilling, setFurnitureBilling] = useState({
    amount: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    grandTotal: 0,
  });

  // shorthand for first exhibitor
  const currentExhibitor = exhibitors[0];

  // update quantity of a selected item
  const handleQuantityChange = (index, value) => {
    const updated = [...selectedFurniture];
    updated[index].quantity = parseInt(value) || 1;
    setSelectedFurniture(updated);
  };

  // recalc billing whenever selection or exhibitor changes
  useEffect(() => {
    if (selectedFurniture.length === 0) {
      setFurnitureBilling({
        amount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        grandTotal: 0,
      });
      return;
    }

    const amount = selectedFurniture.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0,
    );

    let cgst = 0,
      sgst = 0,
      igst = 0;

    if (currentExhibitor?.state?.toLowerCase() === "delhi") {
      cgst = (amount * 9) / 100;
      sgst = (amount * 9) / 100;
    } else {
      igst = (amount * 18) / 100;
    }

    const grandTotal = amount + cgst + sgst + igst;

    setFurnitureBilling({
      amount,
      cgst,
      sgst,
      igst,
      grandTotal,
    });
  }, [selectedFurniture, currentExhibitor]);

  // fetch saved furniture for a company
  const fetchSelectedFurniture = async (companyName) => {
    try {
      const response = await fetch(
        `https://inoptics.in/api/get_selected_furniture.php?company_name=${encodeURIComponent(
          companyName,
        )}`,
      );
      const data = await response.json();

      // ✅ Handle new backend response structure:
      // data = { furniture: [...], lockState: { is_locked, unlock_requested } }
      const furnitureList = Array.isArray(data.furniture)
        ? data.furniture
        : data;

      const normalizedData = furnitureList.map((item) => ({
        ...item,
        id: item.id || Math.random(), // ensure unique key if id missing
        name: item.furniture_name || item.name || "Unnamed",
        image: item.image_url || item.image || "",
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
      }));

      setSelectedFurniture(normalizedData);

      // ✅ Use the lock state from backend
      if (data.lockState && typeof data.lockState.is_locked !== "undefined") {
        setIsFurnitureSaved(data.lockState.is_locked === 1);
      } else {
        // fallback for old API format
        setIsFurnitureSaved(normalizedData.length > 0);
      }
    } catch (error) {
      console.error("Error fetching selected furniture:", error);
    }
  };

  // save furniture to backend
  const updateSelectedFurniture = async (companyName, selectedFurniture) => {
    try {
      const payload = {
        company_name: companyName,
        furniture: selectedFurniture.map((item) => ({
          image: item.image,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity || 0,
        })),
      };

      const response = await fetch(
        "https://inoptics.in/api/Update_selected_furniture.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        alert("Furniture saved successfully!");
        fetchSelectedFurniture(companyName); // refresh table after save
      } else {
        alert("Failed to save furniture: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving furniture:", error);
      alert("Error saving furniture. Please try again later.");
    }
  };

  useEffect(() => {
    if (currentExhibitor?.company_name) {
      fetchSelectedFurniture(currentExhibitor.company_name);
    }
  }, [currentExhibitor]);

  const [activities, setActivities] = useState([
    { id: 1, name: "UNDERTAKING AGREED", done: false },
    { id: 3, name: "APPOINTED CONTRACTOR & BADGES", done: false },
    { id: 4, name: "CONTRACTOR UNDERTAKING & REGISTRATION", done: false },
    { id: 5, name: "CONTRACTOR REGISTRATION", done: false },
    { id: 6, name: "POWER REQUIREMENT", done: false },
    { id: 7, name: "EXTRA EXHIBITOR BADGE", done: false },
    { id: 8, name: "APPOINTED CONTRACTOR", done: false },
    { id: 9, name: "BRANDS", done: false },
  ]);

  const menus = [
    { name: "Dashboard", icon: <FaTachometerAlt /> },
    { name: "Profile", icon: <FaUser /> },
    { name: "Mails Inbox", icon: <FaEnvelope /> },
    { name: "Additional Requirements", icon: <FaClipboardList /> },
    { name: "Contractors", icon: <FaHardHat /> },
    { name: "Exhibitor Badges", icon: <FaHardHat /> },
    { name: "Payment", icon: <FaMoneyBill /> },
  ];

  // ✅ Load login data
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isExhibitorLoggedIn");

    if (!isLoggedIn) {
      navigate("/exhibitor-login");
    } else {
      const data = localStorage.getItem("exhibitorInfo");
      if (data && data !== "undefined" && data !== "null") {
        try {
          const parsedData = JSON.parse(data);
          setExhibitorData(parsedData);

          // 🔹 Check undertaking status
          fetch(
            `https://inoptics.in/api/get_undertaking_status.php?company_name=${encodeURIComponent(
              parsedData.company_name,
            )}`,
          )
            .then((res) => res.json())
            .then((statusData) => {
              if (!statusData.undertaking_accepted) {
                setShowDeclaration(true);

                // 🔹 Fetch declaration + undertaking points from backend
                fetch(
                  "https://inoptics.in/api/get_exhibitor_declaration_undertaking.php",
                )
                  .then((res) => res.json())
                  .then((declData) => {
                    if (Array.isArray(declData)) {
                      setDeclarationUndertakingData(declData);
                    }
                  })
                  .catch((err) =>
                    console.error("Error fetching declaration:", err),
                  );
              } else {
                // ✅ Mark activity as done if already accepted
                setActivities((prev) =>
                  prev.map((act) =>
                    act.name === "UNDERTAKING AGREED"
                      ? { ...act, done: true }
                      : act,
                  ),
                );
              }
            })
            .catch((err) =>
              console.error("Error fetching undertaking status:", err),
            );
        } catch (err) {
          console.error("Invalid JSON in exhibitorInfo:", err);
        }
      }
    }
  }, [navigate]);

  // ✅ Accept undertaking
  const handleAgree = async () => {
    if (!exhibitorData?.company_name) return;

    try {
      const res = await fetch(
        "https://inoptics.in/api/accept_undertaking.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company_name: exhibitorData.company_name }),
        },
      );

      const result = await res.json();
      if (result.success) {
        setShowDeclaration(false);

        // ✅ Update activities instantly after agreement
        setActivities((prev) =>
          prev.map((act) =>
            act.name === "UNDERTAKING AGREED" ? { ...act, done: true } : act,
          ),
        );
      } else {
        console.error("Failed to accept undertaking:", result.message);
      }
    } catch (err) {
      console.error("Error accepting undertaking:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isExhibitorLoggedIn");
    localStorage.removeItem("exhibitorInfo");
    navigate("/exhibitor-login");
  };

  const handleImportantClick = (page) => {
    setImportantPage(page);
    setActiveMenu("");
  };

  // poll unread mails count for sidebar badge
  useEffect(() => {
    if (!currentExhibitor?.company_name) return;

    let cancelled = false;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch(
          `https://inoptics.in/api/get_exhibitor_mails.php?company_name=${encodeURIComponent(
            currentExhibitor.company_name,
          )}`,
        );
        const data = await res.json();
        if (!cancelled && data?.success && Array.isArray(data.mails)) {
          const unread = data.mails.filter(
            (m) => Number(m.is_read) === 0,
          ).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Error fetching unread count:", err);
        if (!cancelled) setUnreadCount((c) => c); // keep existing value
      }
    };

    // initial fetch immediately
    fetchUnreadCount();

    // poll every 15 seconds (adjust if you want)
    const interval = setInterval(fetchUnreadCount, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [currentExhibitor?.company_name]);

  const handleMailClick = async (mail) => {
    setSelectedMail(mail);

    // if already read, nothing to do (still display)
    if (Number(mail.is_read) === 0) {
      try {
        const res = await fetch("https://inoptics.in/api/mark_mail_read.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mail_id: mail.id }),
        });
        const result = await res.json();
        console.log("Mark read result:", result);

        if (result.success) {
          // update local list immediately
          setMailsList((prev) =>
            prev.map((m) => (m.id === mail.id ? { ...m, is_read: 1 } : m)),
          );

          // decrement unread counter
          setUnreadCount((prev) => Math.max(prev - 1, 0));

          // optional: re-fetch inbox to ensure full sync (uncomment if needed)
          // handleMenuClick("Mails Inbox");
        } else {
          console.warn("mark_mail_read reported failure:", result);
        }
      } catch (err) {
        console.error("Error marking mail read:", err);
      }
    }
  };

  // ✅ Fetch instructions on page load
  useEffect(() => {
    fetchExhibitorInstructions();
  }, []);

  // ✅ Fetch instructions
  const fetchExhibitorInstructions = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_exhibitor_instructions.php",
      );
      const data = await res.json();
      setInstructionsList(data || []);
    } catch (err) {
      console.error("Failed to fetch instructions", err);
    }
  };

  useEffect(() => {
    fetchExhibitorRules();
  }, []);

  const fetchExhibitorRules = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_exhibitor_rules.php",
      );
      const data = await res.json();
      setRulesList(data || []);
    } catch (err) {
      console.error("Failed to fetch rules", err);
    }
  };

  const fetchExhibitionData = async () => {
    try {
      const response = await fetch(
        "https://inoptics.in/api/get_exhibition_map.php",
      );
      const text = await response.text();
      const data = JSON.parse(text);
      setExhibitionData(data);
    } catch (error) {
      console.error("Error fetching exhibition data", error);
    }
  };

  useEffect(() => {
    fetchExhibitionData();
  }, []);

  useEffect(() => {
    fetchExhibitorGuidelines();
  }, []);

  const fetchExhibitorGuidelines = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_exhibitor_guidelines.php",
      );
      const data = await res.json();
      setGuidelinesList(data || []);
    } catch (err) {
      console.error("Failed to fetch guidelines", err);
    }
  };

  useEffect(() => {
    if (exhibitorData?.email) {
      fetchExhibitorData(exhibitorData.email);
    }
  }, [exhibitorData]);

  const fetchExhibitorData = async (email) => {
    try {
      const res = await fetch("https://inoptics.in/api/get_exhibitors.php");
      const data = await res.json();

      if (Array.isArray(data)) {
        const matched = data.find((ex) => ex.email === email);
        if (matched) {
          setExhibitors([matched]);

          // 🔹 Fetch stall data using company name
          if (matched.company_name) {
            fetchStallsByCompany(matched.company_name);
          }
        } else {
          setExhibitors([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch exhibitors:", error);
    }
  };

  const fetchStallsByCompany = async (companyName) => {
    try {
      const response = await fetch("https://inoptics.in/api/get_stalls.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName }),
      });

      if (response.ok) {
        const data = await response.json();
        setStallList(Array.isArray(data) ? data : [data]); // ensure array
      } else {
        console.error("Failed to fetch stall data");
      }
    } catch (error) {
      console.error("Error fetching stall data:", error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCollapsed(true); // mobile → close
      } else {
        setCollapsed(false); // desktop → open
      }
    };

    handleResize(); // page load par bhi run hoga

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    setImportantPage(""); // close any important page

    if (menu === "Additional Requirements") {
      setImportantPage("Furniture Requirements");
      return;
    }

    // 👇 mobile me click ke baad menu band
    if (window.innerWidth <= 768) {
      setCollapsed(true);
    }

    if (menu === "Mails Inbox" && currentExhibitor) {
      // open Mails Inbox and fetch full list (most recent first)
      setLoadingMails(true);
      fetch(
        `https://inoptics.in/api/get_exhibitor_mails.php?company_name=${encodeURIComponent(
          currentExhibitor.company_name,
        )}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.mails)) {
            setMailsList(data.mails);
            // keep unreadCount in sync
            const unread = data.mails.filter(
              (m) => Number(m.is_read) === 0,
            ).length;
            setUnreadCount(unread);
          } else {
            setMailsList([]);
            setUnreadCount(0);
          }
        })
        .catch((err) => {
          console.error("Error fetching mails on open:", err);
          setMailsList([]);
          setUnreadCount(0);
        })
        .finally(() => setLoadingMails(false));
    }
  };

  useEffect(() => {
    fetchEventSchedule();
  }, []);

  const fetchEventSchedule = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_exhibitor_event_schedule.php",
      );
      const data = await res.json();

      // Check if data is wrapped in "data" field
      const scheduleArray = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
          ? data.data
          : [];

      if (scheduleArray.length > 0) {
        setEventScheduleData(scheduleArray);
      } else {
        setEventScheduleData([]);
      }
    } catch (err) {
      console.error("Failed to fetch event schedule", err);
      setEventScheduleData([]);
    }
  };

  const fetchLatestNews = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_latest_news.php");
      const data = await res.json();

      setLatestNewsData(data);
    } catch (err) {
      console.error("Failed to fetch latest news", err);
    }
  };

  useEffect(() => {
    fetchLatestNews();
  }, []);

  // 🟢 Load Power Data when company_name available
  useEffect(() => {
    if (exhibitorData?.company_name) {
      fetchStallsByCompany(exhibitorData.company_name);
      fetchPowerBilling(exhibitorData.company_name);
    }
  }, [exhibitorData]);

  // Fetch forms from backend
  const fetchCoreForms = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_core_forms.php");
      const data = await res.json();
      setCoreFormData(data);
    } catch (error) {
      alert("Error fetching core forms");
    }
  };

  useEffect(() => {
    fetchCoreForms();
  }, []);

  // Handle actions
  const handleView = (url) => {
    window.open(url, "_blank", "noopener,noreferrer"); // open in new tab
  };

  // Download file function manadatory forms
  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = fileName || "document.pdf";
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file");
    }
  };

  const handleUpload = async (event, category) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("formFile", file);
    formData.append("company_name", exhibitorData?.company_name);
    formData.append("form_category", category);

    try {
      const res = await fetch(
        "https://inoptics.in/api/upload_signed_form.php",
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await res.json();
      if (result.success) {
        alert("Form uploaded successfully!");
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      alert("Error uploading file.");
    }
  };

  // Predefined categories
  const categories = [
    "APPOINTED CONTRACTOR & CONTRACTOR BADGES TO BE FILLED BY EXHIBITOR",
    "CONTRACTOR UNDERTAKING-DECLARATION & REGISTRATION TO BE FILLED BY CONTRACTOR",
    "CONTRACTOR REGISTRATION FORM TO BE FILLED BY CONTRACTOR",
  ];

  useEffect(() => {
    fetchFurnitureData();
  }, []);

  const fetchFurnitureData = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_furniture_requirement.php",
      );
      const data = await res.json();
      setFurnitureData(data);
    } catch (err) {
      console.error("Error fetching furniture data", err);
    }
  };

  useEffect(() => {
    fetchFurnitureVendorDetails();
  }, []);

  const fetchFurnitureVendorDetails = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_furniture_vendor.php",
      );
      const data = await res.json();
      setFurnitureVendorDetails(data || []);
    } catch (err) {
      console.error("Failed to fetch Furniture Vendor details", err);
    }
  };

  useEffect(() => {
    fetchEmailMessages();
  }, []);

  const fetchEmailMessages = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_email_messages.php");
      const json = await res.json();
      setEmailMasterData(json.data || []); // ✅ Make sure to use json.data
    } catch (err) {
      console.error("Failed to fetch email messages", err);
    }
  };

  useEffect(() => {
    if (currentExhibitor) {
      setFormData({
        company_name: currentExhibitor.company_name || "",
        name: currentExhibitor.name || "",
        mobile: currentExhibitor.mobile || "",
        email: currentExhibitor.email || "",
        stall_no: currentExhibitor.stall_no || "",
      });
    }
  }, [currentExhibitor]);

  // ✅ Your existing furniture mail function
  const handleSendFurnitureMail = async (emailTemplateName) => {
    if (isSendingMail) return;
    setIsSendingMail(true);

    try {
      // 1️⃣ Find Vendor Template
      const vendorTemplate = emailMasterData.find(
        (template) => template.email_name === emailTemplateName,
      );

      if (!vendorTemplate) {
        alert("Vendor email template not found.");
        setIsSendingMail(false);
        return;
      }

      // 2️⃣ Find Exhibitor Template
      const exhibitorTemplate = emailMasterData.find(
        (template) =>
          template.email_name ===
          "InOptics 2026 @ Extra Furniture Request Confirmation Exhibitor",
      );

      if (!exhibitorTemplate) {
        alert("Exhibitor email template not found.");
        setIsSendingMail(false);
        return;
      }

      // 3️⃣ Exhibitor Details
      const { company_name, name, mobile, email, stall_no } = formData;
      if (!company_name || !email) {
        alert("Missing company name or email in form data.");
        setIsSendingMail(false);
        return;
      }

      // 4️⃣ Vendor Email
      let vendorEmail = null;
      if (
        Array.isArray(furnitureVendorDetails) &&
        furnitureVendorDetails.length > 0
      ) {
        const vendorObj = furnitureVendorDetails[0];
        vendorEmail =
          vendorObj.email ||
          vendorObj.vendor_email ||
          vendorObj.vendorEmail ||
          vendorObj.contact_email ||
          (typeof vendorObj.description === "string"
            ? vendorObj.description.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0]
            : null);
      }

      if (!vendorEmail) {
        alert("Vendor email not found in Extra Furniture Instruction section.");
        setIsSendingMail(false);
        return;
      }

      // 5️⃣ Validate Furniture Items
      if (!selectedFurniture || selectedFurniture.length === 0) {
        alert("No furniture items selected.");
        setIsSendingMail(false);
        return;
      }

      // 6️⃣ Build Furniture Table
      const furnitureTableHTML = `
        <br><h3>Requested Furniture Details</h3>
        <table border="1" cellspacing="0" cellpadding="6"
               style="border-collapse: collapse; width: 100%; font-family: Arial; font-size: 13px;">
          <thead style="background: #f2f2f2;">
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${selectedFurniture
              .map(
                (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${parseFloat(item.price).toFixed(2)}</td>
                    <td>${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>
        <br>
        <div style="font-weight:bold;">
          GRAND TOTAL: ${selectedFurniture
            .reduce((sum, i) => sum + i.quantity * i.price, 0)
            .toFixed(2)}
        </div>
      `;

      // 7️⃣ Replace placeholders in template (Vendor)
      const vendorMailHTML =
        vendorTemplate.content
          .replace(/\[Company Name\]/g, company_name)
          .replace(/\[Contact Person Name\]/g, name)
          .replace(/\[Mobile Number\]/g, mobile)
          .replace(/\[Email Address\]/g, email)
          .replace(/\[Stall No.\]/g, stall_no)
          .replace(/&n/g, "<br>") + `<br><br>${furnitureTableHTML}`;

      // 8️⃣ Send Vendor Mail
      const vendorResponse = await fetch(
        "https://inoptics.in/api/send_furniture_vendor_mail.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email_name: emailTemplateName,
            to: vendorEmail,
            html: vendorMailHTML,
          }),
        },
      );

      const vendorResult = await vendorResponse.json();
      console.log("Vendor Mail Response:", vendorResult);

      if (vendorResult.message?.includes("Mail sent successfully")) {
        const vendorName =
          furnitureVendorDetails?.[0]?.vendor_name || "Furniture Vendor";

        const exhibitorMailHTML =
          exhibitorTemplate.content
            .replace("[Vendor Name]", vendorName)
            .replace("[Company Name]", company_name)
            .replace("[Contact Person Name]", name)
            .replace("[Mobile Number]", mobile)
            .replace("[Email Address]", email)
            .replace("[Stall No.]", stall_no)
            .replace("&n", "<br>") + `<br><br>${furnitureTableHTML}`;

        const exhibitorResponse = await fetch(
          "https://inoptics.in/api/send_furniture_vendor_mail.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email_name:
                "InOptics 2026 @ Extra Furniture Request Confirmation Exhibitor",
              to: email,
              html: exhibitorMailHTML,
            }),
          },
        );

        const exhibitorResult = await exhibitorResponse.json();
        console.log("Exhibitor Mail Response:", exhibitorResult);

        if (exhibitorResult.message?.includes("Mail sent successfully")) {
          alert("✅ Mail sent successfully!");
        } else {
          alert("Vendor mail sent, but failed to send Exhibitor confirmation.");
        }
      } else {
        alert("❌ Failed to send mail to vendor.");
      }
    } catch (error) {
      console.error("Error sending furniture mail:", error);
      alert("Error sending mail. Please try again.");
    } finally {
      setIsSendingMail(false);
    }
  };

  const handleUnlockRequestMail = async () => {
    try {
      // 1️⃣ Mark unlock_requested = 1 in DB
      const updateResponse = await fetch(
        "https://inoptics.in/api/unlock_request.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: formData.company_name,
          }),
        },
      );

      const updateResult = await updateResponse.json();
      if (updateResult.status !== "success") {
        alert("❌ Failed to mark unlock request in database.");
        return;
      }

      // 2️⃣ Send unlock mail to admin
      const mailResponse = await fetch(
        "https://inoptics.in/api/send_unlock_request_mail.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: formData.company_name,
            name: formData.name,
            email: formData.email,
            phone: formData.mobile,
            stall_no: formData.stall_no,
          }),
        },
      );

      const mailResult = await mailResponse.json();
      if (mailResult.message?.includes("✅")) {
        alert("✅ Unlock request sent to Admin successfully!");
      } else {
        alert("❌ Failed to send unlock request mail.");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Error sending unlock request.");
    }
  };

  // ==== Power Requirement States ====
  //  const [powerTypes] = useState(["Setup Days", "Exhibition Days"]);
  const [currentStep, setCurrentStep] = useState(0);
  const [previewTableList, setPreviewTableList] = useState([]); // to display before submission
  const [isSavedToDB, setIsSavedToDB] = useState(false);

  const [exhibitorSelectedDay, setExhibitorSelectedDay] = useState("");
  const [exhibitorPricePerKw, setExhibitorPricePerKw] = useState("");
  const [exhibitorPowerRequired, setExhibitorPowerRequired] = useState("");
  const [exhibitorPhase, setExhibitorPhase] = useState("");
  const [exhibitorTotalAmount, setExhibitorTotalAmount] = useState("");

  const [exhibitorPreviewList, setExhibitorPreviewList] = useState([]);
  const [powerData, setPowerData] = useState([]);
  const [powerAmount, setPowerAmount] = useState(0);
  const [powerSgst, setPowerSgst] = useState(0);
  const [powerCgst, setPowerCgst] = useState(0);
  const [powerIgst, setPowerIgst] = useState(0);
  const [powerGrandTotal, setPowerGrandTotal] = useState(0);
  const [showExhibitorEditForm, setShowExhibitorEditForm] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [masterPowerData, setMasterPowerData] = useState([]);

  const [totalPrice, setTotalPrice] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [igst, setIgst] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // ===== Derived power types from master rates (safe) =====
  const powerTypes = [
    ...new Set(
      (masterPowerData || [])
        .map((item) => item.power_type?.trim?.())
        .filter(Boolean),
    ),
  ];

  // ===== Fetch master rate chart (used in AdminDashboard earlier) =====
  const fetchMasterPowerData = async () => {
    try {
      const response = await fetch(
        "https://www.inoptics.in/api/get_power_requirement.php",
      );
      const text = await response.text();
      // console.log("Raw master response text:", text);
      const data = JSON.parse(text);
      // console.log("Parsed masterPowerData:", data);
      // If API returns array directly, set it. If it wraps inside object, adjust accordingly.
      // Many of your existing calls set `powerData = data` so we follow same pattern:
      setMasterPowerData(Array.isArray(data) ? data : data.entries || []);
    } catch (error) {
      console.error("Fetch error (master rates):", error);
      setMasterPowerData([]);
    }
  };

  const fetchPowerBilling = async (companyName) => {
    try {
      const res = await fetch(
        `https://inoptics.in/api/get_Exhibitor_power_requirement.php?company_name=${encodeURIComponent(
          companyName,
        )}`,
      );
      const data = await res.json();

      if (res.ok && data.entries && data.entries.length > 0) {
        setPowerData(data.entries);

        // 🔹 Detect lock/unlock properly
        const isLocked = data.entries.some(
          (item) => Number(item.is_locked) === 1,
        );
        const unlockRequested = data.entries.some(
          (item) => Number(item.unlock_requested) === 1,
        );

        // 🔹 Set states
        setIsSavedToDB(true);
        setIsViewOnly(isLocked ? true : false); // if unlocked => false

        // 🔹 If unlocked, load current table into editable preview
        if (!isLocked) {
          const editableRows = data.entries.map((item) => ({
            day: item.day,
            pricePerKw: item.price_per_kw,
            powerRequired: item.power_required,
            phase: item.phase,
            totalAmount: item.total_amount,
          }));
          setPreviewTableList(editableRows);
        }

        // ===== Calculate totals =====
        let total = 0;
        data.entries.forEach((item) => {
          total += parseFloat(item.total_amount || 0);
        });
        setPowerAmount(total);

        const hasSGST = data.entries.some(
          (s) => parseFloat(s.sgst_9_percent) > 0,
        );
        const hasCGST = data.entries.some(
          (s) => parseFloat(s.cgst_9_percent) > 0,
        );
        const hasIGST = data.entries.some(
          (s) => parseFloat(s.igst_18_percent) > 0,
        );

        if (hasSGST || hasCGST) {
          const sgstVal = total * 0.09;
          const cgstVal = total * 0.09;
          setPowerSgst(sgstVal);
          setPowerCgst(cgstVal);
          setPowerIgst(0);
          setPowerGrandTotal(total + sgstVal + cgstVal);
        } else if (hasIGST) {
          const igstVal = total * 0.18;
          setPowerIgst(igstVal);
          setPowerSgst(0);
          setPowerCgst(0);
          setPowerGrandTotal(total + igstVal);
        } else {
          setPowerSgst(0);
          setPowerCgst(0);
          setPowerIgst(0);
          setPowerGrandTotal(total);
        }
        setActivities((prev) =>
          prev.map((act) =>
            act.name === "POWER REQUIREMENT" ? { ...act, done: true } : act,
          ),
        );
      } else {
        setPowerData([]);
        setPreviewTableList([]);
        setIsSavedToDB(false);
        setIsViewOnly(false);
      }
    } catch (err) {
      console.error("Failed to fetch power billing", err);
    }
  };

  useEffect(() => {
    fetchMasterPowerData(); // Load price chart on page load
  }, []);

  useEffect(() => {
    if (currentExhibitor?.company_name) {
      fetchPowerBilling(currentExhibitor.company_name);
    }
  }, [currentExhibitor]);

  // ===== When master rates arrive, initialize the visible TYPE & PRICE fields =====
  useEffect(() => {
    if (powerTypes.length > 0) {
      // set to first available type + price (safe)
      const firstType = powerTypes[0];
      setExhibitorSelectedDay(firstType);

      const match = masterPowerData.find(
        (it) =>
          it.power_type?.trim?.() === firstType ||
          it.type?.trim?.() === firstType,
      );
      setExhibitorPricePerKw(match?.price ?? match?.price_per_kw ?? "");
    }
  }, [masterPowerData]); // depends on masterPowerData (powerTypes derived from it)

  // ===== Handlers (use masterPowerData to map TYPE -> PRICE) =====
  const handleExhibitorDayChange = (e) => {
    const selectedDay = e.target.value;
    setExhibitorSelectedDay(selectedDay);

    const selectedItem = masterPowerData.find(
      (item) =>
        item.power_type?.trim?.() === selectedDay ||
        item.type?.trim?.() === selectedDay,
    );
    setExhibitorPricePerKw(
      selectedItem?.price ?? selectedItem?.price_per_kw ?? "",
    );
  };

  const handleExhibitorPowerChange = (e) => {
    const power = e.target.value;
    setExhibitorPowerRequired(power);

    if (exhibitorPricePerKw && power) {
      const total =
        parseFloat(exhibitorPricePerKw || 0) * parseFloat(power || 0);
      setExhibitorTotalAmount(isNaN(total) ? "" : total.toFixed(2));
    } else {
      setExhibitorTotalAmount("");
    }
  };

  const handleExhibitorPhaseChange = (e) => {
    setExhibitorPhase(e.target.value);
  };

  // ====== Handle ADD (EXHIBITION DAYS) ======
  const handleExhibitorAdd = () => {
    if (!exhibitorPowerRequired || !exhibitorPhase) {
      alert("Please fill all required fields.");
      return;
    }

    const totalAmount = (
      parseFloat(exhibitorPowerRequired || 0) *
      parseFloat(exhibitorPricePerKw || 0)
    ).toFixed(2);

    const newRow = {
      day: "Exhibition Days",
      pricePerKw: exhibitorPricePerKw,
      powerRequired: exhibitorPowerRequired,
      phase: exhibitorPhase,
      totalAmount,
    };

    setPreviewTableList((prev) => [...prev, newRow]);
    setExhibitorPowerRequired("");
    setExhibitorPhase("");
    setExhibitorTotalAmount("");
  };

  // ===== Send Power Mail to Admin =====
  const sendPowerMailToAdmin = async (companyName) => {
    try {
      await fetch("https://inoptics.in/api/send_power_mail_to_admin.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_name:
            "InOptics 2026 @ Exhibitor Power Requirement Confirmation",
          company_name: companyName,
        }),
      });
    } catch (error) {
      console.error("Failed to send power mail to admin:", error);
    }
  };

  const handleExhibitorPowerSubmit = async () => {
    if (previewTableList.length === 0) {
      alert("No data to submit.");
      return;
    }

    try {
      const payload = previewTableList.map((item) => ({
        company_name: currentExhibitor.company_name,
        day: item.day,
        price_per_kw: item.pricePerKw,
        power_required: item.powerRequired,
        phase: item.phase,
        total_amount: item.totalAmount,
        total_price: totalPrice.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        igst: igst.toFixed(2),
        grand_total: grandTotal.toFixed(2),
        is_locked: 1, // mark as locked
      }));

      const response = await fetch(
        "https://inoptics.in/api/add_Exhibitor_power_requirement.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: payload }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        alert("Data submitted successfully!");

        // 🔹 Send power mail to Admin
        await sendPowerMailToAdmin(currentExhibitor.company_name);

        // Lock the form
        setIsSavedToDB(true);
        setIsViewOnly(true);
        fetchPowerBilling(currentExhibitor.company_name);
      } else {
        alert("Submission failed: " + (result.error || JSON.stringify(result)));
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("An error occurred while submitting.");
    }
  };

  // ===== Handle Power Unlock Request =====
  const handlePowerUnlockRequest = async () => {
    try {
      const response = await fetch(
        "https://inoptics.in/api/power_mail_unlock_request.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            template_name:
              "InOptics 2026 @ Request to Unlock Power Requirement",
            company_name: currentExhibitor.company_name,
          }),
        },
      );

      const result = await response.json();
      console.log(result);

      if (response.ok && result.message.includes("✅")) {
        alert("Unlock request sent to Admin successfully!");
      } else {
        alert("Failed to send unlock request email.");
      }
    } catch (error) {
      console.error("Error sending unlock request:", error);
      alert("An error occurred while sending unlock request.");
    }
  };

  // ====== Handle NEXT (SETUP DAYS) ======
  const handlePowerFormNext = () => {
    if (!exhibitorPowerRequired || !exhibitorPhase) {
      alert("Please fill all required fields before continuing.");
      return;
    }

    const totalAmount = (
      parseFloat(exhibitorPowerRequired || 0) *
      parseFloat(exhibitorPricePerKw || 0)
    ).toFixed(2);

    const newRow = {
      day: "Setup Days",
      pricePerKw: exhibitorPricePerKw,
      powerRequired: exhibitorPowerRequired,
      phase: exhibitorPhase,
      totalAmount,
    };

    setPreviewTableList([newRow]);
    setExhibitorPowerRequired("");
    setExhibitorPhase("");
    setExhibitorTotalAmount("");

    setPowerFormStep(1); // 👉 EXHIBITION DAYS
  };

  const handleRemoveRow = (index) => {
    setPreviewTableList((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePowerFormPrevious = () => {
    if (powerFormStep > 0) {
      setPowerFormStep((prev) => prev - 1);
    }
  };

  const handlePowerFormAdd = () => {
    if (!exhibitorPowerRequired || !exhibitorPhase) {
      alert("Please fill all required fields.");
      return;
    }

    const totalAmount = (
      parseFloat(exhibitorPowerRequired || 0) *
      parseFloat(exhibitorPricePerKw || 0)
    ).toFixed(2);

    const newRow = {
      day: "Exhibition Days",
      pricePerKw: exhibitorPricePerKw,
      powerRequired: exhibitorPowerRequired,
      phase: exhibitorPhase,
      totalAmount,
    };

    setPreviewTableList((prev) => [...prev, newRow]);
    setExhibitorPowerRequired("");
    setExhibitorPhase("");
    setExhibitorTotalAmount("");
  };

  const handlePowerFormPowerChange = (e) => {
    const power = e.target.value;
    setExhibitorPowerRequired(power);

    if (exhibitorPricePerKw && power) {
      const total =
        parseFloat(exhibitorPricePerKw || 0) * parseFloat(power || 0);
      setExhibitorTotalAmount(isNaN(total) ? "" : total.toFixed(2));
    } else {
      setExhibitorTotalAmount("");
    }
  };

  const handlePowerFormPhaseChange = (e) => {
    setExhibitorPhase(e.target.value);
  };

  // ===== Handle Full Power Data Reset (Delete both Setup & Exhibition Days) =====
  const handleResetPowerData = async () => {
    if (!currentExhibitor?.company_name) {
      alert("Missing company name!");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to remove all power data for this Exhibitor?",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        "https://inoptics.in/api/delete_Exhibitor_power_requirement.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: currentExhibitor.company_name, // 👈 only company_name now
            delete_all: true, // tell backend to delete all records of this company
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Power data removed successfully!");

        // Clear from table immediately
        setPreviewTableList([]);
        setPowerData([]);
        setIsSavedToDB(false);
        setIsViewOnly(false);
      } else {
        alert("Delete failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error deleting power data:", error);
      alert("Error while removing power data.");
    }
  };

  useEffect(() => {
    // Determine which data to use (fetched data or preview list)
    const tableData = powerData.length > 0 ? powerData : previewTableList;

    if (!tableData || tableData.length === 0) {
      setTotalPrice(0);
      setCgst(0);
      setSgst(0);
      setIgst(0);
      setGrandTotal(0);
      return;
    }

    // ✅ Step 1: Calculate Total Price (sum of Total Amount column)
    const total = tableData.reduce((sum, item) => {
      const amount =
        parseFloat(item.total_amount || item.totalAmount || 0) || 0;
      return sum + amount;
    }, 0);
    setTotalPrice(total);

    // ✅ Step 2: Determine state for tax logic
    const state = (currentExhibitor?.state || "").trim().toLowerCase();

    if (state === "delhi") {
      const cgstVal = total * 0.09;
      const sgstVal = total * 0.09;
      const grand = total + cgstVal + sgstVal;

      setCgst(cgstVal);
      setSgst(sgstVal);
      setIgst(0);
      setGrandTotal(grand);
    } else {
      const igstVal = total * 0.18;
      const grand = total + igstVal;

      setCgst(0);
      setSgst(0);
      setIgst(igstVal);
      setGrandTotal(grand);
    }
  }, [powerData, previewTableList, currentExhibitor]);

  // ==== Billing calculation based on preview list + exhibitor state ====
  useEffect(() => {
    if (!currentExhibitor) return;

    if (exhibitorPreviewList.length === 0) {
      setTotalPrice(0);
      setCgst(0);
      setSgst(0);
      setIgst(0);
      setGrandTotal(0);
      return;
    }

    const total = exhibitorPreviewList.reduce(
      (sum, item) => sum + Number(item.totalAmount || 0),
      0,
    );

    let newCgst = 0,
      newSgst = 0,
      newIgst = 0;

    if (currentExhibitor?.state?.toLowerCase() === "delhi") {
      newCgst = (total * 9) / 100;
      newSgst = (total * 9) / 100;
    } else {
      newIgst = (total * 18) / 100;
    }

    setTotalPrice(total);
    setCgst(newCgst);
    setSgst(newSgst);
    setIgst(newIgst);
    setGrandTotal(total + newCgst + newSgst + newIgst);
  }, [exhibitorPreviewList, currentExhibitor]);

  // ====== BADGE MANAGEMENT LOGIC ======
  const [extraBadges, setExtraBadges] = useState("");
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // === Fetch Badge Limit When Exhibitor Loads ===
  useEffect(() => {
    if (currentExhibitor?.company_name) {
      fetchBadgeLimitsAndSetFreeBadges(currentExhibitor);
    }
    // only re-run when exhibitor changes
  }, [currentExhibitor?.company_name]);

  // === Fetch Exhibitor Badge Data from Database ===
  useEffect(() => {
    if (!currentExhibitor?.company_name) return;
    const company = currentExhibitor.company_name;

    setLoadingBadges(true);
    fetch(
      `https://inoptics.in/api/get_Exhibitor_badges.php?company_name=${encodeURIComponent(
        company,
      )}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;
        const free = parseInt(data.free_badges, 10) || 0;
        const extra = parseInt(data.extra_badges, 10) || 0;
        const locked = data.is_locked == 1;

        updateExhibitorBadges(free);
        setExtraBadges(extra);
        setIsLocked(locked);

        if (extra > 0 || locked) {
          setActivities((prev) =>
            prev.map((act) =>
              act.name === "EXTRA EXHIBITOR BADGE"
                ? { ...act, done: true }
                : act,
            ),
          );
        }
      })
      .catch((err) =>
        console.error("❌ Failed to fetch exhibitor badges:", err),
      )
      .finally(() => setLoadingBadges(false));
  }, [currentExhibitor?.company_name]);

  // === Fetch Badge Limit Range & Update Free Badges ===
  const fetchBadgeLimitsAndSetFreeBadges = async (exhibitor) => {
    try {
      const response = await fetch(
        "https://inoptics.in/api/get_badge_limit.php",
      );
      const badgeLimits = await response.json();

      const stallArea = parseFloat(exhibitor?.stall_area || 0);
      if (!stallArea || isNaN(stallArea)) {
        console.warn("⚠️ No valid stall area found for exhibitor");
        return;
      }

      const matchedRange = badgeLimits.find(
        (range) =>
          stallArea >= parseFloat(range.min_sq_ft) &&
          stallArea <= parseFloat(range.max_sq_ft),
      );

      const freeBadges = matchedRange
        ? parseInt(matchedRange.no_of_badges, 10) || 0
        : 0;
      updateExhibitorBadges(freeBadges);
    } catch (error) {
      console.error("❌ Error fetching badge limits:", error);
    }
  };

  // === Helper: Update Exhibitor Free Badges Without Re-Rendering Loop ===
  const updateExhibitorBadges = (free_badges) => {
    setExhibitors((prev) => {
      if (!prev || prev.length === 0) return prev;
      const updated = [...prev];
      if (updated[0].free_badges === free_badges) return prev; // 🧩 avoid infinite loop
      updated[0] = { ...updated[0], free_badges };
      return updated;
    });
  };

  // === Submit Handler ===
  const handleExhibitorBadgesSubmit = async (e) => {
    e.preventDefault();

    if (!currentExhibitor?.company_name) {
      alert("Invalid exhibitor data!");
      return;
    }

    const payload = {
      company_name: currentExhibitor.company_name,
      free_badges: currentExhibitor.free_badges || 0,
      extra_badges: extraBadges || 0,
    };

    try {
      const res = await fetch(
        "https://inoptics.in/api/update_Exhibitor_badges.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (data.success) {
        alert("✅ Exhibitor badges submitted successfully!");
        setIsLocked(true); // lock the form

        // === Send Mail to Admin ===
        await fetch("https://inoptics.in/api/send_extra_badges_mail.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: currentExhibitor.company_name,
            template_name: "InOptics 2026 Exhibitor Extra Badges",
          }),
        });

        console.log("✅ Mail sent to Admin successfully!");
      } else {
        alert(data.error || "Failed to update exhibitor badges.");
      }
    } catch (error) {
      console.error("❌ Error updating exhibitor badges:", error);
      alert("❌ Error updating exhibitor badges.");
    }
  };

  // === Handle Unlock Request ===
  const handleUnlockRequest = async () => {
    if (!currentExhibitor?.company_name) {
      alert("Invalid exhibitor data!");
      return;
    }

    try {
      const response = await fetch(
        "https://inoptics.in/api/request_unlock_badges.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: currentExhibitor.company_name,
            template_name: "InOptics 2026 @ Request to Unlock Extra Badges",
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        alert("✅ Unlock request sent successfully to Admin!");
      } else {
        alert(
          "⚠️ Failed to send unlock request: " +
            (data.message || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("❌ Error requesting unlock:", error);
      alert("❌ Failed to send unlock request.");
    }
  };

  // 🧩 Contractor management states
  const [contractorData, setContractorData] = useState([]);
  const [selectedContractorId, setSelectedContractorId] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showContractorOverlay, setShowContractorOverlay] = useState(false);
  const [contractorEmail, setContractorEmail] = useState("");
  const [finalListData, setFinalListData] = useState([]);
  const [activeContractorTab, setActiveContractorTab] = useState("Final List");

  // These were missing in your ESLint errors:
  const [userName, setUserName] = useState("");
  const [userDesignation, setUserDesignation] = useState("");
  const [isUndertakingRead, setIsUndertakingRead] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showContractorListOverlay, setShowContractorListOverlay] =
    useState(false);

  // Fetch all available contractors
  const fetchExhibitorContractors = async () => {
    try {
      const response = await fetch(
        "https://inoptics.in/api/get_exhibitor_contractors_requirements.php",
      );
      const data = await response.json();
      setContractorData(data);
    } catch (error) {
      console.error("Error fetching contractor data:", error);
    }
  };

  useEffect(() => {
    if (isLocked === 1) {
      setContractorFormSubmitted(true);
      localStorage.setItem("contractorFormSubmitted", "true");
      setCurrentStep(2); // thank you
    }

    if (isLocked === 0) {
      setContractorFormSubmitted(false);
      localStorage.removeItem("contractorFormSubmitted");
      setCurrentStep(1); // back to form
    }
  }, [isLocked]);

  // Fetch selected contractor for the current exhibitor
  const fetchSelectedContractor = async (companyName) => {
    try {
      const response = await fetch(
        `https://inoptics.in/api/get_selected_exhibitors_contractors.php?exhibitor_company_name=${companyName}`,
      );

      const data = await response.json();

      if (data && data.contractor_company_name) {
        const selected = contractorData.find(
          (c) => c.company_name === data.contractor_company_name,
        );

        if (selected) {
          setSelectedContractorId(selected.id);
        }

        // 🔥 IMPORTANT: set lock state from backend
        setIsLocked(Number(data.is_locked)); // store 0 or 1
      } else {
        setSelectedContractorId(null);
        setIsLocked(Number(data.is_locked));
      }
    } catch (error) {
      console.error("Error fetching selected contractor:", error);
    }
  };

  // Select contractor
  const selectContractor = async (contractorId) => {
    const contractor = contractorData.find((c) => c.id === contractorId);
    const exhibitorCompany = formData.company_name;

    const contactNumbers = [
      contractor.phone_numbers || "",
      contractor.mobile_numbers || "",
    ]
      .filter(Boolean)
      .join(" / ");

    try {
      const response = await fetch(
        "https://inoptics.in/api/selected_exhibitors_contractors.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exhibitor_company_name: exhibitorCompany,
            contractor_name: contractor.name,
            contractor_company_name: contractor.company_name,
            address: contractor.address,
            city: contractor.city,
            pincode: contractor.pincode,
            country: contractor.country,
            contact_numbers: contactNumbers,
            email: contractor.email,
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        setSelectedContractorId(contractorId);
        toast.success("Contractor selected successfully.");
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error("Error selecting contractor:", error);
    }
  };

  // Unselect contractor
  const unselectContractor = async () => {
    const exhibitorCompany = formData.company_name;

    try {
      const response = await fetch(
        "https://inoptics.in/api/unselect_exhibitors_contractors.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ exhibitor_company_name: exhibitorCompany }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        setSelectedContractorId(null);

        // Clear local storage and reset fields
        localStorage.removeItem("undertakingDetails");
        setUserName("");
        setUserDesignation("");
        setIsUndertakingRead(false);
        setIsSaved(false);

        toast.success("Contractor unselected successfully.");
      } else {
        console.error(result.error);
        alert("Failed to unselect contractor.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Fetch contractors on initial render
  useEffect(() => {
    fetchExhibitorContractors();
  }, []);

  // Fetch selected contractor when the active tab changes and company name is available
  useEffect(() => {
    if (activeMenu === "Contractors" && formData.company_name) {
      fetchSelectedContractor(formData.company_name);
      fetchBoothDesignStatus(); // 👈 important
    }
    // Poll every 5 seconds until approved/rejected
    const interval = setInterval(() => {
      fetchBoothDesignStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [activeMenu, formData.company_name, contractorData]);

  useEffect(() => {
    if (activeContractorTab === "Final List") {
      fetchAllFinalSelections();
    }
  }, [activeContractorTab]);

  const fetchAllFinalSelections = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_all_selected_exhibitors_contractors.php",
      );
      if (!res.ok) throw new Error("Failed to fetch final list");
      const data = await res.json();
      setFinalListData(data);
    } catch (error) {
      console.error("Error fetching final contractor list:", error);
    }
  };

  useEffect(() => {
    if (!selectedContractorId || activeMenu !== "Contractors") return;

    setWorkflowActive(true);

    if (contractorFormSubmitted) {
      setCurrentStep(4); // thank you
    } else {
      setCurrentStep(1); // form steps
    }
  }, [selectedContractorId, contractorFormSubmitted, activeMenu]);

  // This controls both workflowActive AND slide animation based on is_locked
  useEffect(() => {
    if (!selectedContractorId) {
      setWorkflowActive(false);
      setIsLocked(null);
    } else if (selectedContractorId && isLocked === 1) {
      // Contractor selected AND locked → show locked view with slide animation
      setWorkflowActive(true);
    } else if (selectedContractorId && (isLocked === 0 || isLocked === null)) {
      // Contractor selected but NOT locked → still show workflow (but maybe unlocked state later)
      setWorkflowActive(true);
    }
  }, [selectedContractorId, isLocked]);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedContractorTemp, setSelectedContractorTemp] = useState(null);
  const [workflowActive, setWorkflowActive] = useState(false);
  const [isExhibitorFormUploaded, setIsExhibitorFormUploaded] = useState(false);
  const [isCurrentSessionUpload, setIsCurrentSessionUpload] = useState(false);
  const [showUploadWarning, setShowUploadWarning] = useState(false);
  const [uploadedFileURL, setUploadedFileURL] = useState("");

  // When user clicks "Select" (before confirmation)
  const askConfirmSelect = (contractor) => {
    setSelectedContractorTemp(contractor); // store selected contractor temporarily
    setShowPopup(true); // open popup
  };

  // When user clicks OK
  const confirmSelect = async () => {
    if (!selectedContractorTemp) return;

    try {
      await selectContractor(selectedContractorTemp.id); // This sets selectedContractorId + alerts
      setWorkflowActive(true);
      setCurrentStep(1);
    } catch (error) {
      console.error(error);
      alert("Failed to select contractor. Please try again.");
    } finally {
      setShowPopup(false);
      setSelectedContractorTemp(null);
    }
  };

  // When cancel is clicked
  const cancelSelect = () => {
    setShowPopup(false);
    setSelectedContractorTemp(null);
  };

  // Add this before your return statement in the component (outside the JSX)
  const selectedContractor =
    contractorData.find((c) => c.id === selectedContractorId) || {};

  const handleSendRegistrationMail = async (email) => {
    if (!email) {
      alert("Please enter email");
      return;
    }

    const pdfUrl = coreFormData.find((form) =>
      form.category
        ?.toLowerCase()
        ?.includes("contractor registration form to be filled by contractor"),
    )?.filename
      ? `https://inoptics.in/api/uploads/${encodeURIComponent(
          coreFormData.find((form) =>
            form.category
              ?.toLowerCase()
              ?.includes(
                "contractor registration form to be filled by contractor",
              ),
          )?.filename,
        )}`
      : "";

    const res = await fetch(
      "https://inoptics.in/api/send_contractor_registration_mails.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          pdf_url: pdfUrl,
          company_name: formData.company_name,
        }),
      },
    );

    const data = await res.json();
    alert(data.message);
  };

  const requestContractorChange = async () => {
    if (!selectedContractor) {
      alert("No contractor selected yet.");
      return;
    }

    const exhibitorCompany = formData.company_name || "Unknown Exhibitor";
    const selectedContractorName =
      selectedContractor.company_name || "Unknown Contractor";

    try {
      // 1️⃣ Send Email
      await fetch(
        "https://inoptics.in/api/request_contractor_change_mail.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exhibitor_company_name: exhibitorCompany,
            current_contractor: selectedContractorName,
            exhibitorName: formData.name,
            stallNo: formData.stall_no,
            exhibitorEmail: formData.email,
            contractorName: selectedContractor.name,
            request_type: "unlock_contractor_change",
            message: `${exhibitorCompany} has requested to change their selected contractor (${selectedContractorName}).`,
          }),
        },
      );

      // 2️⃣ Save Unlock Request in DB
      const res = await fetch(
        "https://inoptics.in/api/create_unlock_request.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exhibitor_company: exhibitorCompany,
            contractor_name: selectedContractorName,
          }),
        },
      );

      const result = await res.json();

      if (result.success) {
        toast.success(
          "Unlock request sent!\nAdmin has been notified and your request is in their dashboard.",
        );
      } else {
        throw new Error("Failed to create unlock request");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send unlock request. Please try again.");
    }
  };

  useEffect(() => {
    if (formData.company_name) {
      checkUploadStatus(formData.company_name);
    }
  }, [formData.company_name]);

  const checkUploadStatus = async (companyName) => {
    try {
      const res = await fetch(
        `https://inoptics.in/api/get_exhibitor_form_status.php?exhibitor_company_name=${companyName}`,
      );

      const data = await res.json();

      if (data.uploaded) {
        setUploadedFileURL(data.file_path);
      }
    } catch (error) {
      console.error("Upload status error:", error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("exhibitor_company_name", formData.company_name);
    formDataUpload.append("file", file);

    try {
      const response = await fetch(
        "https://inoptics.in/api/upload_exhibitor_form.php",
        {
          method: "POST",
          body: formDataUpload,
        },
      );

      const result = await response.json();

      if (result.success) {
        alert("Form uploaded successfully!");
        setIsExhibitorFormUploaded(true);
        setUploadedFileURL(result.file_path);
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  // useEffect(() => {
  //   const saved = localStorage.getItem("contractorFormSubmitted");

  //   if (saved === "true") {
  //     setContractorFormSubmitted(true);
  //     setCurrentStep(3); // Jump to final step
  //     setWorkflowActive(true);
  //     setActiveMenu("Contractors");
  //   }
  // }, []);

  const sendFormToContractor = async () => {
    if (!selectedContractor?.email) {
      alert("No contractor selected!");
      return;
    }

    try {
      const res = await fetch(
        "https://inoptics.in/api/send_contractor_form.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contractor_email: selectedContractor.email,
            contractor_name: selectedContractor.name,
            exhibitor_company: formData.company_name,
            form_url: coreFormData.find((form) =>
              form.category
                ?.toLowerCase()
                ?.includes("contractor undertaking-declaration & registration"),
            )?.filename
              ? `https://inoptics.in/api/uploads/${encodeURIComponent(
                  coreFormData.find((form) =>
                    form.category
                      ?.toLowerCase()
                      ?.includes(
                        "contractor undertaking-declaration & registration",
                      ),
                  )?.filename,
                )}`
              : "",
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        alert("Form successfully emailed to selected contractor!");

        // 🔐 LOCK FLOW
        setContractorFormSubmitted(true);
        localStorage.setItem("contractorFormSubmitted", "true");
        setCurrentStep(3); // Final thank you step
        setWorkflowActive(true); // 👉 keep right panel open
      } else {
        alert("Failed to send email: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error sending email.");
    }
  };

  const [powerCleared, setPowerCleared] = useState(0);
  const [badgeCleared, setBadgeCleared] = useState(0);
  const [powerPendingAmount, setPowerPendingAmount] = useState(null);
  const [pendingAmount, setPendingAmount] = useState(null);
  const [payments, setPayments] = useState([]);
  const [powerPayments, setPowerPayments] = useState([]);
  // const [formSentToContractor, setFormSentToContractor] = useState(false);

  // State for badge payments
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [badgePayments, setBadgePayments] = useState([]);
  const [badgePaymentType, setBadgePaymentType] = useState("");
  const [badgePaymentDate, setBadgePaymentDate] = useState("");
  const [badgeExhibitorBankName, setBadgeExhibitorBankName] = useState("");
  const [badgeReceiverBankName, setBadgeReceiverBankName] = useState("");
  const [badgeAmount, setBadgeAmount] = useState("");
  const [badgeTds, setBadgeTds] = useState("");
  const [editingBadgeIndex, setEditingBadgeIndex] = useState(null);
  const [badgePendingAmount, setBadgePendingAmount] = useState(0);
  const [badgeReceived, setBadgeReceived] = useState(0);
  const [badgePending, setBadgePending] = useState(0);
  const [activePaymentDetailsOverlay, setActiveOverlay] = useState(null);
  const [selectedBranding, setSelectedBranding] = useState([]);
  const [brandingBilling, setBrandingBilling] = useState({
    subTotal: 0,
    amount: 0,
    sgst: 0,
    cgst: 0,
    igst: 0,
    grandTotal: 0,
  });

  const exhibitorState = currentExhibitor?.state?.trim().toLowerCase() || "";
  const isDelhi = exhibitorState === "delhi";

  // Common helper to calculate pending amount

  const calculatePending = (grandTotal, payments = []) => {
    const totalPaid = payments.reduce((sum, pay) => {
      const amount = parseFloat(pay.amount || pay.amount_paid || 0) || 0;
      const tds = parseFloat(pay.tds || 0) || 0;
      return sum + amount + tds;
    }, 0);

    return Number((parseFloat(grandTotal || 0) - totalPaid).toFixed(2));
  };

  // exhibitor of calculate cleared amount
  const calculateCleared = (payments = []) => {
    return payments.reduce((sum, p) => {
      const amount = parseFloat(p.amount || p.amount_paid || 0) || 0;
      const tds = parseFloat(p.tds || 0) || 0;
      return sum + amount + tds;
    }, 0);
  };

  const stallCleared = calculateCleared(payments);

  // Fetch Power Payments on load
  useEffect(() => {
    if (activePaymentDetailsOverlay === "power" && formData.company_name) {
      fetchPowerPayments();
    }
  }, [activePaymentDetailsOverlay, formData.company_name]);

  const fetchPowerPayments = async () => {
    try {
      const res = await fetch(
        `https://inoptics.in/api/get_exhibitor_power_payment.php?company_name=${formData.company_name}`,
      );
      const data = await res.json();

      if (data.success) {
        const normalized = data.records.map((pay) => ({
          type: pay.payment_type || "",
          date: pay.payment_date || "",
          exhibitorBank: pay.exhibitor_bank_name || "",
          receiverBank: pay.receiver_bank_name || "",
          amount: parseFloat(pay.amount_paid || 0),
          tds: parseFloat(pay.tds || 0),
        }));
        setPowerPayments(normalized);
      }
    } catch (error) {
      console.error("Error fetching power payments:", error);
    }
  };

  const fetchBadgePayments = async () => {
    try {
      const res = await fetch(
        `https://inoptics.in/api/get_exhibitor_badge_payment.php?company_name=${formData.company_name}`,
      );
      const data = await res.json();

      if (data.success) {
        const normalized = data.records.map((pay) => ({
          type: pay.payment_type || "",
          date: pay.payment_date || "",
          exhibitorBank: pay.exhibitor_bank_name || "",
          receiverBank: pay.receiver_bank_name || "",
          amount: parseFloat(pay.amount_paid || 0),
          tds: parseFloat(pay.tds || 0),
        }));
        setBadgePayments(normalized);
      }
    } catch (error) {
      console.error("Error fetching badge payments:", error);
    }
  };

  // ✅ Helper to calculate discount % (for summary)
  const getDiscountPercent = (summary) => {
    if (!summary || !summary.total || summary.total <= 0) return 0;
    return ((summary.discounted_amount / summary.total) * 100).toFixed(0);
  };

  const getExhibitorBadgeBilling = () => {
    const count = parseInt(formData.extra_badges, 10) || 0;
    const rate = new Date() > new Date("2026-02-30") ? 200 : 100;
    const total = count * rate;

    // const isDelhi = formData?.state?.trim().toLowerCase() === "delhi";
    const cgst = isDelhi ? total * 0.09 : 0;
    const sgst = isDelhi ? total * 0.09 : 0;
    const igst = !isDelhi ? total * 0.18 : 0;
    const grandTotal = total + cgst + sgst + igst;

    return { count, rate, total, cgst, sgst, igst, grandTotal };
  };

  const stallSummary = stallList?.reduce(
    (summary, stall) => {
      summary.total += parseFloat(stall.total || 0);
      summary.discounted_amount += parseFloat(stall.discounted_amount || 0);
      summary.sgst += parseFloat(stall.sgst_9_percent || 0);
      summary.cgst += parseFloat(stall.cgst_9_percent || 0);
      summary.igst += parseFloat(stall.igst_18_percent || 0);
      summary.grand_total += parseFloat(stall.grand_total || 0);
      if (!summary.currency) summary.currency = stall.currency || "";
      return summary;
    },
    {
      total: 0,
      discounted_amount: 0,
      sgst: 0,
      cgst: 0,
      igst: 0,
      grand_total: 0,
      currency: "",
    },
  );

  // ✅ Save Badge pending (from getExhibitorBadgeBilling)
  useEffect(() => {
    const { grandTotal } = getExhibitorBadgeBilling();
    if (formData?.company_name && grandTotal !== undefined) {
      localStorage.setItem(
        `pending_badge_${formData.company_name}`,
        grandTotal.toFixed(2),
      );
    }
  }, [formData?.company_name]);

  // ✅ Auto recalculate totals for badge section
  useEffect(() => {
    const totalPaid = badgePayments.reduce(
      (sum, p) => sum + (parseFloat(p.amount) || 0),
      0,
    );
    const totalTds = badgePayments.reduce(
      (sum, p) => sum + (parseFloat(p.tds) || 0),
      0,
    );
    const totalReceived = totalPaid + totalTds;

    setBadgeReceived(totalReceived.toFixed(2));

    // Example calculation for pending amount
    const badgeGrandTotal = getExhibitorBadgeBilling().grandTotal;
    const pending = calculatePending(badgeGrandTotal, badgePayments);
    setBadgePending(pending);
  }, [badgePayments]);

  // STALL Pending Amount Calculation

  useEffect(() => {
    if (stallList.length > 0) {
      const pending = calculatePending(stallSummary.grand_total, payments);
      setPendingAmount(pending);
    } else {
      setPendingAmount(null);
    }
  }, [payments, stallList, stallSummary.grand_total]);

  //  POWER Pending Amount Calculation

  useEffect(() => {
    if (formData?.company_name && exhibitorPreviewList.length > 0) {
      const totalPower = exhibitorPreviewList.reduce(
        (sum, r) => sum + (parseFloat(r.totalAmount) || 0),
        0,
      );

      const sgst = isDelhi ? totalPower * 0.09 : 0;
      const cgst = isDelhi ? totalPower * 0.09 : 0;
      const igst = !isDelhi ? totalPower * 0.18 : 0;

      const powerGrandTotal = totalPower + sgst + cgst + igst;

      const pending = calculatePending(powerGrandTotal, powerPayments);
      setPowerPendingAmount(pending);
    } else {
      setPowerPendingAmount(null);
    }
  }, [powerPayments, exhibitorPreviewList, isDelhi]);

  useEffect(() => {
    // Ensure the state is checked safely
    // const isDelhi = formData?.state?.toLowerCase() === "delhi";

    // Calculate subtotal (Area × Price)
    const subTotal = selectedBranding.reduce(
      (acc, item) => acc + (item.area || 0) * (item.price || 0),
      0,
    );

    const amount = Math.round(subTotal);
    const sgst = isDelhi ? Math.round((amount * 9) / 100) : 0;
    const cgst = isDelhi ? Math.round((amount * 9) / 100) : 0;
    const igst = !isDelhi ? Math.round((amount * 18) / 100) : 0;
    const grandTotal = Math.round(amount + sgst + cgst + igst);

    setBrandingBilling({
      subTotal,
      amount,
      sgst,
      cgst,
      igst,
      grandTotal,
    });
  }, [selectedBranding, formData.state]);

  useEffect(() => {
    const pending = grandTotal - powerCleared;

    if (!isNaN(pending)) {
      setPowerPendingAmount(pending > 0 ? pending : 0);
    }
  }, [grandTotal, powerCleared]);

  const handleFinalUpload = async () => {
    if (!selectedFile) return;

    const uploadData = new FormData();
    uploadData.append("file", selectedFile);
    uploadData.append("exhibitor_company_name", formData.company_name); // ✅ correct

    try {
      const res = await fetch(
        "https://inoptics.in/api/upload_exhibitor_form.php",
        {
          method: "POST",
          body: uploadData,
        },
      );

      const data = await res.json();
      setUploadedFileURL(data.file_path);

      if (data.success) {
        toast.success("Form uploaded successfully!");

        setUploadedFiles((prev) => {
          const updated = {
            ...prev,
            [`step${currentStep}`]: data.file_path,
          };
          console.log("Uploaded Files:", updated); // 👈 Debug check
          return updated;
        });

        setUploadedSteps((prev) => ({
          ...prev,
          [`step${currentStep}`]: true,
        }));
        // 🔥 THIS enables Next
        setShowPreview(false);
        setSelectedFile(null);
        setPreviewURL(null);
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      toast.error("Upload error");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewURL(URL.createObjectURL(file));
    setShowBoothDesignPreview(true);

    e.target.value = null;
  };

  // booth design upload handler
  const handleBoothDesignUpload = async () => {
    if (!selectedFile) {
      toast.error("No file selected");
      return;
    }

    console.log("Uploading file for company:", formData.company_name);

    if (!formData.company_name) {
      toast.error("Company name missing");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", selectedFile);
    uploadData.append("company_name", formData.company_name);

    try {
      const res = await fetch(
        "https://inoptics.in/api/upload_booth_design_file.php",
        { method: "POST", body: uploadData },
      );

      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      const data = JSON.parse(text);

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      toast.success("Booth design uploaded successfully!");

      setShowBoothDesignPreview(false);
      setSelectedFile(null);
      setPreviewURL(null);
      setUploadedSteps((prev) => ({
          ...prev,
          [`step${currentStep}`]: true,
        }));
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };

  // upload form file download handler

  const forceDownload = async (filePath) => {
    try {
      const url = `https://inoptics.in/api/download_exhibitor_form.php?company=${encodeURIComponent(
        formData.company_name,
      )}`;

      const res = await fetch(url);
      const blob = await res.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filePath.split("/").pop(); // filename
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
      alert("Download failed");
    }
  };

  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isExhibitorLoggedIn");

    if (!isLoggedIn) {
      navigate("/exhibitor-login");
    } else {
      const data = localStorage.getItem("exhibitorInfo");
      if (data && data !== "undefined") {
        const parsedData = JSON.parse(data);
        setExhibitorData(parsedData);

        setActiveMenu("Dashboard"); // 🔥 FORCE Dashboard
        setPageLoaded(true); // 🔥 Allow contractor logic after this
      }
    }
  }, []);

  useEffect(() => {
    if (activeMenu !== "Contractors") return;

    // If locked → ALWAYS show Thank You
    if (isLocked === 1) {
      setWorkflowActive(true);
      setCurrentStep(4); // Thank You step
      setContractorFormSubmitted(true);
      return;
    }

    // If unlocked → normal flow
    if (isLocked === 0) {
      setContractorFormSubmitted(false);

      if (selectedContractorId) {
        setWorkflowActive(true);
        setCurrentStep(1); // start contractor steps
      } else {
        setWorkflowActive(false);
      }
    }
  }, [activeMenu, isLocked, selectedContractorId]);

  useEffect(() => {
    if (boothDesignStatus === "rejected") {
      // only rejected should go back
      setCurrentStep(3); // booth design upload step
    }

    if (boothDesignStatus === "approved" || boothDesignStatus === "pending") {
      // approved & pending must stay on thankyou screen
      setCurrentStep(4);
    }
  }, [boothDesignStatus]);

  const fetchBoothDesignStatus = async () => {
    try {
      const res = await fetch(
        `https://inoptics.in/api/get_booth_design_status.php?company=${encodeURIComponent(
          formData.company_name,
        )}`,
      );

      const data = await res.json();

      let status = (data.status || "").toLowerCase().trim();

      // normalize
      if (!status || status === "0") status = "pending";
      if (status === "approved" || status === "1") status = "approved";
      if (status === "rejected" || status === "2") status = "rejected";

      console.log("Booth Design Status:", status); // 🔥 DEBUG

      setBoothDesignStatus(status);
    } catch (err) {
      console.error("Failed to fetch booth status", err);
      setBoothDesignStatus("pending"); // safe fallback
    }
  };

  const handleExhibitorFormDownload = (url, fileName) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="exhibitordashboard-container">
      {/* Sidebar */}
      <div className="mobile-topbar">
        <button
          className="mobile-toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          <FaBars />
        </button>
      </div>
      <aside
        className={`exhibitordashboard-sidebar ${collapsed ? "collapsed" : ""}`}
      >
        <div className="exhibitordashboard-sidebar-header">
          <h2 className="exhibitordashboard-sidebar-title">Exhibitor Panel</h2>
          <button
            className="toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            <FaBars />
          </button>
        </div>

        <ul className="exhibitordashboard-sidebar-menu">
          {menus.map((menu) => (
            <li
              key={menu.name}
              className={activeMenu === menu.name ? "active" : ""}
              onClick={() => {
                handleMenuClick(menu.name);
                if (window.innerWidth <= 1024) {
                  setCollapsed(true); // 👈 mobile / tablet me auto close
                }
              }}
              style={{ position: "relative" }}
            >
              <span className="icon">{menu.icon}</span>
              {!collapsed && <span className="label">{menu.name}</span>}

              {menu.name === "Mails Inbox" && unreadCount > 0 && (
                <span className="mail-badge-sidebar">{unreadCount}</span>
              )}
            </li>
          ))}

          <li
            className="logout-btn"
            onClick={() => {
              handleLogout();
              if (window.innerWidth <= 1024) {
                setCollapsed(true);
              }
            }}
          >
            <span className="icon">
              <FaSignOutAlt />
            </span>
            {!collapsed && <span className="label">Logout</span>}
          </li>
        </ul>
      </aside>

      {!collapsed && window.innerWidth <= 1024 && (
        <div className="sidebar-overlay" onClick={() => setCollapsed(true)} />
      )}

      <div className="exhibitordashboard-main-content">
        <header className="exhibitordashboard-navbar">
          <h1>{activeMenu}</h1>

          {/* Profile dropdown now inside navbar */}
          <div className="exhibitordashboard-profile-menu-wrapper">
            <div
              className="exhibitordashboard-profile-menu"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <p>
                <span className="exhibitordashboard-entypo-down-open exhibitordashboard-scnd-font-color"></span>
              </p>
              <div className="exhibitordashboard-profile-picture exhibitordashboard-small-profile-picture">
                <img
                  width="40"
                  alt="Profile"
                  src="http://upload.wikimedia.org/wikipedia/commons/e/e1/Anne_Hathaway_Face.jpg"
                />
              </div>
            </div>

            {showProfileDropdown && (
              <div className="exhibitordashboard-floating-profile-dropdown">
                <h4>Company Logo</h4>
                <button className="exhibitordashboard-dropdown-btn">
                  Upload Image
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Overlay Panel */}
        {(activeMenu === "Dashboard" ||
          activeMenu === "Profile" ||
          ["Instructions", "Rules", "Exhibition Map", "Guidelines"].includes(
            importantPage,
          )) && (
          <div className="exhibitordashboard-dashboard-overlay-panel open">
            <header className="exhibitordashboard-undertaking-dashboard-header">
              <ul className="exhibitordashboard-header-menu horizontal-list">
                <li className="exhibitordashboard-dropdown-parent">
                  <button
                    className="exhibitordashboard-header-menu-tab"
                    onClick={() => handleImportantClick("Instructions")}
                  >
                    Important
                  </button>
                  <ul className="exhibitordashboard-dropdown-submenu">
                    <li>
                      <button
                        onClick={() => handleImportantClick("Instructions")}
                      >
                        Instructions
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleImportantClick("Rules")}>
                        Rules & Policy
                      </button>
                    </li>
                  </ul>
                </li>
                <li>
                  <button
                    className="exhibitordashboard-header-menu-tab"
                    onClick={() => handleImportantClick("Exhibition Map")}
                  >
                    Exhibition Map
                  </button>
                </li>
                <li>
                  <button
                    className="exhibitordashboard-header-menu-tab"
                    onClick={() => handleImportantClick("Guidelines")}
                  >
                    Guidelines
                  </button>
                </li>
              </ul>
            </header>
          </div>
        )}

        {/* Overlay Panel for Additional Requirements */}
        {(activeMenu === "Additional Requirements" ||
          ["Furniture Requirements", "Power Requirement"].includes(
            importantPage,
          )) && (
          <div className="exhibitordashboard-dashboard-overlay-panel open">
            <header className="exhibitordashboard-undertaking-dashboard-header">
              <ul className="exhibitordashboard-header-menu horizontal-list">
                <li>
                  <button
                    className={`exhibitordashboard-header-menu-tab ${
                      importantPage === "Furniture Requirements"
                        ? "active-tab"
                        : ""
                    }`}
                    onClick={() =>
                      handleImportantClick("Furniture Requirements")
                    }
                  >
                    Furniture Requirements
                  </button>
                </li>
                <li>
                  <button
                    className={`exhibitordashboard-header-menu-tab ${
                      importantPage === "Power Requirement" ? "active-tab" : ""
                    }`}
                    onClick={() => handleImportantClick("Power Requirement")}
                  >
                    Power Requirement
                  </button>
                </li>
              </ul>
            </header>
          </div>
        )}

        {/* Dynamic content */}
        <div className="exhibitordashboard-declaration-content">
          {showDeclaration ? (
            <div className="declaration-container">
              <h3 className="declaration-heading">
                Exhibitor Declaration & Undertaking
              </h3>
              <ol className="declaration-list">
                {Array.isArray(declarationUndertakingData) &&
                  declarationUndertakingData.map((point, index) => (
                    <li key={index} className="declaration-item">
                      <span className="declaration-title">{point.title}:</span>
                      <span className="declaration-text"> {point.text}</span>
                    </li>
                  ))}
              </ol>
              <div className="checkbox-submit-section">
                <div className="checkbox-area">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <label htmlFor="agreeTerms" className="checkbox-label">
                    I/We hereby declare that I/We have read, understood, and
                    agree to abide by the terms and conditions.
                  </label>
                </div>
                <button
                  onClick={handleAgree}
                  className="btn btn-primary"
                  disabled={!agreed}
                  style={{ marginTop: "20px" }}
                >
                  Agree
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* DASHBOARD VIEW */}
              {!importantPage &&
                activeMenu === "Dashboard" &&
                exhibitorData && (
                  // <div className="exhibitordashboard-content">
                  //   <div className="exhibitordashboard-dashboard-grid">
                  //     <div className="exhibitordashboard-big-container">
                  //       <div className="exhibitordashboard-row">
                  //         <div className="exhibitordashboard-left-container">
                  //           <div className="exhibitordashboard-middle">
                  //             <div className="exhibitordashboard-card">
                  //               <div className="exhibitordashboard-section">
                  //                 <h3>Event Schedule</h3>
                  //                 {eventScheduleData.length === 0 ? (
                  //                   <p>No event schedule found.</p>
                  //                 ) : (
                  //                   <div className="event-schedule-description">
                  //                     <div
                  //                       dangerouslySetInnerHTML={{
                  //                         __html:
                  //                           eventScheduleData[0].description,
                  //                       }}
                  //                     />
                  //                   </div>
                  //                 )}
                  //               </div>
                  //             </div>
                  //           </div>

                  //           {/* Right container (Latest News) */}
                  //           <div className="exhibitordashboard-right">
                  //             <div className="exhibitordashboard-card">
                  //               <div className="exhibitordashboard-section">
                  //                 <h3>Latest News</h3>
                  //                 {latestNewsData.length === 0 ? (
                  //                   <p>No latest news available.</p>
                  //                 ) : (
                  //                   latestNewsData.map((item, index) => (
                  //                     <div key={index} className="news-item">
                  //                       <h4>{item.title}</h4>
                  //                       <p>{item.text}</p>
                  //                       {item.news_link && (
                  //                         <a
                  //                           href={item.news_link}
                  //                           target="_blank"
                  //                           rel="noopener noreferrer"
                  //                           className="news-link"
                  //                         >
                  //                           Read more →
                  //                         </a>
                  //                       )}
                  //                     </div>
                  //                   ))
                  //                 )}
                  //               </div>
                  //             </div>
                  //           </div>
                  //         </div>

                  //         {/* Right side: Exhibitor Checklist */}
                  //         <div className="exhibitordashboard-bottom">
                  //           <div className="exhibitordashboard-card">
                  //             <h3>Exhibitor Checklist</h3>

                  //             <div className="checklist-list">
                  //               {activities.map((item) => {
                  //                 const isDone = item.done;

                  //                 return (
                  //                   <div
                  //                     key={item.id}
                  //                     className={`checklist-row ${
                  //                       isDone ? "completed" : "pending"
                  //                     }`}
                  //                   >
                  //                     <div className="checklist-left">
                  //                       <span className="checklist-icon">
                  //                         {isDone ? "✓" : "!"}
                  //                       </span>

                  //                       <span className="checklist-name">
                  //                         {item.name}
                  //                       </span>
                  //                     </div>

                  //                     <span className="checklist-status">
                  //                       {isDone ? "Completed" : "Pending"}
                  //                     </span>
                  //                   </div>
                  //                 );
                  //               })}
                  //             </div>
                  //           </div>
                  //         </div>
                  //       </div>

                  //       <div className="exhibitordashboard-bottom">
                  //         <div className="exhibitordashboard-card">
                  //           <h2 className="particular-heading">
                  //             Exhibitor Payments Review
                  //           </h2>

                  //           {stallList.length === 0 ? (
                  //             <p className="profile-empty">
                  //               No stall details found.
                  //             </p>
                  //           ) : (
                  //             (() => {
                  //               const showSGST = stallList.some(
                  //                 (s) => parseFloat(s.sgst_9_percent) > 0,
                  //               );
                  //               const showCGST = stallList.some(
                  //                 (s) => parseFloat(s.cgst_9_percent) > 0,
                  //               );
                  //               const showIGST = stallList.some(
                  //                 (s) => parseFloat(s.igst_18_percent) > 0,
                  //               );

                  //               return (
                  //                 <table className="stall-payment-table">
                  //                   <thead>
                  //                     <tr>
                  //                       <th className="particular-col">
                  //                         Particular
                  //                       </th>
                  //                       <th>Price/sq mtr</th>
                  //                       <th>Amount</th>
                  //                       {showSGST && <th>SGST (9%)</th>}
                  //                       {showCGST && <th>CGST (9%)</th>}
                  //                       {showIGST && <th>IGST (18%)</th>}
                  //                       <th>Grand Total</th>
                  //                     </tr>
                  //                   </thead>
                  //                   <tbody>
                  //                     {stallList.map((stall, idx) => (
                  //                       <tr key={idx}>
                  //                         <td className="particular-cell">
                  //                           {`This is for the Stall Booking: Stall No: ${
                  //                             stall.stall_number || "N/A"
                  //                           }, Category: ${
                  //                             stall.stall_category || "N/A"
                  //                           }, Area: ${
                  //                             stall.stall_area
                  //                               ? `${stall.stall_area} sq. mtr`
                  //                               : "N/A"
                  //                           }`}
                  //                         </td>

                  //                         <td>
                  //                           {stall.stall_price
                  //                             ? `₹${stall.stall_price}`
                  //                             : "-"}
                  //                         </td>

                  //                         <td>
                  //                           {stall.total
                  //                             ? `₹${stall.total}`
                  //                             : "-"}
                  //                         </td>

                  //                         {showSGST && (
                  //                           <td>
                  //                             {parseFloat(
                  //                               stall.sgst_9_percent,
                  //                             ) > 0
                  //                               ? `₹${stall.sgst_9_percent}`
                  //                               : "-"}
                  //                           </td>
                  //                         )}
                  //                         {showCGST && (
                  //                           <td>
                  //                             {parseFloat(
                  //                               stall.cgst_9_percent,
                  //                             ) > 0
                  //                               ? `₹${stall.cgst_9_percent}`
                  //                               : "-"}
                  //                           </td>
                  //                         )}
                  //                         {showIGST && (
                  //                           <td>
                  //                             {parseFloat(
                  //                               stall.igst_18_percent,
                  //                             ) > 0
                  //                               ? `₹${stall.igst_18_percent}`
                  //                               : "-"}
                  //                           </td>
                  //                         )}

                  //                         <td className="grand-total-cell">
                  //                           {stall.grand_total
                  //                             ? `₹${stall.grand_total}`
                  //                             : "-"}
                  //                         </td>
                  //                       </tr>
                  //                     ))}

                  //                     {powerData.length > 0 &&
                  //                       (() => {
                  //                         const showSGST = stallList.some(
                  //                           (s) =>
                  //                             parseFloat(s.sgst_9_percent) > 0,
                  //                         );
                  //                         const showCGST = stallList.some(
                  //                           (s) =>
                  //                             parseFloat(s.cgst_9_percent) > 0,
                  //                         );
                  //                         const showIGST = stallList.some(
                  //                           (s) =>
                  //                             parseFloat(s.igst_18_percent) > 0,
                  //                         );

                  //                         const setup = powerData.find((p) =>
                  //                           p.day
                  //                             ?.toLowerCase()
                  //                             .includes("setup"),
                  //                         );
                  //                         const exhibition = powerData.find(
                  //                           (p) =>
                  //                             p.day
                  //                               ?.toLowerCase()
                  //                               .includes("exhibition"),
                  //                         );

                  //                         const calcTotals = (row) => {
                  //                           if (!row)
                  //                             return {
                  //                               amount: 0,
                  //                               sgst: 0,
                  //                               cgst: 0,
                  //                               igst: 0,
                  //                               grandTotal: 0,
                  //                             };

                  //                           const amount = parseFloat(
                  //                             row.total_amount || 0,
                  //                           );
                  //                           let sgst = 0,
                  //                             cgst = 0,
                  //                             igst = 0,
                  //                             grandTotal = amount;

                  //                           if (showSGST || showCGST) {
                  //                             sgst = amount * 0.09;
                  //                             cgst = amount * 0.09;
                  //                             grandTotal = amount + sgst + cgst;
                  //                           } else if (showIGST) {
                  //                             igst = amount * 0.18;
                  //                             grandTotal = amount + igst;
                  //                           }

                  //                           return {
                  //                             amount,
                  //                             sgst,
                  //                             cgst,
                  //                             igst,
                  //                             grandTotal,
                  //                           };
                  //                         };

                  //                         const setupTotals = calcTotals(setup);
                  //                         const exhibitionTotals =
                  //                           calcTotals(exhibition);

                  //                         return (
                  //                           <>
                  //                             <tr>
                  //                               <td className="particular-cell">
                  //                                 This is for Power Requirement{" "}
                  //                                 {setup?.day || "SETUP DAYS"} :{" "}
                  //                                 {setup?.power_required || 0}{" "}
                  //                                 Unit
                  //                               </td>
                  //                               <td>
                  //                                 {setup?.price_per_kw
                  //                                   ? `₹${setup.price_per_kw}`
                  //                                   : "-"}
                  //                               </td>
                  //                               <td>
                  //                                 {setupTotals.amount
                  //                                   ? `₹${setupTotals.amount.toFixed(
                  //                                       2,
                  //                                     )}`
                  //                                   : "-"}
                  //                               </td>
                  //                               {showSGST && (
                  //                                 <td>
                  //                                   {setupTotals.sgst
                  //                                     ? `₹${setupTotals.sgst.toFixed(
                  //                                         2,
                  //                                       )}`
                  //                                     : "-"}
                  //                                 </td>
                  //                               )}
                  //                               {showCGST && (
                  //                                 <td>
                  //                                   {setupTotals.cgst
                  //                                     ? `₹${setupTotals.cgst.toFixed(
                  //                                         2,
                  //                                       )}`
                  //                                     : "-"}
                  //                                 </td>
                  //                               )}
                  //                               {showIGST && (
                  //                                 <td>
                  //                                   {setupTotals.igst
                  //                                     ? `₹${setupTotals.igst.toFixed(
                  //                                         2,
                  //                                       )}`
                  //                                     : "-"}
                  //                                 </td>
                  //                               )}
                  //                               <td className="grand-total-cell">
                  //                                 {setupTotals.grandTotal
                  //                                   ? `₹${setupTotals.grandTotal.toFixed(
                  //                                       2,
                  //                                     )}`
                  //                                   : "-"}
                  //                               </td>
                  //                             </tr>

                  //                             <tr>
                  //                               <td className="particular-cell">
                  //                                 This is for Power Requirement{" "}
                  //                                 {exhibition?.day ||
                  //                                   "EXHIBITION DAYS"}{" "}
                  //                                 :{" "}
                  //                                 {exhibition?.power_required ||
                  //                                   0}{" "}
                  //                                 Unit
                  //                               </td>
                  //                               <td>
                  //                                 {exhibition?.price_per_kw
                  //                                   ? `₹${exhibition.price_per_kw}`
                  //                                   : "-"}
                  //                               </td>
                  //                               <td>
                  //                                 {exhibitionTotals.amount
                  //                                   ? `₹${exhibitionTotals.amount.toFixed(
                  //                                       2,
                  //                                     )}`
                  //                                   : "-"}
                  //                               </td>
                  //                               {showSGST && (
                  //                                 <td>
                  //                                   {exhibitionTotals.sgst
                  //                                     ? `₹${exhibitionTotals.sgst.toFixed(
                  //                                         2,
                  //                                       )}`
                  //                                     : "-"}
                  //                                 </td>
                  //                               )}
                  //                               {showCGST && (
                  //                                 <td>
                  //                                   {exhibitionTotals.cgst
                  //                                     ? `₹${exhibitionTotals.cgst.toFixed(
                  //                                         2,
                  //                                       )}`
                  //                                     : "-"}
                  //                                 </td>
                  //                               )}
                  //                               {showIGST && (
                  //                                 <td>
                  //                                   {exhibitionTotals.igst
                  //                                     ? `₹${exhibitionTotals.igst.toFixed(
                  //                                         2,
                  //                                       )}`
                  //                                     : "-"}
                  //                                 </td>
                  //                               )}
                  //                               <td className="grand-total-cell">
                  //                                 {exhibitionTotals.grandTotal
                  //                                   ? `₹${exhibitionTotals.grandTotal.toFixed(
                  //                                       2,
                  //                                     )}`
                  //                                   : "-"}
                  //                               </td>
                  //                             </tr>
                  //                           </>
                  //                         );
                  //                       })()}
                  //                   </tbody>
                  //                 </table>
                  //               );
                  //             })()
                  //           )}
                  //         </div>
                  //       </div>
                  //     </div>
                  //   </div>
                  // </div>

                  <ExhibitorDashboardOverview
                    importantPage={importantPage}
                    activeMenu={activeMenu}
                    exhibitorData={exhibitorData}
                    eventScheduleData={eventScheduleData}
                    latestNewsData={latestNewsData}
                    activities={activities}
                    stallList={stallList}
                    powerData={powerData}
                  />
                )}

              {activeMenu === "Mails Inbox" && (
                <div className="ExhibitorMails-instruction-container">
                  <div className="ExhibitorMails-instruction-header">
                    <h3 className="ExhibitorMails-instruction-heading">
                      INBOX
                    </h3>
                  </div>

                  <div className="ExhibitorMails-instruction-body">
                    {/* Left Panel - Mail List */}
                    <div className="mail-list-panel">
                      {loadingMails ? (
                        <p className="mail-status-text">Loading mails...</p>
                      ) : mailsList.length === 0 ? (
                        <p className="mail-status-text">No mails sent yet.</p>
                      ) : (
                        mailsList.map((mail) => (
                          <div
                            key={mail.id}
                            className={`mail-list-item ${
                              selectedMail?.id === mail.id ? "selected" : ""
                            }`}
                            onClick={() => handleMailClick(mail)}
                          >
                            <div className="mail-list-header">
                              <h4
                                className={`mail-subject ${
                                  mail.is_read == 0 ? "unread" : ""
                                }`}
                              >
                                {mail.subject}
                              </h4>
                              {mail.is_read == 0 && (
                                <span className="mail-new-badge">New</span>
                              )}
                            </div>
                            <small className="mail-date">
                              {new Date(mail.sent_at).toLocaleString()}
                            </small>
                            <p
                              className={`mail-snippet ${
                                mail.is_read == 0 ? "unread" : ""
                              }`}
                              dangerouslySetInnerHTML={{
                                __html:
                                  mail.content.length > 80
                                    ? mail.content.substring(0, 80) + "..."
                                    : mail.content,
                              }}
                            />
                          </div>
                        ))
                      )}
                    </div>

                    {/* Right Panel - Selected Mail */}
                    <div className="mail-view-panel">
                      {selectedMail ? (
                        <>
                          <h2 className="mail-view-subject">
                            {selectedMail.subject}
                          </h2>
                          <small className="mail-view-date">
                            {new Date(selectedMail.sent_at).toLocaleString()}
                          </small>
                          <div
                            className="mail-view-content"
                            dangerouslySetInnerHTML={{
                              __html: selectedMail.content,
                            }}
                          />
                        </>
                      ) : (
                        <p className="mail-view-placeholder">
                          Select a mail to view
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {importantPage === "Instructions" && (
                <div className="ExhibitorInstruction-instruction-container">
                  <div className="ExhibitorInstruction-instruction-header">
                    <h3 className="ExhibitorInstruction-instruction-heading">
                      INSTRUCTION
                    </h3>
                  </div>
                  <div className="instruction-body">
                    {instructionsList.length === 0 ? (
                      <p>No instructions added.</p>
                    ) : (
                      <div className="instruction-content">
                        <div
                          className="editor-content"
                          dangerouslySetInnerHTML={{
                            __html: instructionsList[0].content,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {importantPage === "Rules" && (
                <div className="ExhibitorRules-instruction-container">
                  <div className="ExhibitorRules-instruction-header">
                    <h3 className="ExhibitorRules-instruction-heading">
                      RULES & POLICY
                    </h3>
                  </div>
                  <div className="ExhibitorRules-instruction-body">
                    {rulesList.length === 0 ? (
                      <p>No rules added.</p>
                    ) : (
                      <div className="ExhibitorRules-content">
                        <div
                          className="editor-content"
                          dangerouslySetInnerHTML={{ __html: rulesList[0] }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {importantPage === "Exhibition Map" && (
                <div className="ExhibitorMap-instruction-container">
                  <div className="ExhibitorMap-instruction-header">
                    <h3 className="ExhibitorMap-instruction-heading">
                      EXHIBITION MAP
                    </h3>
                  </div>

                  <div className="ExhibitorMap-instruction-body">
                    {exhibitionData.length === 0 ? (
                      <p>No exhibition map added.</p>
                    ) : (
                      <div className="ExhibitorMap-content">
                        <div className="editor-content">
                          <img
                            src={exhibitionData[0]?.image}
                            alt="Exhibition Map"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/800x600?text=Map+Not+Found";
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {importantPage === "Guidelines" && (
                <div className="ExhibitorGuide-instruction-container">
                  <div className="ExhibitorGuide-instruction-header">
                    <h3 className="ExhibitorGuide-instruction-heading">
                      CONTRACTOR GUIDELINE
                    </h3>
                  </div>

                  <div className="ExhibitorGuide-instruction-body">
                    {guidelinesList.length === 0 ? (
                      <p>No guidelines added.</p>
                    ) : (
                      <div className="ExhibitorGuide-content">
                        <div
                          className="editor-content"
                          dangerouslySetInnerHTML={{
                            __html: guidelinesList[0],
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!importantPage && activeMenu === "Profile" && (
                <div className="profile-content">
                  <div className="profile-layout">
                    {/* LEFT SIDE (Personal + Stall stacked) */}
                    <div className="profile-left">
                      {/* Personal Details */}
                      <div className="profile-card">
                        <div className="profile-section">
                          <h3 className="profile-section-title">
                            Personal Details
                          </h3>
                          {exhibitors.length === 0 ? (
                            <p className="profile-empty">
                              No exhibitors found.
                            </p>
                          ) : (
                            exhibitors.map((exhibitor) => (
                              <div
                                key={exhibitor.id}
                                className="profile-details-grid"
                              >
                                <div className="profile-details-row">
                                  <label>Company Name:</label>
                                  <span>{exhibitor.company_name || "-"}</span>
                                </div>
                                <div className="profile-details-row">
                                  <label>Name:</label>
                                  <span>{exhibitor.name || "-"}</span>
                                </div>
                                <div className="profile-details-row">
                                  <label>Address:</label>
                                  <span>{exhibitor.address || "N/A"}</span>
                                </div>
                                <div className="profile-details-row">
                                  <label>City:</label>
                                  <span>{exhibitor.city || "N/A"}</span>
                                </div>
                                <div className="profile-details-row">
                                  <label>State:</label>
                                  <span>{exhibitor.state || "N/A"}</span>
                                </div>
                                <div className="profile-details-row">
                                  <label>Pincode:</label>
                                  <span>{exhibitor.pin || "N/A"}</span>
                                </div>
                                <div className="profile-details-row">
                                  <label>Mobile No:</label>
                                  <span>{exhibitor.mobile || "N/A"}</span>
                                </div>
                                <div className="profile-details-row">
                                  <label>Email:</label>
                                  <span>{exhibitor.email || "-"}</span>
                                </div>
                                <div className="profile-details-row">
                                  <label>GST:</label>
                                  <span>{exhibitor.gst || "N/A"}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Stall Details */}
                      <div className="profile-card">
                        <div className="profile-section">
                          <h3 className="profile-section-title">
                            Stall Details
                          </h3>
                          {stallList.length === 0 ? (
                            <p className="profile-empty">
                              No stall details found.
                            </p>
                          ) : (
                            stallList.map((stall, idx) => (
                              <div key={idx} className="profile-details-grid">
                                <div className="profile-details-row">
                                  <label>Stall Number:</label>
                                  <span>{stall.stall_number || "N/A"}</span>
                                </div>
                                <div className="profile-details-row">
                                  <label>Stall Category:</label>
                                  <span>{stall.stall_category || "N/A"}</span>
                                </div>
                                <div className="profile-details-row">
                                  <label>Stall Price:</label>
                                  <span>
                                    {stall.stall_price
                                      ? `₹${stall.stall_price}`
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="profile-details-row">
                                  <label>Stall Area:</label>
                                  <span>
                                    {stall.stall_area
                                      ? `${stall.stall_area} sq. ft.`
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE (Brand Container) */}
                    <div className="profile-right">
                      <div className="profile-card">
                        <div className="profile-section">
                          <h3 className="profile-section-title">
                            Brand Container
                          </h3>
                          <p className="profile-empty">
                            Brand details or logo can go here.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {importantPage === "Furniture Requirements" && (
                <div className="furniture-requirements-container">
                  {/* Furniture List Modal */}
                  {showFurnitureList && (
                    <div className="furniture-modal-overlay">
                      <div className="furniture-modal-content">
                        <div className="furniture-modal-header">
                          <h2>Furniture List</h2>
                          <button
                            className="furniture-modal-close-btn"
                            onClick={() => setShowFurnitureList(false)}
                          >
                            ×
                          </button>
                        </div>
                        <div className="furniture-modal-body">
                          <div className="furniture-grid">
                            {furnitureData.length === 0 ? (
                              <p>No furniture available.</p>
                            ) : (
                              furnitureData
                                .sort((a, b) => {
                                  const piA = parseInt(
                                    a.name.match(/PI-(\d+)/)?.[1] || 0,
                                  );
                                  const piB = parseInt(
                                    b.name.match(/PI-(\d+)/)?.[1] || 0,
                                  );
                                  return piA - piB;
                                })
                                .map((item) => {
                                  const alreadySelected =
                                    selectedFurniture.some(
                                      (f) => f.id === item.id,
                                    );
                                  return (
                                    <div
                                      className="furniture-card"
                                      key={item.id}
                                    >
                                      <img
                                        src={`https://www.inoptics.in/api/uploads/${item.image}`}
                                        alt={item.name}
                                        className="furniture-card-img"
                                      />
                                      <div className="furniture-card-name">
                                        {item.name}
                                      </div>
                                      <div className="furniture-card-price">
                                        ₹{item.price}
                                      </div>
                                      {alreadySelected ? (
                                        <button
                                          className="btn-selected"
                                          disabled
                                        >
                                          Selected
                                        </button>
                                      ) : (
                                        <button
                                          className="btn-select"
                                          onClick={() =>
                                            setSelectedFurniture([
                                              ...selectedFurniture,
                                              { ...item, quantity: 1 },
                                            ])
                                          }
                                        >
                                          Select
                                        </button>
                                      )}
                                    </div>
                                  );
                                })
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Layout */}
                  <div className="furniture-main-layout">
                    {/* Table Section */}
                    <div className="furniture-table-section">
                      <table className="furniture-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            {!isFurnitureSaved && <th>Action</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedFurniture.length > 0 ? (
                            selectedFurniture.map((item, index) => (
                              <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td>
                                  <img
                                    src={`https://www.inoptics.in/api/uploads/${item.image}`}
                                    alt={item.name}
                                    className="furniture-table-img"
                                  />
                                </td>
                                <td>{item.name}</td>
                                <td>₹{item.price}</td>
                                <td>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity || 1}
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        index,
                                        e.target.value,
                                      )
                                    }
                                    className="furniture-qty-input"
                                    disabled={isFurnitureSaved}
                                  />
                                </td>
                                <td>
                                  ₹
                                  {item.quantity
                                    ? (item.quantity * item.price).toFixed(2)
                                    : "0.00"}
                                </td>
                                {!isFurnitureSaved && (
                                  <td>
                                    <button
                                      className="btn-delete"
                                      onClick={() =>
                                        setSelectedFurniture(
                                          selectedFurniture.filter(
                                            (_, i) => i !== index,
                                          ),
                                        )
                                      }
                                    >
                                      Delete
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={isFurnitureSaved ? 6 : 7}
                                className="furniture-empty-msg"
                              >
                                No furniture selected yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Billing Section */}
                    <div className="furniture-billing-section">
                      <div className="furniture-action-btn">
                        <button
                          onClick={() => setShowFurnitureList(true)}
                          disabled={isFurnitureSaved}
                        >
                          Add Furniture
                        </button>

                        {!isFurnitureSaved ? (
                          <button
                            onClick={async () => {
                              await updateSelectedFurniture(
                                currentExhibitor?.company_name,
                                selectedFurniture,
                              );
                              await handleSendFurnitureMail(
                                "InOptics 2026 @ Extra Furniture Request Confirmation",
                              );
                              setIsFurnitureSaved(true);
                            }}
                            style={{
                              marginLeft: "10px",
                              background: "#4caf50",
                              color: "#fff",
                            }}
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={handleUnlockRequestMail}
                            style={{
                              marginLeft: "10px",
                              background: "#ff9800",
                              color: "#fff",
                            }}
                          >
                            Unlock Request
                          </button>
                        )}
                      </div>

                      <h3>Particulars</h3>
                      <div className="furniture-billing-details">
                        <div>
                          <span>Total</span>
                          <span>
                            ₹{furnitureBilling.amount?.toFixed(2) || "0.00"}
                          </span>
                        </div>

                        {currentExhibitor?.state?.toLowerCase() === "delhi" ? (
                          <>
                            <div>
                              <span>CGST (9%)</span>
                              <span>
                                ₹{furnitureBilling.cgst?.toFixed(2) || "0.00"}
                              </span>
                            </div>
                            <div>
                              <span>SGST (9%)</span>
                              <span>
                                ₹{furnitureBilling.sgst?.toFixed(2) || "0.00"}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div>
                            <span>IGST (18%)</span>
                            <span>
                              ₹{furnitureBilling.igst?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        )}

                        <hr />
                        <div className="furniture-grand-total">
                          <span>GRAND TOTAL</span>
                          <span>
                            ₹{furnitureBilling.grandTotal?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>

                      {/* Vendor Instructions */}
                      <div className="furniture-instruction">
                        {furnitureVendorDetails.length > 0 ? (
                          furnitureVendorDetails.map((vendor) => (
                            <div
                              key={vendor.id}
                              dangerouslySetInnerHTML={{
                                __html: vendor.description,
                              }}
                              style={{
                                fontSize: "15px",
                                lineHeight: "1.8",
                                fontFamily: "Segoe UI",
                                textAlign: "left",
                                marginTop: "10px",
                                color: "#333",
                              }}
                            />
                          ))
                        ) : (
                          <p
                            style={{
                              fontStyle: "italic",
                              marginBottom: "10px",
                            }}
                          >
                            Loading vendor details...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {importantPage === "Power Requirement" && currentExhibitor && (
                <>
                  {/* Wrapper for Progress + Form */}
                  <div className="Exhibitor-power-requirement-wrapper">
                    {/* Left Side Form Section */}
                    <div className="Exhibitor-power-requirement-form-left">
                      {/* Progress Bar */}
                      <ul id="Exhibitor-progressbar">
                        {["SETUP DAYS", "EXHIBITION DAYS"].map(
                          (type, index) => (
                            <li
                              key={type}
                              className={index <= powerFormStep ? "active" : ""}
                            >
                              {type}
                            </li>
                          ),
                        )}
                      </ul>

                      {/* Sliding Forms Container */}
                      <ExhibitorPowerForm
                        exhibitorPricePerKw={exhibitorPricePerKw}
                        isViewOnly={isViewOnly}
                        setPowerFormStep={setPowerFormStep} // ✅ new prop
                        powerFormStep={powerFormStep}
                        exhibitorPowerRequired={exhibitorPowerRequired}
                        exhibitorPhase={exhibitorPhase}
                        exhibitorTotalAmount={exhibitorTotalAmount}
                        onPowerChange={handlePowerFormPowerChange}
                        onPhaseChange={handlePowerFormPhaseChange}
                        onNext={handlePowerFormNext}
                        onPrevious={handlePowerFormPrevious}
                        onAdd={handlePowerFormAdd}
                      />
                    </div>

                    {/* Right Side Instructions */}
                    <div className="Exhibitor-power-requirement-instruction-box">
                      <div className="Exhibitor-power-requirement-top-buttons-inside-box">
                        {/* If form is editable → show Submit button */}
                        {!isViewOnly ? (
                          <button
                            className="Exhibitor-power-btn submit-btn"
                            onClick={handleExhibitorPowerSubmit}
                          >
                            {showExhibitorEditForm ? "Update" : "Submit"}
                          </button>
                        ) : (
                          /* If form is locked → show Unlock Request button */
                          <button
                            className="Exhibitor-power-btn unlock-request-btn"
                            onClick={handlePowerUnlockRequest}
                          >
                            Request to Unlock
                          </button>
                        )}
                      </div>

                      <h3>Power Requirement Guidelines</h3>
                      <ul>
                        <li>
                          Power requirements for setup days and exhibition days
                          must be submitted separately.
                        </li>
                        <li>
                          Power will be arranged as per the requirement form.
                          Requests made after 28th Feb 2026 may incur additional
                          charges.
                        </li>
                        <li>
                          If unsure, consult your fabricator for accurate
                          requirements.
                        </li>
                        <li>
                          Ensure your contractor uses quality wiring — extra
                          usage may incur charges.
                        </li>
                        <li>Thank you for your cooperation.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Table + Billing Section */}
                  {/* Table + Billing Section */}
                  <div className="Exhibitor-power-requirement-below-section">
                    <div className="Exhibitor-power-requirement-table-container">
                      <table className="Exhibitor-power-requirement-table">
                        <thead>
                          <tr>
                            <th>Days</th>
                            <th>Price per KW</th>
                            <th>Power Required</th>
                            <th>Phase</th>
                            <th>Total Amount</th>
                            {!isViewOnly && <th>Action</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {previewTableList.length > 0 && !isViewOnly ? (
                            <>
                              {previewTableList.map((item, index) => (
                                <tr key={index}>
                                  <td>{item.day}</td>
                                  <td>{item.pricePerKw}</td>
                                  <td>{item.powerRequired}</td>
                                  <td>{item.phase}</td>
                                  <td>{item.totalAmount}</td>
                                  {index === 0 && ( // 👈 Only show remove button on first row
                                    <td rowSpan={previewTableList.length}>
                                      <button
                                        type="button"
                                        onClick={handleResetPowerData}
                                        className="Exhibitor-Power-remove-btn"
                                      >
                                        Remove
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </>
                          ) : powerData.length > 0 ? (
                            powerData.map((item, i) => (
                              <tr key={i}>
                                <td>{item.day}</td>
                                <td>{item.price_per_kw}</td>
                                <td>{item.power_required}</td>
                                <td>{item.phase}</td>
                                <td>{item.total_amount}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="6"
                                style={{
                                  textAlign: "center",
                                  color: "#e5e9ee",
                                }}
                              >
                                No data to display
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="Exhibitor-power-requirement-billing">
                      <h3>Power Requirement Billing</h3>
                      <div className="Exhibitor-power-requirement-stalls-forms-group">
                        <span className="Exhibitor-power-label">Company:</span>
                        <strong>{currentExhibitor.company_name || "-"}</strong>
                      </div>
                      <div className="Exhibitor-power-requirement-stalls-forms-group">
                        <span className="Exhibitor-power-label">State:</span>
                        <strong>{currentExhibitor.state || "N/A"}</strong>
                      </div>
                      <div className="Exhibitor-power-requirement-stalls-forms-group">
                        <span className="Exhibitor-power-label">
                          Total Price:
                        </span>
                        <strong>{totalPrice.toFixed(2)} ₹</strong>
                      </div>

                      {currentExhibitor.state?.toLowerCase() === "delhi" ? (
                        <>
                          <div className="Exhibitor-power-requirement-stalls-forms-group">
                            <span className="Exhibitor-power-label">
                              CGST (9%):
                            </span>
                            <strong>{cgst.toFixed(2)} ₹</strong>
                          </div>
                          <div className="Exhibitor-power-requirement-stalls-forms-group">
                            <span className="Exhibitor-power-label">
                              SGST (9%):
                            </span>
                            <strong>{sgst.toFixed(2)} ₹</strong>
                          </div>
                        </>
                      ) : (
                        <div className="Exhibitor-power-requirement-stalls-forms-group">
                          <span className="Exhibitor-power-label">
                            IGST (18%):
                          </span>
                          <strong>{igst.toFixed(2)} ₹</strong>
                        </div>
                      )}

                      <div className="Exhibitor-power-requirement-stalls-forms-group total">
                        <span className="Exhibitor-power-label">
                          Grand Total:
                        </span>
                        <strong>{grandTotal.toFixed(2)} ₹</strong>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="contractor-ui-root">
                {/* YOUR EXISTING JSX BELOW */}
                {!importantPage && activeMenu === "Contractors" && (
                  <div className="contractor-ui-body">
                    {!importantPage && activeMenu === "Contractors" && (
                      <div className="ExhibitorContractors-root">
                        {showPopup && (
                          <div className="ContractorPopup-overlay">
                            <div className="ContractorPopup-box">
                              <h3>Confirm Contractor Selection</h3>
                              <p>
                                Are you sure you would like to proceed with
                                <strong>
                                  {" "}
                                  {selectedContractorTemp?.company_name}{" "}
                                </strong>
                                as your booth contractor?
                                <p>
                                  {" "}
                                  <strong>
                                    Please note that once the contractor is
                                    confirmed, the selection will be locked and
                                    cannot be changed. If you wish to make any
                                    changes later, an unlock request will need
                                    to be submitted from the next page.
                                  </strong>
                                </p>
                              </p>

                              <div className="ContractorPopup-buttons">
                                <button
                                  className="PopupCancelBtn"
                                  onClick={cancelSelect}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="PopupOkBtn"
                                  onClick={confirmSelect}
                                >
                                  OK
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* NEW: Contractor List Overlay (view only, no action column) */}
                        {showContractorListOverlay && (
                          <div
                            className="ContractorListOverlay-overlay"
                            onClick={() => setShowContractorListOverlay(false)}
                          >
                            <div
                              className="ContractorListOverlay-box"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <h3>Contractor List</h3>
                              <button
                                className="ContractorListOverlay-close"
                                onClick={() =>
                                  setShowContractorListOverlay(false)
                                }
                              >
                                ×
                              </button>

                              <div className="ExhibitorContractors-appointed-contractor-wrapper overlay-table-wrapper">
                                <div className="ExhibitorContractors-exhibitor-cont-table-container">
                                  <table className="ExhibitorContractors-appointed-contractor-table">
                                    <thead>
                                      <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Company Name</th>
                                        <th>City</th>
                                        <th>Phn/Mob No</th>
                                        <th>Email</th>
                                        <th>Action</th>
                                      </tr>
                                    </thead>

                                    <tbody>
                                      {contractorData.map(
                                        (contractor, index) => (
                                          <tr key={contractor.id}>
                                            <td>{index + 1}</td>
                                            <td>{contractor.name}</td>
                                            <td>{contractor.company_name}</td>
                                            <td>{contractor.city}</td>
                                            <td>
                                              {contractor.mobile_numbers}
                                              {contractor.phone_numbers
                                                ? `, ${contractor.phone_numbers}`
                                                : ""}
                                            </td>
                                            <td>{contractor.email}</td>

                                            <td>
                                              {selectedContractorId ===
                                              contractor.id ? (
                                                <button
                                                  className="ExhibitorContractors-unselect-btn"
                                                  onClick={unselectContractor}
                                                >
                                                  Unselect
                                                </button>
                                              ) : (
                                                <button
                                                  className="ExhibitorContractors-select-btn"
                                                  onClick={() => {
                                                    setSelectedContractorTemp(
                                                      contractor,
                                                    );
                                                    setShowPopup(true);
                                                  }}
                                                  disabled={
                                                    !!selectedContractorId
                                                  }
                                                >
                                                  Select
                                                </button>
                                              )}
                                            </td>
                                          </tr>
                                        ),
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="ExhibitorContractors-main-split">
                          <div className="ExhibitorContractors-leftContainer">
                            <div
                              className={`left-layer original-left-layer ${
                                workflowActive ? "slide-out-left" : "visible"
                              }`}
                            >
                              <div className="ExhibitorContractors-left-top-row">
                                <div className="ExhibitorContractors-left-top-item">
                                  <h2 className="ExhibitorContractors-heading">
                                    Contractor Selection <br />& Registration
                                    Process
                                  </h2>
                                  <ul className="ExhibitorContractors-points">
                                    <li>
                                      This section outlines the first step in
                                      completing the contractor undertaking
                                      process. Kindly follow the instructions
                                      below to ensure a smooth and timely
                                      submission.
                                    </li>
                                    <li>
                                      Exhibitors may select a contractor of
                                      their choice from the approved contractor
                                      list displayed on the right-hand side of
                                      the portal.
                                    </li>
                                    <li>
                                      If an exhibitor wishes to engage a
                                      contractor who is not listed, the
                                      contractor must first complete a
                                      registration process. A one-time
                                      contractor registration fee of ₹10,000 per
                                      exhibition will be applicable.
                                    </li>
                                    <li>
                                      Once a contractor is selected, the
                                      selection will be treated as final. Any
                                      request to change the selected contractor
                                      at a later stage will require a formal
                                      unlock request for approval.
                                    </li>
                                    <li>
                                      To add a new contractor to the system,
                                      exhibitors may send the contractor a
                                      registration request via email using the
                                      field provided below.
                                    </li>
                                    <li>
                                      After the contractor selection is
                                      completed, the form will automatically
                                      proceed to the second step of the
                                      submission process.
                                    </li>
                                  </ul>

                                  <label className="ExhibitorContractors-email-label">
                                    Send Your Unregistered Contractor Email ID:
                                  </label>

                                  <div className="ExhibitorContractors-email-row">
                                    <input
                                      type="email"
                                      placeholder="Enter contractor email"
                                      value={contractorEmail}
                                      onChange={(e) =>
                                        setContractorEmail(e.target.value)
                                      }
                                      className="ExhibitorContractors-email-input"
                                    />
                                    <button
                                      className="ExhibitorContractors-email-submit-btn"
                                      onClick={() =>
                                        handleSendRegistrationMail(
                                          contractorEmail,
                                        )
                                      }
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div
                              className={`left-layer workflow-left-layer ${
                                workflowActive ? "slide-in-right" : "hidden"
                              }`}
                            >
                              {/* NEW TOP ACTION BAR */}
                              <div className="workflow-left-top-actions">
                                <button
                                  className="unlock-btn"
                                  onClick={requestContractorChange}
                                >
                                  <span className="btn-icon">
                                    <FaLockOpen className="btn-icon" /> Unlock
                                  </span>
                                </button>

                                <button
                                  className="view-list-btn"
                                  onClick={() =>
                                    setShowContractorListOverlay(true)
                                  }
                                >
                                  <span className="btn-icon">
                                    <FaEye className="btn-icon" />
                                    View Contractor List
                                  </span>
                                </button>

                                {Object.values(uploadedFiles).some(Boolean) && (
                                  <button
                                    className="view-uploaded-btn"
                                    onClick={() => {
                                      const firstAvailable = uploadedFiles.step1
                                        ? "step1"
                                        : uploadedFiles.step2
                                          ? "step2"
                                          : "step3";

                                      setSelectedPreviewStep(firstAvailable);
                                      setPdfUrl(
                                        `https://inoptics.in/api/${uploadedFiles[firstAvailable]}`,
                                      );
                                      setShowPdfPreview(true);
                                    }}
                                  >
                                    <FaCloudUploadAlt className="btn-icon" />{" "}
                                    View Uploads
                                  </button>
                                )}

                                {showPdfPreview && (
                                  <div className="pdf-preview-overlay">
                                    <div className="pdf-preview-card small-card">
                                      {/* Header */}
                                      <div className="pdf-preview-header">
                                        <h5>Uploaded Forms</h5>
                                        <button
                                          onClick={() =>
                                            setShowPdfPreview(false)
                                          }
                                          className="form-icon-close"
                                        >
                                          ✖
                                        </button>
                                      </div>

                                      {/* File List */}
                                      <div className="uploaded-file-list">
                                        {uploadedFiles.step1 && (
                                          <div className="uploaded-file-row">
                                            <span>
                                              Exhibitor Confirmation & Form
                                              Upload
                                            </span>
                                            <div className="file-actions">
                                              <button
                                                className="form-icon"
                                                onClick={() =>
                                                  forceDownload(
                                                    uploadedFiles.step1,
                                                  )
                                                }
                                                title="Download"
                                              >
                                                <FaDownload />
                                              </button>
                                            </div>
                                          </div>
                                        )}

                                        {uploadedFiles.step2 && (
                                          <div className="uploaded-file-row">
                                            <span>
                                              Mandatory Contractor Undertaking
                                              Form
                                            </span>
                                            <div className="file-actions">
                                              <button
                                                className="form-icon"
                                                onClick={() =>
                                                  forceDownload(
                                                    uploadedFiles.step2,
                                                  )
                                                }
                                                title="Download"
                                              >
                                                <FaDownload />
                                              </button>
                                            </div>
                                          </div>
                                        )}

                                        {uploadedFiles.step3 && (
                                          <div className="uploaded-file-row">
                                            <span>
                                              Booth Dimensions & Construction
                                              Guidelines
                                            </span>
                                            <div className="file-actions">
                                              <button
                                                className="form-icon"
                                                onClick={() =>
                                                  forceDownload(
                                                    uploadedFiles.step3,
                                                  )
                                                }
                                                title="Download"
                                              >
                                                <FaDownload />
                                              </button>
                                            </div>
                                          </div>
                                        )}

                                        {!uploadedFiles.step1 &&
                                          !uploadedFiles.step2 &&
                                          !uploadedFiles.step3 && (
                                            <p
                                              style={{
                                                textAlign: "center",
                                                color: "#777",
                                              }}
                                            >
                                              No forms uploaded yet
                                            </p>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="workflow-left-flex-row">
                                <div className="selected-contractor-container">
                                  <h2 className="ExhibitorContractors-heading">
                                    Selected Contractor
                                  </h2>
                                  <div className="selected-contractor-container-box">
                                    <p>
                                      <strong>Company Name:</strong>{" "}
                                    </p>
                                    <p>{selectedContractor?.company_name}</p>
                                  </div>
                                  <div className="selected-contractor-container-box">
                                    <p>
                                      <strong>Name:</strong>
                                    </p>
                                    <p>{selectedContractor?.name}</p>
                                  </div>
                                  <div className="selected-contractor-container-box">
                                    <p>
                                      <strong>City:</strong>
                                    </p>
                                    <p>{selectedContractor?.city}</p>
                                  </div>
                                  <div className="selected-contractor-container-box">
                                    <p>
                                      <strong>Phone/Mobile:</strong>{" "}
                                    </p>
                                    <p>
                                      {selectedContractor?.mobile_numbers}
                                      {selectedContractor?.phone_numbers
                                        ? `, ${selectedContractor?.phone_numbers}`
                                        : ""}
                                    </p>
                                  </div>
                                  <div className="selected-contractor-container-box">
                                    <p>
                                      <strong>Email:</strong>{" "}
                                    </p>
                                    <p>{selectedContractor?.email}</p>
                                  </div>
                                </div>

                                {/* Left: NEW INSTRUCTION CONTAINER */}
                                <div className="exhibitor-instruction-box-checklist">
                                  <div className="exhibitor-instruction-header">
                                    <h4>Contractor Checklist</h4>
                                  </div>

                                  <div className="exhibitorInstructions-container">
                                    {/* LEFT — Steps */}
                                    <div className="Workflow-progress">
                                      <div
                                        className={`wf-step ${
                                          currentStep >= 0 ? "active" : ""
                                        }`}
                                      >
                                        <div className="wf-step-num">1</div>
                                      </div>
                                      <div
                                        className={`wf-step ${
                                          currentStep >= 1 ? "active" : ""
                                        }`}
                                      >
                                        <div className="wf-step-num">2</div>
                                      </div>
                                      <div
                                        className={`wf-step ${
                                          currentStep >= 2 ? "active" : ""
                                        }`}
                                      >
                                        <div className="wf-step-num">3</div>
                                      </div>
                                      <div
                                        className={`wf-step ${
                                          currentStep >= 3 ? "active" : ""
                                        }`}
                                      >
                                        <div className="wf-step-num">4</div>
                                      </div>
                                    </div>

                                    {/* RIGHT — Step content */}
                                    <div className="exhibitorinsructionchecklist-box">
                                      <div className="exhibitorInstructions-content-box">
                                        <h2 className="ExhibitorContractors-heading-checklist">
                                          Conatractor Selection
                                        </h2>
                                      </div>

                                      <div className="exhibitorInstructions-content-box">
                                        <h2 className="ExhibitorContractors-heading-checklist">
                                          Exhibitor - Appointed Contrator
                                        </h2>
                                      </div>

                                      <div className="exhibitorInstructions-content-box">
                                        <h2 className="ExhibitorContractors-heading-checklist">
                                          Contractor Undertaking Declaration
                                        </h2>
                                      </div>
                                      <div className="exhibitorInstructions-content-box">
                                        <h2 className="ExhibitorContractors-heading-checklist">
                                          Upload Designs & Documents
                                        </h2>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="ExhibitorContractors-rightContainer">
                            {/* Original Layer - Register Unlisted Contractor */}
                            <div
                              className={`right-layer original-layer ${
                                workflowActive ? "slide-out-right" : "visible"
                              }`}
                            >
                              <div className="ExhibitorContractors-exhibitor-cont-table-container">
                                <table className="ExhibitorContractors-appointed-contractor-table">
                                  <thead>
                                    <tr>
                                      <th>ID</th>
                                      <th>Company Name</th>
                                      <th>Name</th>
                                      <th>City</th>
                                      <th>Phn/Mob No</th>
                                      <th>Email</th>
                                      <th>Action</th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {contractorData.map((contractor, index) => (
                                      <tr key={contractor.id}>
                                        <td>{index + 1}</td>
                                        <td>{contractor.company_name}</td>
                                        <td>{contractor.name}</td>
                                        <td>{contractor.city}</td>
                                        <td>
                                          {contractor.mobile_numbers}
                                          {contractor.phone_numbers
                                            ? `, ${contractor.phone_numbers}`
                                            : ""}
                                        </td>
                                        <td>{contractor.email}</td>

                                        <td>
                                          {selectedContractorId ===
                                          contractor.id ? (
                                            <button
                                              className="ExhibitorContractors-unselect-btn"
                                              onClick={unselectContractor}
                                            >
                                              Unselect
                                            </button>
                                          ) : (
                                            <button
                                              className="ExhibitorContractors-select-btn"
                                              onClick={() => {
                                                setSelectedContractorTemp(
                                                  contractor,
                                                );
                                                setShowPopup(true);
                                              }}
                                              disabled={!!selectedContractorId}
                                            >
                                              Select
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Workflow Layer */}
                            <div
                              className={`right-layer workflow-layer ${
                                workflowActive ? "slide-in-left" : "hidden"
                              }`}
                            >
                              {/* Warning Popup */}

                              {showPreview && (
                                <div className="Workflow-warning-popup-overlay">
                                  <div
                                    className="Workflow-pdf-preview-popup"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {/* Header */}
                                    <div className="Workflow-pdf-header">
                                      <h4>Exhibitor Form Preview</h4>
                                      <button
                                        className="Workflow-pdf-close-btn"
                                        onClick={() => setShowPreview(false)}
                                      >
                                        ✕
                                      </button>
                                    </div>

                                    {/* PDF */}
                                    <div className="Workflow-pdf-body">
                                      <iframe
                                        src={previewURL}
                                        title="PDF Preview"
                                      />
                                    </div>

                                    {/* Footer */}
                                    <div className="Workflow-pdf-footer">
                                      <button
                                        className="Workflow-pdf-submit-btn"
                                        onClick={handleFinalUpload}
                                      >
                                        Submit & Upload
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {showBoothDesignPreview && (
                                <div className="Workflow-warning-popup-overlay">
                                  <div
                                    className="Workflow-pdf-preview-popup"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="Workflow-pdf-header">
                                      <h4>Exhibitor Form Preview</h4>
                                      <button
                                        className="Workflow-pdf-close-btn"
                                        onClick={() =>
                                          setShowBoothDesignPreview(false)
                                        }
                                      >
                                        ✕
                                      </button>
                                    </div>

                                    <div className="Workflow-pdf-body">
                                      {previewURL ? (
                                        <iframe
                                          src={previewURL}
                                          title="PDF Preview"
                                          width="100%"
                                          height="500px"
                                        />
                                      ) : (
                                        <p>No preview available</p>
                                      )}
                                    </div>

                                    <div className="Workflow-pdf-footer">
                                      <button
                                        className="Workflow-pdf-submit-btn"
                                        onClick={handleBoothDesignUpload}
                                      >
                                        Submit & Upload
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Step 1 Panel */}
                              <div
                                className={`Workflow-panel panel-step-1 ${
                                  currentStep === 1 ? "show" : "hide-left"
                                }`}
                              >
                                {/* <h3 className="Workflow-heading"> Mandatory Form for Exhibitor</h3> */}

                                <div className="ExhibitorStep1-grid">
                                  {/* LEFT — Instructions */}
                                  <div className="ExhibitorInstructions">
                                    <div>
                                      <h4>
                                        Step 2: Exhibitor Confirmation & Form
                                        Upload
                                      </h4>

                                      <ul className="instruction-alignment">
                                        <li>
                                          Exhibitors must download the mandatory
                                          Exhibitor Form, duly sign and stamp
                                          it, and upload the completed form to
                                          proceed to Step 3.
                                        </li>
                                        <li>
                                          By uploading the form, the exhibitor
                                          formally confirms their intent to
                                          appoint the selected contractor and
                                          informs RSD Expositions accordingly.
                                        </li>
                                        <li>
                                          Any change to the appointed contractor
                                          after submission must be initiated via
                                          the Unlock Request option available in
                                          the next step.
                                        </li>
                                        <li>
                                          Fabricator appointment is subject to
                                          organiser approval and applicable
                                          security deposit guidelines, as
                                          communicated by RSD Expositions.
                                        </li>
                                      </ul>
                                    </div>

                                    <div>
                                      {currentStep === 1 && (
                                        <div className="step-1-actions">
                                          <button
                                            className="doc-btn download-btn"
                                            onClick={() =>
                                              handleDownload(
                                                `https://inoptics.in/api/uploads/1752656815_APPOINTED CONTRACTOR & CONTRACTOR BADGES-2.pdf`,
                                                "1752656815_APPOINTED CONTRACTOR & CONTRACTOR BADGES-2.pdf",
                                              )
                                            }
                                          >
                                            <FaDownload /> Download
                                          </button>

                                          {/* Optional: Keep Upload button for manual trigger */}
                                          <label className="doc-btn">
                                            <FaUpload className="doc-icon-exhibitor" />
                                            Upload
                                            <input
                                              type="file"
                                              accept="application/pdf"
                                              style={{ display: "none" }}
                                              onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;

                                                setSelectedFile(file);
                                                setPreviewURL(
                                                  URL.createObjectURL(file),
                                                );
                                                setShowPreview(true); // open preview
                                              }}
                                            />
                                          </label>

                                          {/* NEW: Next Button with Validation */}
                                          <button
                                            className="Workflow-next-btn doc-btn"
                                            disabled={
                                              !uploadedSteps[
                                                `step${currentStep}`
                                              ]
                                            }
                                            onClick={() =>
                                              setCurrentStep((s) => s + 1)
                                            }
                                            style={{
                                              opacity: uploadedSteps[
                                                `step${currentStep}`
                                              ]
                                                ? 1
                                                : 0.4,
                                              cursor: uploadedSteps[
                                                `step${currentStep + 1}`
                                              ]
                                                ? "pointer"
                                                : "not-allowed",
                                            }}
                                          >
                                            Next
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Step 2 Panel */}
                              <div
                                className={`Workflow-panel panel-step-2 ${
                                  currentStep === 2 ? "show" : "hide-right"
                                }`}
                              >
                                <div className="ExhibitorStep1-grid">
                                  {/* LEFT — Instructions */}
                                  <div className="ExhibitorInstructions">
                                    <div>
                                      <h4>
                                        {" "}
                                        Step 3: Mandatory Contractor Undertaking
                                        Form
                                      </h4>

                                      <ul className="instruction-alignment">
                                        <li>
                                          This form must be completed by the
                                          selected contractor as confirmation of
                                          acceptance of all exhibition rules and
                                          regulations.
                                        </li>
                                        <li>
                                          Exhibitors may send the form directly
                                          to the contractor using the “Send Form
                                          To Contractor” button, or download and
                                          share it manually.
                                        </li>
                                        <li>
                                          The contractor is required to fill,
                                          sign, and stamp the form and return it
                                          to the exhibitor.
                                        </li>
                                        <li>
                                          The exhibitor must upload the signed
                                          and stamped form to complete this
                                          step.
                                        </li>
                                        <li>
                                          Contractor finalisation will be
                                          enabled only after successful upload
                                          of the completed form.
                                        </li>
                                        <li>
                                          Completion of this step is mandatory
                                          for participation in InOptics 2026.
                                        </li>
                                      </ul>
                                    </div>

                                    <div className="contractor-form-btn">
                                      {currentStep === 2 && (
                                        <button
                                          className="doc-btn"
                                          onClick={sendFormToContractor}
                                        >
                                          Send Form To Contractor
                                        </button>
                                      )}
                                    </div>

                                    <div>
                                      {currentStep === 2 && (
                                        <div className="step-1-actions">
                                          <button
                                            className="doc-btn download-btn"
                                            onClick={() =>
                                              handleDownload(
                                                `https://inoptics.in/api/uploads/1752656839_CONTRACTOR UNDERTAKING-DECLARATION & REGISTRATION-3.pdf`,
                                                "1752656839_CONTRACTOR UNDERTAKING-DECLARATION & REGISTRATION-3.pdf",
                                              )
                                            }
                                          >
                                            <FaDownload /> Download
                                          </button>

                                          {/* Optional: Keep Upload button for manual trigger */}
                                          <label className="doc-btn">
                                            <FaUpload className="doc-icon-exhibitor" />
                                            Upload
                                            <input
                                              type="file"
                                              accept="application/pdf"
                                              style={{ display: "none" }}
                                              onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;

                                                setSelectedFile(file);
                                                setPreviewURL(
                                                  URL.createObjectURL(file),
                                                );
                                                setShowPreview(true); // open preview
                                              }}
                                            />
                                          </label>

                                          {/* NEW: Next Button with Validation */}
                                          <button
                                            className="Workflow-next-btn doc-btn"
                                            disabled={
                                              !uploadedSteps[
                                                `step${currentStep}`
                                              ]
                                            }
                                            onClick={() =>
                                              setCurrentStep((s) => s + 1)
                                            }
                                            style={{
                                              opacity: uploadedSteps[
                                                `step${currentStep}`
                                              ]
                                                ? 1
                                                : 0.4,
                                              cursor: uploadedSteps[
                                                `step${currentStep}`
                                              ]
                                                ? "pointer"
                                                : "not-allowed",
                                            }}
                                          >
                                            Next
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div
                                className={`Workflow-panel panel-step-2 ${
                                  currentStep === 3 ? "show" : "hide-right"
                                }`}
                              >
                                <div className="ExhibitorStep1-grid">
                                  {/* LEFT — Instructions */}
                                  <div className="ExhibitorInstructions">
                                    <div>
                                      <h4>
                                        Step 4: Booth Dimensions & Construction
                                        Guidelines (Raw Space)
                                      </h4>

                                      <ul className="instruction-alignment">
                                        <li>
                                          The booth must be constructed strictly
                                          within the allotted area. No extension
                                          beyond the approved space is
                                          permitted.
                                        </li>
                                        <li>
                                          Maximum permissible height for any
                                          booth structure or partition wall is
                                          3.0 metres (12 feet).
                                        </li>
                                        <li>
                                          Partition walls between adjoining
                                          stalls must not exceed the permitted
                                          height and must be neatly finished on
                                          both sides.
                                        </li>
                                        <li>
                                          All special or custom-built structures
                                          must remain within the allotted booth
                                          boundaries. Mezzanine floors are
                                          strictly not permitted.
                                        </li>
                                        <li>
                                          All booth structures must be
                                          pre-fabricated and only assembled and
                                          finished on-site. Carpentry work
                                          inside the exhibition hall is not
                                          allowed.
                                        </li>
                                        <li>
                                          All construction and decorative
                                          materials used must be fire-retardant
                                          and compliant with safety regulations.
                                          Electrical installations must be
                                          carried out only by licensed
                                          electricians.
                                        </li>
                                      </ul>
                                    </div>

                                    <div className="contractor-form-btn">
                                      <label className="doc-btn">
                                        <FaUpload className="doc-icon-exhibitor" />
                                        Upload
                                        <input
                                          type="file"
                                          accept="application/pdf"
                                          style={{ display: "none" }}
                                          onChange={handleFileSelect}
                                        />
                                      </label>

                                      {/* NEW: Next Button with Validation */}
                                      <button
                                        className="Workflow-next-btn doc-btn"
                                        disabled={
                                          !uploadedSteps[`step${currentStep}`]
                                        }
                                        onClick={() =>
                                          setCurrentStep((s) => s + 1)
                                        }
                                        style={{
                                          opacity: uploadedSteps[
                                            `step${currentStep}`
                                          ]
                                            ? 1
                                            : 0.4,
                                          cursor: uploadedSteps[
                                            `step${currentStep}`
                                          ]
                                            ? "pointer"
                                            : "not-allowed",
                                        }}
                                      >
                                        Next
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div
                                className={`Workflow-panel panel-step-2 ${
                                  currentStep === 4 ? "show" : "hide-right"
                                }`}
                              >
                                {boothDesignStatus === "pending" && (
                                  <div className="contractor-thankyou-card warning">
                                    <h3>Booth Design Under Review</h3>
                                    <p>
                                      Your booth design is being reviewed by
                                      Admin.
                                    </p>
                                    <p>Please wait for approval.</p>
                                  </div>
                                )}

                                {boothDesignStatus === "rejected" && (
                                  <div className="contractor-thankyou-card rejected">
                                    <h3>Booth Design Rejected</h3>
                                    <p>
                                      ❌ Your booth design has been rejected.
                                      Please contact admin and upload a new
                                      design.
                                    </p>

                                    <button
                                      className="doc-btn"
                                      onClick={() => setCurrentStep(3)}
                                    >
                                      Re-Upload Booth Design
                                    </button>
                                  </div>
                                )}

                                {boothDesignStatus === "approved" && (
                                  <div className="contractor-thankyou-card success">
                                    <h3>Thank you for submit the form🎉</h3>
                                    <p>
                                      Your contractor form has been successfully
                                      completed.
                                    </p>
                                    <p>
                                      If you want to reappoint a contractor,
                                      click Unlock.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Overlay Panel for Additional Requirements */}
              {activeMenu === "Exhibitor Badges" && <ExhibitorBadgeForm />}

              {!importantPage && activeMenu === "Payment" && (
                <div className="exhibitordashboard-content">
                  <div className="payment-cards-container">
                    <div className="payment-card-grid">
                      {/* First Card: Stall Charges Summary */}
                      <div className="payment-card">
                        <h4>Stall Particulars</h4>

                        <div className="billing-summary">
                          <div className="billing-row">
                            <span>Total:</span>
                            <strong>
                              {stallSummary.total.toFixed(2)}{" "}
                              {stallSummary.currency}
                            </strong>
                          </div>

                          {stallSummary.discounted_amount > 0 && (
                            <div className="billing-row">
                              <span>
                                Discount ({getDiscountPercent(stallSummary)}
                                %):
                              </span>
                              <strong>
                                {stallSummary.discounted_amount.toFixed(2)}{" "}
                                {stallSummary.currency}
                              </strong>
                            </div>
                          )}

                          {isDelhi ? (
                            <>
                              <div className="billing-row">
                                <span>SGST (9%):</span>
                                <strong>
                                  {stallSummary.sgst.toFixed(2)}{" "}
                                  {stallSummary.currency}
                                </strong>
                              </div>
                              <div className="billing-row">
                                <span>CGST (9%):</span>
                                <strong>
                                  {stallSummary.cgst.toFixed(2)}{" "}
                                  {stallSummary.currency}
                                </strong>
                              </div>
                            </>
                          ) : (
                            <div className="billing-row">
                              <span>IGST (18%):</span>
                              <strong>
                                {stallSummary.igst.toFixed(2)}{" "}
                                {stallSummary.currency}
                              </strong>
                            </div>
                          )}

                          <div className="billing-row total">
                            <span>Grand Total:</span>
                            <strong>
                              {stallSummary.grand_total.toFixed(2)}{" "}
                              {stallSummary.currency}
                            </strong>
                          </div>

                          <div className="billing-row">
                            <span>Cleared Amount:</span>
                            <strong>
                              {stallCleared.toFixed(2)} {stallSummary.currency}
                            </strong>
                          </div>

                          {/* ✅ Overall Pending Amount Row */}
                          {pendingAmount !== null && (
                            <div
                              className="billing-row"
                              style={{
                                color: pendingAmount <= 0 ? "green" : "red",
                                fontWeight: "bold",
                                marginTop: "10px",
                              }}
                            >
                              <span>
                                {pendingAmount <= 0
                                  ? "PAYMENT CLEARED"
                                  : "PENDING AMOUNT"}
                              </span>
                              <strong>
                                {pendingAmount.toFixed(2)}{" "}
                                {stallSummary.currency}
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* === Card 2: Power Requirement Billing === */}
                      <div className="payment-card">
                        <h4>Power Requirement</h4>

                        <div className="billing-summary">
                          <div className="billing-row">
                            <span>Total:</span>
                            <strong>₹{totalPrice.toFixed(2)} </strong>
                          </div>

                          {isDelhi ? (
                            <>
                              <div className="billing-row">
                                <span>CGST (9%):</span>
                                <strong>₹{cgst.toFixed(2)} </strong>
                              </div>
                              <div className="billing-row">
                                <span>SGST (9%):</span>
                                <strong>₹{sgst.toFixed(2)} </strong>
                              </div>
                            </>
                          ) : (
                            <div className="billing-row">
                              <span>IGST (18%):</span>
                              <strong>₹{igst.toFixed(2)} </strong>
                            </div>
                          )}

                          <div className="billing-row total">
                            <span>Grand Total:</span>
                            <strong>₹{grandTotal.toFixed(2)} </strong>
                          </div>

                          <div className="billing-row">
                            <span>Cleared Amount:</span>
                            <strong>₹{powerCleared.toFixed(2)}</strong>
                          </div>

                          {powerPendingAmount !== null && (
                            <div
                              className="billing-row"
                              style={{
                                color:
                                  powerPendingAmount <= 0 ? "green" : "red",
                                fontWeight: "bold",
                                marginTop: "10px",
                              }}
                            >
                              <span>
                                {powerPendingAmount <= 0
                                  ? "PAYMENT CLEARED"
                                  : "PENDING AMOUNT"}
                              </span>
                              <strong>₹{powerPendingAmount.toFixed(2)}</strong>
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            alignSelf: "flex-end",
                            marginTop: "auto",
                          }}
                        ></div>
                      </div>

                      {/* === Card 3: Exhibitor Badges Billing === */}
                      {(() => {
                        const { count, total, cgst, sgst, igst, grandTotal } =
                          getExhibitorBadgeBilling();

                        return (
                          <div className="payment-card">
                            <h4>Exhibitor Badges</h4>

                            <div className="billing-summary">
                              <div className="billing-row">
                                <span>Extra Badges:</span>
                                <strong>{count || 0}</strong>
                              </div>

                              <div className="billing-row">
                                <span>Total Amount:</span>
                                <strong>₹{total?.toFixed(2) || "0.00"}</strong>
                              </div>

                              {isDelhi ? (
                                <>
                                  <div className="billing-row">
                                    <span>CGST (9%):</span>
                                    <strong>
                                      ₹{cgst?.toFixed(2) || "0.00"}
                                    </strong>
                                  </div>
                                  <div className="billing-row">
                                    <span>SGST (9%):</span>
                                    <strong>
                                      ₹{sgst?.toFixed(2) || "0.00"}
                                    </strong>
                                  </div>
                                </>
                              ) : (
                                <div className="billing-row">
                                  <span>IGST (18%):</span>
                                  <strong>₹{igst?.toFixed(2) || "0.00"}</strong>
                                </div>
                              )}

                              <div className="billing-row total">
                                <span>Grand Total:</span>
                                <strong>
                                  ₹{grandTotal?.toFixed(2) || "0.00"}
                                </strong>
                              </div>

                              <div className="billing-row">
                                <span>Cleared Amount:</span>
                                <strong>₹{badgeCleared.toFixed(2)}</strong>
                              </div>

                              {badgePendingAmount !== null && (
                                <div
                                  className="billing-row pending"
                                  style={{
                                    color:
                                      badgePendingAmount <= 0 ? "green" : "red",
                                  }}
                                >
                                  <span>
                                    {badgePendingAmount <= 0
                                      ? "PAYMENT CLEARED"
                                      : "PENDING AMOUNT"}
                                  </span>
                                  <strong>
                                    ₹{badgePendingAmount.toFixed(2)}
                                  </strong>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExhibitorDashboard;
