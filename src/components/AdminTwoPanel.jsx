import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./AdminTwoPanel.css";
import FasciaNameAdmin from "./List/FasciaNameAdmin";
import AdminPowerRequirement from "./List/AdminPowerRequirement";
import AdminTwoBadges from "./badgesAdmin/AdminTwoBadges";
import ExtraFurnitureManager from "./List/ExtraFurnitureManager";
import ContractorBadgesAdmin from "./List/ExtraFurnitureManager";

const AdminTwoPanel = () => {
  const [activeMenu, setActiveMenu] = useState("fascia");
  const navigate = useNavigate();

  // ✅ LOGIN GUARD
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!isLoggedIn) {
      navigate("/exhibitor-badges-printing");
    }
  }, [navigate]);

  // ✅ Logout Function
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("adminEmail");
    sessionStorage.clear();

    navigate("/exhibitor-badges-printing");
  };

  const renderComponent = () => {
    switch (activeMenu) {
      // case "fascia":
      //   return <FasciaNameAdmin />;

      // case "power":
      //   return <AdminPowerRequirement />;

      case "badges":
        return <AdminTwoBadges />;

      // case "furniture":
      //   return <ExtraFurnitureManager />;

      // case "contractor":
      //   return <ContractorBadgesAdmin />;

      // default:
      //   return <FasciaNameAdmin />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <h2>Exhibitor Badges</h2>

        
        <ul>
          {/* <li
            className={activeMenu === "fascia" ? "active" : ""}
            onClick={() => setActiveMenu("fascia")}
          >
            Fascia Name
          </li> */}

          {/* <li
            className={activeMenu === "power" ? "active" : ""}
            onClick={() => setActiveMenu("power")}
          >
            Exhibitor Power
          </li> */}

          <li
            className={activeMenu === "badges" ? "active" : ""}
            onClick={() => setActiveMenu("badges")}
          >
            Exhibitor Badges
          </li>

          {/* <li
            className={activeMenu === "furniture" ? "active" : ""}
            onClick={() => setActiveMenu("furniture")}
          >
            Extra Furniture
          </li> */}

          {/* <li
            className={activeMenu === "contractor" ? "active" : ""}
            onClick={() => setActiveMenu("contractor")}
          >
            Contractor Badges
          </li> */}
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

export default AdminTwoPanel;