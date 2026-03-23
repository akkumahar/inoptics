import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdMenu } from "react-icons/io";


import "./AdminThreePanel.css";
import AdminThreePower from "./List/AdminThreePower";

const AdminThreePanel = () => {
  const [activeMenu, setActiveMenu] = useState("power");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [exhibitorData, setExhibitorData] = useState([]);

  // ✅ LOGIN GUARD
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/powerload");
    }
  }, [navigate]);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/powerload");
  };

  // ✅ Fetch Data
  useEffect(() => {
    fetchExhibitorData();
  }, []);

  const fetchExhibitorData = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_exhibitors.php");
      const data = await res.json();
      setExhibitorData(data);
    } catch (error) {
      console.error("Failed to fetch exhibitors:", error);
    }
  };

  // ✅ Render Component
  const renderComponent = () => {
    switch (activeMenu) {
      case "power":
        return <AdminThreePower exhibitorData={exhibitorData} />;
      default:
        return <AdminThreePower exhibitorData={exhibitorData} />;
    }
  };

  return (
    <div className="admin-layout">
      {/* 🔥 Top Navbar (Mobile) */}
      <div className="admin-navbar">
        <IoMdMenu
        size={24}
        color="red"
          className="menu-icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <h2 className="desktop-title">Admin Power</h2>

        <ul>
          <li
            className={activeMenu === "power" ? "active" : ""}
            onClick={() => {
              setActiveMenu("power");
              setSidebarOpen(false); // mobile auto close
            }}
          >
            Exhibitor Power
          </li>
        </ul>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Content */}
      <div className="admin-content">{renderComponent()}</div>
    </div>
  );
};

export default AdminThreePanel;