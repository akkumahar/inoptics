// src/components/ExhibitorNavbar.jsx
import React, { useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/INOP_BLUE.png";
import "./Navbar.css";
import "./ExhibitorNavbar.css";

const ExhibitorNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hoverBgRef = useRef(null);
  const menuRef = useRef(null);

  const handleNavigation = (path) => {
    navigate(`/${path}`);
  };

  const isActive = (path) => location.pathname === `/${path}`;

  const updateHoverBgPosition = () => {
    const activeItem = menuRef.current?.querySelector("li.active");
    const hoverBg = hoverBgRef.current;

    if (activeItem && hoverBg) {
      const rect = activeItem.getBoundingClientRect();
      const parentRect = menuRef.current.getBoundingClientRect();
      const left = rect.left - parentRect.left;
      hoverBg.style.left = `${left}px`;
      hoverBg.style.width = `${rect.width}px`;
    }
  };

  useEffect(() => {
    updateHoverBgPosition();
    window.addEventListener("resize", updateHoverBgPosition);
    return () => window.removeEventListener("resize", updateHoverBgPosition);
  }, [location]);

  return (
    <nav className="exhibitorloggedin-navbar">
      {/* Left Side Logo */}
      <div className="exhibitorloggedin-navbar-left">
        <img src={Logo} alt="Logo" className="exhibitorloggedin-logo-image" />
      </div>

      {/* Middle Menu */}
      <div className="exhibitorloggedin-navbar-right">
        <div className="exhibitorloggedin-menu-wrapper">
          <ul className="exhibitorloggedin-menu-list" ref={menuRef}>
            <li className={isActive("for-exhibitors") ? "active" : ""}>
              <Link to="/for-exhibitors">For Exhibitors</Link>
            </li>
             <li className={isActive("exhibitor-exhibition-map") ? "active" : ""}>
    <Link to="/exhibitor-exhibition-map">Exhibition Map</Link>
  </li>
            <li className={isActive("why-exhibit") ? "active" : ""}>
              <Link to="/why-exhibit">Why Exhibit</Link>
            </li>
            <li className={isActive("become-exhibitor") ? "active" : ""}>
              <Link to="/become-exhibitor">Become An Exhibitor</Link>
            </li>
            <li className={isActive("rules-policy") ? "active" : ""}>
              <Link to="/rules-policy">Rules & Policy</Link>
            </li>
             <li className={isActive("reach-venue") ? "active" : ""}>
  <Link to="/reach-venue" state={{ fromExhibitor: true }}>
    How To Reach Venue
  </Link>
</li>

              <li className={isActive("exhibitor-login") ? "active" : ""}>
    <Link to="/exhibitor-login">Login</Link>
  </li>

            <span className="exhibitorloggedin-hover-bg" ref={hoverBgRef}></span>
          </ul>
        </div>
      </div>

      {/* Right Side Buttons */}
     <div className="exhibitorloggedin-navbar-buttons">
  <button
    className="exhibitorloggedin-big-button"
    onClick={() => handleNavigation("")}  // empty string → "/"
  >
    VISITOR AREA
  </button>
</div>
    </nav>
  );
};

export default ExhibitorNavbar;
