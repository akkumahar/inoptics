import React, { useState } from "react";



import "./AdminPanel.css";
import FasciaNameAdmin from "./List/FasciaNameAdmin";
import AdminPowerRequirement from "./List/AdminPowerRequirement";
import AdminBadges from "./List/AdminBadges";
import ExtraFurnitureManager from "./List/ExtraFurnitureManager";
import ContractorBadgesAdmin from "./List/ExtraFurnitureManager";

const AdminPanel = () => {
  const [activeMenu, setActiveMenu] = useState("fascia");

  const renderComponent = () => {
    switch (activeMenu) {
      case "fascia":
        return <FasciaNameAdmin />;

      case "power":
        return <AdminPowerRequirement />;

      case "badges":
        return <AdminBadges />;

      case "furniture":
        return <ExtraFurnitureManager />;

      case "contractor":
        return <ContractorBadgesAdmin />;

      default:
        return <FasciaNameAdmin />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}

      <div className="admin-sidebar">
        <h2>Admin Panel</h2>

        <ul>
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
        </ul>
      </div>

      {/* Content */}

      <div className="admin-content">{renderComponent()}</div>
    </div>
  );
};

export default AdminPanel;
