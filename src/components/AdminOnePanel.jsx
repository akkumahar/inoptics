import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./AdminOnePanel.css";
import FasciaNameAdmin from "./List/FasciaNameAdmin";
import AdminPowerRequirement from "./List/AdminPowerRequirement";
import AdminBadges from "./List/AdminBadges";
import ExtraFurnitureManager from "./List/ExtraFurnitureManager";
import ContractorBadgesAdmin from "./List/ContractorBadgeAdmin";
import ExhibitorForms from "./List/ExhibitorForms";
import ExhibitorPowerHistory from "./List/ExhibitorPowerHistory";
import ExhibitorsPanel from "./List/ExhibitorsPanel";
import AdminFasciaHistory from "./List/AdminFasciaHistory";

const AdminOnePanel = () => {
  const [activeMenu, setActiveMenu] = useState("fascia");
  const navigate = useNavigate();
  const [exhibitorData, setExhibitorData] = useState([]);

  // ✅ LOGIN GUARD
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!isLoggedIn) {
      navigate("/sachin");
    }
  }, [navigate]);

  // ✅ Logout Function
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("adminEmail");
    sessionStorage.clear();

    navigate("/sachin");
  };

  useEffect(() => {
    fetchExhibitorData();
  }, []);

  const fetchExhibitorData = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_exhibitors.php");
      const data = await res.json();
      console.log("exhibitor data working api", data);
      setExhibitorData(data);
    } catch (error) {
      console.error("Failed to fetch exhibitors:", error);
    }
  };

  const renderComponent = () => {
    switch (activeMenu) {
      case "exhibitor":
        return <ExhibitorsPanel />;

      case "fascia":
        return <FasciaNameAdmin />;

      case "power":
        return <AdminPowerRequirement exhibitorData={exhibitorData} />;

      case "badges":
        return <AdminBadges />;

      case "furniture":
        return <ExtraFurnitureManager />;

      case "contractor":
        return <ContractorBadgesAdmin exhibitorData={exhibitorData} />;

      case "Exhibitor Forms History":
        return <ExhibitorForms />;

      case "Exhibitor Power History":
        return <ExhibitorPowerHistory />;

      case "Exhibitor Fascia History":
        return <AdminFasciaHistory />;

      default:
        return <FasciaNameAdmin />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <h2>Admin sachin</h2>

        <ul>
          <li
            className={activeMenu === "exhibitor" ? "active" : ""}
            onClick={() => setActiveMenu("exhibitor")}
          >
            Exhibitor
          </li>
          <li
            className={activeMenu === "fascia" ? "active" : ""}
            onClick={() => setActiveMenu("fascia")}
          >
            Fascia Name
          </li>

          <li
            className={activeMenu === "power" ? "active" : ""}
            onClick={() => setActiveMenu("power")}
          >
            Exhibitor Power
          </li>

          <li
            className={activeMenu === "badges" ? "active" : ""}
            onClick={() => setActiveMenu("badges")}
          >
            Exhibitor Badges
          </li>

          <li
            className={activeMenu === "furniture" ? "active" : ""}
            onClick={() => setActiveMenu("furniture")}
          >
            Extra Furniture
          </li>

          <li
            className={activeMenu === "contractor" ? "active" : ""}
            onClick={() => setActiveMenu("contractor")}
          >
            Contractor Badges
          </li>

          <li
            className={activeMenu === "Exhibitor Forms History" ? "active" : ""}
            onClick={() => setActiveMenu("Exhibitor Forms History")}
          >
            Exhibitor Forms History
          </li>

          <li
            className={activeMenu === "Exhibitor Power History" ? "active" : ""}
            onClick={() => setActiveMenu("Exhibitor Power History")}
          >
            Exhibitor Power History
          </li>
          
          <li
            className={activeMenu === "Exhibitor Fascia History" ? "active" : ""}
            onClick={() => setActiveMenu("Exhibitor Fascia History")}
          >
            Exhibitor Fascia History
          </li>
        </ul>

        {/* Logout */}

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">{renderComponent()}</div>
    </div>
  );
};

export default AdminOnePanel;
