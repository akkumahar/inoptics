import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaBars,
  FaTachometerAlt,
  FaUser,
  FaClipboardList,
  FaHardHat,
  FaMoneyBill,
  FaSignOutAlt,
  FaEnvelope,
  FaLongArrowAltLeft,
} from "react-icons/fa";
import "./ExhibitorDashboard.css";
import ExhibitorBadgeForm from "./ExhibitorBadgeForm";
import ExhibitorPayments from "./ExhibitorDashboardComponent/ExhibitorPayments";
import ExhibitorPowerForm from "./ExhibitorDashboardComponent/ExhibitorPowerForm";
import ExhibitorDashboardOverview from "./ExhibitorDashboardComponent/ExhibitorDashboardOverview";
import ExhibitorProfile from "./ExhibitorDashboardComponent/ExhibitorProfile";
import ExhibitorMailbox from "./ExhibitorDashboardComponent/ExhibitorMailBox";
import ExhibitorFurnitureRequirements from "./ExhibitorDashboardComponent/ExhibitorFurnitureRequirements";
import ExhibitorPowerRequirement from "./ExhibitorDashboardComponent/ExhibitorPowerRequirement";
import ExhibitorContractors from "./ExhibitorDashboardComponent/ExhibitorContractors";

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

  const [brandsData, setBrandsData] = useState({
    website: "",
    products: [],
    home_brands: "",
    distributors: "",
    international_brands: "",
  });

  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    contact_number: "",
  });

  const [products, setProducts] = useState([]);
  const [showBrandsEditForm, setShowBrandsEditForm] = useState(false);
  const [hasBrandsData, setHasBrandsData] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  // const [isBrandsSubmitted, setIsBrandsSubmitted] = useState(false);

  const [powerPreviewRows, setPowerPreviewRows] = useState([]);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://inoptics.in/api/get_product.php");
      setProducts(res.data);
      console.log("product list", res.data);
    } catch (err) {
      alert("Error fetching products");
    }
  };

  useEffect(() => {
    if (activeMenu === "Profile" && formData.company_name) {
      fetchProducts();
    }
  }, [activeMenu, formData.company_name]);

  const CONTRACTOR_STEP_KEY = "contractor_step";
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem(CONTRACTOR_STEP_KEY);
    return saved ? Number(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem(CONTRACTOR_STEP_KEY, currentStep);
  }, [currentStep]);

  const [boothDesignStatus, setBoothDesignStatus] = useState("pending");
  const [boothRejectReason, setBoothRejectReason] = useState("");
  const [isReuploading, setIsReuploading] = useState(false);
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

  const [isInExhibitorBadges, setIsInExhibitorBadges] = useState(false);

  const [showExitPopup, setShowExitPopup] = useState(false);
  const [pendingMenu, setPendingMenu] = useState(null);
  const [hasGeneratedBadge, setHasGeneratedBadge] = useState(false);
  const [hasUnlockedBadge, setHasUnlockedBadge] = useState(false);

  // 🔹 New states

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

  const BREAKPOINT = 1024;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= BREAKPOINT);
  const [collapsed, setCollapsed] = useState(window.innerWidth <= BREAKPOINT);

  const [furnitureVendorDetails, setFurnitureVendorDetails] = useState([]);
  const [isFurnitureSaved, setIsFurnitureSaved] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [emailMasterData, setEmailMasterData] = useState([]);

  const [coreFormData, setCoreFormData] = useState([]);

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

  const forceNavigateMenu = (menu) => {
    setActiveMenu(menu);
    setImportantPage("");

    if (window.innerWidth <= 768) {
      setCollapsed(true);
    }
  };

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

  // useEffect(() => {
  //   const handleResize = () => {
  //     if (window.innerWidth <= 768) {
  //       setCollapsed(true); // mobile → close
  //     } else {
  //       setCollapsed(false); // desktop → open
  //     }
  //   };

  //   handleResize(); // page load par bhi run hoga

  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  useEffect(() => {
    let prevIsMobile = window.innerWidth <= BREAKPOINT;

    const handleResize = () => {
      const nowMobile = window.innerWidth <= BREAKPOINT;

      setIsMobile(nowMobile);

      // only change collapsed when crossing breakpoint
      if (nowMobile !== prevIsMobile) {
        setCollapsed(nowMobile);
      }

      prevIsMobile = nowMobile;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuClick = (menu) => {
    // 🚨 EXIT GUARD — sirf tab popup jab:
    // 1️⃣ Exhibitor Badges page par ho
    // 2️⃣ At least 1 badge UNLOCKED ho
    // 3️⃣ Kisi aur menu par ja rahe ho
    if (
      isInExhibitorBadges &&
      hasUnlockedBadge && // 🔥 IMPORTANT FIX
      menu !== "Exhibitor Badges"
    ) {
      setPendingMenu(menu);
      setShowExitPopup(true);
      return; // ⛔ stop here
    }

    // ===== NORMAL NAVIGATION =====
    setActiveMenu(menu);
    setImportantPage("");

    if (menu === "Additional Requirements") {
      setImportantPage("Furniture Requirements");
      return;
    }

    // mobile / tablet auto close
    if (window.innerWidth <= 768) {
      setCollapsed(true);
    }

    // mails inbox special logic
    if (menu === "Mails Inbox" && currentExhibitor) {
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
            setUnreadCount(
              data.mails.filter((m) => Number(m.is_read) === 0).length,
            );
          } else {
            setMailsList([]);
            setUnreadCount(0);
          }
        })
        .catch(() => {
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

        const rows = data.entries.map((item) => ({
          day: item.day,
          pricePerKw: item.price_per_kw,
          powerRequired: item.power_required,
          phase: item.phase,
          totalAmount: item.total_amount,
        }));

        // ✅ always set — display ke liye
        setPowerPreviewRows(rows);

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



  const handleAddAndSubmitPower = async () => {

  // ✅ same validation as Add
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

  const updatedList = [...previewTableList, newRow];

  // ✅ update preview table
  setPreviewTableList(updatedList);

  // ✅ reset fields
  setExhibitorPowerRequired("");
  setExhibitorPhase("");
  setExhibitorTotalAmount("");

  // ✅ NOW — submit immediately using same payload logic
  try {
    const payload = updatedList.map((item) => ({
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
      is_locked: 1,
    }));

    const response = await fetch(
      "https://inoptics.in/api/add_Exhibitor_power_requirement.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: payload }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      alert("Power data added & submitted!");

      await sendPowerMailToAdmin(currentExhibitor.company_name);

      setIsSavedToDB(true);
      setIsViewOnly(true);
      fetchPowerBilling(currentExhibitor.company_name);

    } else {
      alert("Submit failed: " + (result.error || "Error"));
    }

  } catch (err) {
    console.error(err);
    alert("Submit error");
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

  // useEffect(() => {
  //   if (isLocked === 1) {
  //     setContractorFormSubmitted(true);
  //     localStorage.setItem("contractorFormSubmitted", "true");
  //     setCurrentStep(2);
  //   }

  //   if (isLocked === 0) {
  //     setContractorFormSubmitted(false);
  //     localStorage.removeItem("contractorFormSubmitted");
  //     setCurrentStep(1);
  //   }
  // }, [isLocked]);

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
    fetchBoothDesignStatus();
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

  // useEffect(() => {
  //   if (!selectedContractorId || activeMenu !== "Contractors") return;

  //   setWorkflowActive(true);

  //   if (contractorFormSubmitted) {
  //     setCurrentStep(4);
  //   } else {
  //     setCurrentStep(1);
  //   }
  // }, [selectedContractorId, contractorFormSubmitted, activeMenu]);

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

  // When user clicks OK
  const confirmSelect = async () => {
    if (!selectedContractorTemp) return;

    try {
      await selectContractor(selectedContractorTemp.id); // This sets selectedContractorId + alerts
      setWorkflowActive(true);
      setCurrentStep(1);
      localStorage.setItem(CONTRACTOR_STEP_KEY, 1);
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

        setWorkflowActive(true); // 👉 keep right panel open
      } else {
        alert("Failed to send email: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error sending email.");
    }
  };

  const [stallPaymentCleared, setStallPaymentCleared] = useState(0);
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
  const [badgeReceived, setBadgeReceived] = useState(0);
  const [badgePending, setBadgePending] = useState(0);
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
    fetchPowerPayments();
  }, [formData.company_name]);

  const fetchPowerPayments = async () => {
    try {
      const res = await fetch(
        `https://inoptics.in/api/get_exhibitor_power_payment.php?company_name=${formData.company_name}`,
      );

      const data = await res.json();
      console.log("POWER PAYMENT API:", data); // 🔥 ADD THIS

      if (data.success) {
        const normalized = data.records.map((pay) => ({
          amount: parseFloat(pay.amount_paid || 0),
        }));

        const totalPaid = normalized.reduce((s, p) => s + p.amount, 0);

        console.log("POWER CLEARED =", totalPaid); // 🔥 ADD THIS

        setPowerCleared(totalPaid);
      }
    } catch (e) {
      console.error("power fetch error", e);
    }
  };

  const fetchBadgePayments = async () => {
    if (!formData.company_name) return;

    try {
      console.log("Fetching badge payments for:", formData.company_name);

      const res = await fetch(
        `https://inoptics.in/api/get_exhibitor_badge_payment.php?company_name=${encodeURIComponent(formData.company_name)}`,
      );

      const data = await res.json();
      console.log("Badge API response:", data);

      const list = Array.isArray(data.records) ? data.records : [];

      const normalized = list.map((pay) => ({
        type: pay.payment_type ?? "",
        date: pay.payment_date ?? "",
        exhibitorBank: pay.exhibitor_bank_name ?? "",
        receiverBank: pay.receiver_bank_name ?? "",
        amount: Number(pay.amount_paid ?? 0),
        tds: Number(pay.tds ?? 0),
      }));

      setBadgePayments(normalized);

      // ✅ optional — also auto update cleared amount here
      const totalPaid = normalized.reduce((s, p) => s + p.amount, 0);
      setBadgeCleared(totalPaid);
    } catch (error) {
      console.error("Error fetching badge payments:", error);
      setBadgePayments([]);
      setBadgeCleared(0);
    }
  };

  useEffect(() => {
    fetchBadgePayments();
  }, [formData.company_name]);

  // ✅ Helper to calculate discount % (for summary)
  const getDiscountPercent = (summary) => {
    if (!summary || !summary.total || summary.total <= 0) return 0;
    return ((summary.discounted_amount / summary.total) * 100).toFixed(0);
  };

  const getExhibitorBadgeBilling = () => {
    const count = Number(extraBadges || 0);
    const rate = new Date() > new Date("2026-02-28") ? 200 : 100;
    const total = count * rate;

    const isDelhi = currentExhibitor?.state?.trim().toLowerCase() === "delhi";

    const cgst = isDelhi ? total * 0.09 : 0;
    const sgst = isDelhi ? total * 0.09 : 0;
    const igst = !isDelhi ? total * 0.18 : 0;

    const grandTotal = total + cgst + sgst + igst;

    const cleared = Number(badgeCleared || 0);

    // ✅ correct pending
    const pending = Math.max(0, Number((grandTotal - cleared).toFixed(2)));

    let paymentStatus = "NOT PAID";
    if (cleared > 0 && pending > 0) paymentStatus = "PARTIAL";
    if (pending === 0 && grandTotal > 0) paymentStatus = "PAID";

    return {
      count,
      total,
      cgst,
      sgst,
      igst,
      grandTotal,
      cleared,
      pending,
      paymentStatus,
      isDelhi,
    };
  };

  const stallSummary = stallList?.reduce(
    (summary, stall) => {
      // 💰 payment totals
      summary.total += parseFloat(stall.total || 0);
      summary.discounted_amount += parseFloat(stall.discounted_amount || 0);
      summary.sgst += parseFloat(stall.sgst_9_percent || 0);
      summary.cgst += parseFloat(stall.cgst_9_percent || 0);
      summary.igst += parseFloat(stall.igst_18_percent || 0);
      summary.grand_total += parseFloat(stall.grand_total || 0);

      // 💱 currency
      if (!summary.currency) {
        summary.currency = stall.currency || "";
      }

      // 🧾 stall detail list push
      summary.stalls.push({
        stall_number: stall.stall_number,
        stall_category: stall.stall_category,
        stall_area: stall.stall_area,
        stall_price: stall.stall_price,
      });

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
      stalls: [], // 👈 new field
    },
  );

  const fetchStallClearedPayments = async () => {
    if (!formData.company_name) return;

    const cleanName = formData.company_name
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    try {
      const res = await fetch(
        `https://inoptics.in/api/get_exhibitor_payment.php?company_name=${encodeURIComponent(cleanName)}`,
      );

      const data = await res.json();

      if (!data.success) {
        setStallPaymentCleared(0);
        return;
      }

      // ✅ sum all payments
      const totalPaid = data.records.reduce(
        (sum, r) => sum + Number(r.amount_paid || 0),
        0,
      );

      setStallPaymentCleared(totalPaid);
    } catch (err) {
      console.error("stall payment fetch error", err);
      setStallPaymentCleared(0);
    }
  };

  useEffect(() => {
    fetchStallClearedPayments();
  }, [formData.company_name]);

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

    // ✅ decide form_type from step
    let formType = "";
    if (currentStep === 1) formType = "appointed";
    else if (currentStep === 2) formType = "undertaking";
    else if (currentStep === 3) formType = "booth_design"; // optional future

    const uploadData = new FormData();
    uploadData.append("file", selectedFile);
    uploadData.append("exhibitor_company_name", formData.company_name);
    uploadData.append("form_type", formType); // ✅ NEW LINE

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
          console.log("Uploaded Files:", updated);
          return updated;
        });

        setUploadedSteps((prev) => ({
          ...prev,
          [`step${currentStep}`]: true,
        }));

        setShowPreview(false);
        setSelectedFile(null);
        setPreviewURL(null);
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
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

    const uploadData = new FormData();
    uploadData.append("file", selectedFile);
    uploadData.append("company_name", formData.company_name);

    try {
      const res = await fetch(
        "https://inoptics.in/api/upload_booth_design_file.php",
        {
          method: "POST",
          body: uploadData,
        },
      );

      const data = await res.json();
      console.log("BOOTH UPLOAD RESPONSE:", data);

      if (!data.success) {
        toast.error("Upload failed");
        return;
      }

      toast.success("Booth design uploaded!");

      // ⭐⭐⭐ THIS LINE WAS MISSING — BUTTON SHOW FIX
      setUploadedFiles((prev) => ({
        ...prev,
        step3: data.file_path || "booth_uploaded",
      }));

      // mark step complete
      setUploadedSteps((prev) => ({
        ...prev,
        step3: true,
      }));

      setSelectedFile(null);
      setPreviewURL(null);
      setShowBoothDesignPreview(false);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };

  useEffect(() => {
    if (!formData.company_name) return;

    const checkFile = async (type, stepKey) => {
      try {
        const res = await fetch(
          `https://inoptics.in/api/download_exhibitor_form.php?company=${encodeURIComponent(
            formData.company_name,
          )}&type=${type}`,
          { method: "HEAD" }, // 🔥 fast check — no download
        );

        if (res.ok) {
          setUploadedFiles((prev) => ({
            ...prev,
            [stepKey]: "exists",
          }));

          setUploadedSteps((prev) => ({
            ...prev,
            [stepKey]: true,
          }));
        }
      } catch {}
    };

    checkFile("form", "step1");
    checkFile("undertaking", "step2");
    checkFile("booth", "step3");
  }, [formData.company_name]);

  // upload form file download handler

  const forceDownload = async (filePath) => {
    try {
      const url = `https://inoptics.in/api/download_exhibitor_form.php?company=${encodeURIComponent(
        formData.company_name,
      )}`;

      const res = await fetch(url);
      console.log("resonse ", url);

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

  const downloadBoothDesign = async () => {
    try {
      const url =
        `https://inoptics.in/api/download_exhibitor_form.php` +
        `?company=${encodeURIComponent(formData.company_name)}` +
        `&type=booth`;

      console.log("Booth download URL:", url);

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Server returned " + res.status);
      }

      const blob = await res.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;

      // filename from header if available
      const disposition = res.headers.get("Content-Disposition");
      let filename = "booth_design.pdf";

      if (disposition && disposition.includes("filename=")) {
        filename = disposition.split("filename=")[1].replace(/"/g, "");
      }

      a.download = filename;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Booth download failed", err);
      alert("Booth design download failed");
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

    if (selectedContractorId) {
      setWorkflowActive(true);
    } else {
      setWorkflowActive(false);
    }
  }, [activeMenu, selectedContractorId]);

  useEffect(() => {
    if (!boothDesignStatus) return;

    // ⛔ user manually re-upload kar raha hai
    if (isReuploading) return;

    // ✅ pending / rejected / approved → always step 4
    // setCurrentStep(4);
  }, [boothDesignStatus, isReuploading]);

  useEffect(() => {
    if (!formData.company_name) return;

    fetchBoothDesignStatus(); // initial

    const interval = setInterval(fetchBoothDesignStatus, 5000);
    return () => clearInterval(interval);
  }, [formData.company_name]);

  const fetchBoothDesignStatus = async () => {
    if (!formData.company_name) return;

    try {
      const res = await fetch(
        `https://inoptics.in/api/get_booth_design_status.php?company=${encodeURIComponent(
          formData.company_name,
        )}`,
      );

      const data = await res.json();

      const status = ["pending", "approved", "rejected"].includes(
        (data.status || "").toLowerCase(),
      )
        ? data.status.toLowerCase()
        : "pending";

      console.log("🟢 Booth status:", status, data);

      setBoothDesignStatus(status);
      setBoothRejectReason(
        status === "rejected" ? data.reject_reason || "" : "",
      );
    } catch (err) {
      console.error("❌ Booth status fetch failed", err);
    }
  };

  const handleEditBrands = () => {
    setShowBrandsEditForm(false);
  };

  const handleSubmitBrands = async () => {
    const payload = {
      Company_name: currentExhibitor.company_name,
      website: brandsData.website,
      products: (brandsData.products || []).join(","), // ✅ FIX
      home_brands: brandsData.home_brands,
      distributors: brandsData.distributors,
      international_brands: brandsData.international_brands,
    };

    console.log("SUBMIT:", payload);

    await fetch("https://inoptics.in/api/add_exhibitor_brands.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setHasBrandsData(true);
    setShowBrandsEditForm(true);
  };

  useEffect(() => {
    if (!formData.company_name) return;

    fetch(
      `https://inoptics.in/api/get_exhibitor_brands.php?Company_name=${encodeURIComponent(
        formData.company_name,
      )}`,
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("brandsData:", data);
        if (data.status === "success") {
          setBrandsData({
            website: data.Website || "",
            products: Array.isArray(data.Products)
              ? data.Products
              : (data.Products || "")
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),

            home_brands: data.Home_brands || "",
            distributors: data.Distributors || "",
            international_brands: data.International_brands || "",
          });

          setHasBrandsData(true);
          setShowBrandsEditForm(true);
        }
      });
  }, [formData.company_name]);

  const handleUpdateBrands = async () => {
    try {
      const response = await fetch(
        "https://inoptics.in/api/update_exhibitor_brands.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Company_name: formData.company_name,
            ...brandsData,
          }),
        },
      );

      const data = await response.json();
      if (data.status === "success") {
        alert("Brands updated successfully!");
        setShowBrandsEditForm(false);
      } else {
        alert("Update failed: " + data.message);
      }
    } catch (error) {
      console.error("Update Brands Error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="exhibitordashboard-container">
      {/* Sidebar */}

      {isMobile && !collapsed && (
        <div className="sidebar-overlay" onClick={() => setCollapsed(true)} />
      )}

      <div>
        <div className="mobile-topbar mobile-toggle-btn-desktop">
          <button
            className="mobile-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            <FaBars />
          </button>
        </div>
        <aside
          className={`exhibitordashboard-sidebar 
            ${collapsed ? "collapsed" : ""} 
            ${isMobile ? "mobile" : "desktop"}
          `}
        >
          <div className="exhibitordashboard-sidebar-header">
            <h2 className="exhibitordashboard-sidebar-title">
              Exhibitor Panel
            </h2>
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
                  if (window.innerWidth <= 768) {
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
                if (window.innerWidth <= 768) {
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
      </div>
      <div
        className={`exhibitordashboard-main-content ${
          collapsed ? "sidebar-collapsed" : "sidebar-open"
        }`}
      >
        <header className="exhibitordashboard-navbar">
          <div className="mobile-topbar ">
            <button
              className="mobile-toggle-btn"
              onClick={() => setCollapsed(!collapsed)}
            >
              <FaBars />
            </button>
          </div>
          <div id="mail-back-btn">
            {activeMenu === "Mails Inbox" && (
              <button
                className="mail-back-btn"
                onClick={() => setSelectedMail()}
              >
                <FaLongArrowAltLeft />
              </button>
            )}
            <h1>{activeMenu}</h1>
          </div>

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
                  <ExhibitorDashboardOverview
                    importantPage={importantPage}
                    activeMenu={activeMenu}
                    exhibitorData={exhibitorData}
                    eventScheduleData={eventScheduleData}
                    latestNewsData={latestNewsData}
                    activities={activities}
                    stallList={stallList}
                    powerData={powerData}
                    getExhibitorBadgeBilling={getExhibitorBadgeBilling}
                    currentExhibitor={currentExhibitor}
                  />
                )}

              {activeMenu === "Mails Inbox" && (
                <ExhibitorMailbox
                  mailsList={mailsList}
                  loadingMails={loadingMails}
                  selectedMail={selectedMail}
                  onSelectMail={handleMailClick}
                  onBackToList={() => setSelectedMail(null)}
                />
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
                        {/* ✅ Instruction HTML FIRST */}
                        <div
                          className="editor-content"
                          dangerouslySetInnerHTML={{
                            __html: instructionsList[0].content,
                          }}
                        />

                        {/* ✅ LAST — checkbox + dates */}
                        <div
                          style={{
                            marginTop: 16,
                            padding: "10px 12px",
                            background: "#f6f8fa",
                            borderRadius: 6,
                          }}
                        >
                          <label
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                            }}
                          >
                            <input type="checkbox" checked disabled />
                            Accepted Terms & Conditions
                            <div
                              style={{
                                fontSize: 13,
                                opacity: 0.8,
                                marginTop: 6,
                              }}
                            >
                              <div>
                                {new Date(
                                  instructionsList[0].created_at,
                                ).toLocaleString("en-IN")}
                              </div>
                            </div>
                          </label>
                        </div>
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
                <ExhibitorProfile
                  exhibitors={exhibitors}
                  stallList={stallList}
                  brandsData={brandsData}
                  setBrandsData={setBrandsData}
                  products={products}
                  showBrandsEditForm={showBrandsEditForm}
                  handleSubmitBrands={handleSubmitBrands}
                  handleEditBrands={handleEditBrands}
                />
              )}

              {importantPage === "Furniture Requirements" && (
                <ExhibitorFurnitureRequirements
                  furnitureData={furnitureData}
                  selectedFurniture={selectedFurniture}
                  setSelectedFurniture={setSelectedFurniture}
                  showFurnitureList={showFurnitureList}
                  setShowFurnitureList={setShowFurnitureList}
                  isFurnitureSaved={isFurnitureSaved}
                  setIsFurnitureSaved={setIsFurnitureSaved}
                  handleQuantityChange={handleQuantityChange}
                  updateSelectedFurniture={updateSelectedFurniture}
                  handleSendFurnitureMail={handleSendFurnitureMail}
                  handleUnlockRequestMail={handleUnlockRequestMail}
                  furnitureBilling={furnitureBilling}
                  furnitureVendorDetails={furnitureVendorDetails}
                  currentExhibitor={currentExhibitor}
                />
              )}

              {importantPage === "Power Requirement" && currentExhibitor && (
                <>
                  <ExhibitorPowerRequirement
                    currentExhibitor={currentExhibitor}
                    exhibitorPricePerKw={exhibitorPricePerKw}
                    isViewOnly={isViewOnly}
                    setPowerFormStep={setPowerFormStep}
                    powerFormStep={powerFormStep}
                    exhibitorPowerRequired={exhibitorPowerRequired}
                    exhibitorPhase={exhibitorPhase}
                    exhibitorTotalAmount={exhibitorTotalAmount}
                    handlePowerFormPowerChange={handlePowerFormPowerChange}
                    handlePowerFormPhaseChange={handlePowerFormPhaseChange}
                    handlePowerFormNext={handlePowerFormNext}
                    handlePowerFormPrevious={handlePowerFormPrevious}
                    handlePowerFormAdd={handlePowerFormAdd}
                    handleExhibitorPowerSubmit={handleExhibitorPowerSubmit}
                    onFinalSubmit={handleAddAndSubmitPower}
                    showExhibitorEditForm={showExhibitorEditForm}
                    handlePowerUnlockRequest={handlePowerUnlockRequest}
                    previewTableList={previewTableList}
                    powerData={powerData}
                    handleResetPowerData={handleResetPowerData}
                    totalPrice={totalPrice}
                    cgst={cgst}
                    sgst={sgst}
                    igst={igst}
                    grandTotal={grandTotal}
                    ExhibitorPowerForm={ExhibitorPowerForm}
                  />
                </>
              )}

              <div className="contractor-ui-root">
                {!importantPage && activeMenu === "Contractors" && (
                  <ExhibitorContractors
                    importantPage={importantPage}
                    activeMenu={activeMenu}
                    showPopup={showPopup}
                    setShowPopup={setShowPopup}
                    selectedContractorTemp={selectedContractorTemp}
                    cancelSelect={cancelSelect}
                    confirmSelect={confirmSelect}
                    showContractorListOverlay={showContractorListOverlay}
                    setShowContractorListOverlay={setShowContractorListOverlay}
                    contractorData={contractorData}
                    selectedContractorId={selectedContractorId}
                    unselectContractor={unselectContractor}
                    setSelectedContractorTemp={setSelectedContractorTemp}
                    workflowActive={workflowActive}
                    contractorEmail={contractorEmail}
                    setContractorEmail={setContractorEmail}
                    handleSendRegistrationMail={handleSendRegistrationMail}
                    requestContractorChange={requestContractorChange}
                    uploadedFiles={uploadedFiles}
                    setSelectedPreviewStep={setSelectedPreviewStep}
                    setPdfUrl={setPdfUrl}
                    setShowPdfPreview={setShowPdfPreview}
                    showPdfPreview={showPdfPreview}
                    forceDownload={forceDownload}
                    downloadBoothDesign={downloadBoothDesign}
                    formData={formData}
                    selectedContractor={selectedContractor}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    uploadedSteps={uploadedSteps}
                    showPreview={showPreview}
                    setShowPreview={setShowPreview}
                    previewURL={previewURL}
                    setPreviewURL={setPreviewURL}
                    setSelectedFile={setSelectedFile}
                    handleFinalUpload={handleFinalUpload}
                    handleDownload={handleDownload}
                    sendFormToContractor={sendFormToContractor}
                    handleFileSelect={handleFileSelect}
                    setIsReuploading={setIsReuploading}
                    boothDesignStatus={boothDesignStatus}
                    setBoothDesignStatus={setBoothDesignStatus}
                    boothRejectReason={boothRejectReason}
                    setBoothRejectReason={setBoothRejectReason}
                    showBoothDesignPreview={showBoothDesignPreview}
                    setShowBoothDesignPreview={setShowBoothDesignPreview}
                    handleBoothDesignUpload={handleBoothDesignUpload}
                  />

                  // <div className="contractor-ui-body">
                  //   {!importantPage && activeMenu === "Contractors" && (
                  //   )}
                  // </div>
                )}
              </div>

              {activeMenu === "Exhibitor Badges" && (
                <ExhibitorBadgeForm
                  setIsInExhibitorBadges={setIsInExhibitorBadges}
                  setHasGeneratedBadge={setHasGeneratedBadge}
                  setHasUnlockedBadge={setHasUnlockedBadge}
                />
              )}

              {!importantPage && activeMenu === "Payment" && (
                <ExhibitorPayments
                  stallSummary={stallSummary}
                  stallPaymentCleared={stallPaymentCleared}
                  isDelhi={isDelhi}
                  getDiscountPercent={getDiscountPercent}
                  totalPrice={totalPrice}
                  cgst={cgst}
                  sgst={sgst}
                  igst={igst}
                  grandTotal={grandTotal}
                  powerCleared={powerCleared}
                  powerPreviewRows={powerPreviewRows}
                  getExhibitorBadgeBilling={getExhibitorBadgeBilling}
                />
              )}
            </>
          )}
        </div>

        {showExitPopup && (
          <div className="confirm-overlay">
            <div className="confirm-modal">
              <h3>Leave Exhibitor Badges?</h3>
              <p>
                You have unsaved or pending badge-related actions. Are you sure
                you want to leave this page?
              </p>

              <div className="confirm-actions">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowExitPopup(false);
                    setPendingMenu(null);
                  }}
                >
                  Stay Here
                </button>

                <button
                  className="confirm-btn"
                  onClick={() => {
                    setShowExitPopup(false);
                    setIsInExhibitorBadges(false);
                    setHasUnlockedBadge(false); // 🔥 reset
                    forceNavigateMenu(pendingMenu);
                    setPendingMenu(null);
                  }}
                >
                  Leave Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExhibitorDashboard;
