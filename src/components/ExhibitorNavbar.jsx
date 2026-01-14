import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { IoIosMenu } from "react-icons/io";
import Logo from "../assets/INOP_BLUE.png";
import "./ExhibitorNavbar.css";

const ExhibitorNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hoverBgRef = useRef(null);
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (path) => {
    navigate(`/${path}`);
    setIsMenuOpen(false);
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

  const handleMouseEnter = (e) => {
    if (window.innerWidth > 1024) {
      const rect = e.target.getBoundingClientRect();
      const parentRect = menuRef.current.getBoundingClientRect();
      hoverBgRef.current.style.left = `${rect.left - parentRect.left}px`;
      hoverBgRef.current.style.width = `${rect.width}px`;
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth > 1024) {
      updateHoverBgPosition();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="exhibitor-navbar">
        <div className="exhibitor-navbar-left">
          <img src={Logo} alt="Logo" className="exhibitor-logo-image" />
        </div>

        {/* Desktop Menu */}
        <div className="exhibitor-navbar-right">
          <div className="exhibitor-menu-wrapper">
            <ul className="exhibitor-menu-list" ref={menuRef}>
              <li
                className={isActive("for-exhibitors") ? "active" : ""}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link to="/for-exhibitors">For Exhibitors</Link>
              </li>
              <li
                className={isActive("exhibitor-exhibition-map") ? "active" : ""}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link to="/exhibitor-exhibition-map">Exhibition Map</Link>
              </li>
              <li
                className={isActive("why-exhibit") ? "active" : ""}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link to="/why-exhibit">Why Exhibit</Link>
              </li>
              <li
                className={isActive("become-exhibitor") ? "active" : ""}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link to="/become-exhibitor">Become An Exhibitor</Link>
              </li>
              <li
                className={isActive("rules-policy") ? "active" : ""}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link to="/rules-policy">Rules & Policy</Link>
              </li>
              <li
                className={isActive("reach-venue") ? "active" : ""}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link to="/reach-venue" state={{ fromExhibitor: true }}>
                  How To Reach Venue
                </Link>
              </li>
              <li
                className={isActive("exhibitor-login") ? "active" : ""}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link to="/exhibitor-login">Login</Link>
              </li>
              <span className="exhibitor-hover-bg" ref={hoverBgRef}></span>
            </ul>
          </div>
        </div>

        {/* Desktop Buttons */}
        <div className="exhibitor-navbar-buttons">
          <button
            className="exhibitor-big-button"
            onClick={() => handleNavigation("")}
          >
            VISITOR AREA
          </button>
        </div>
      </nav>

      {/* Mobile/Tablet Menu */}
      <div className={`exhibitor-mobile-menu ${isMenuOpen ? "active" : ""}`}>
        <ul className="exhibitor-mobile-menu-list">
          <li onClick={() => handleNavigation("for-exhibitors")}>
            <Link to="/for-exhibitors">For Exhibitors</Link>
          </li>
          <li onClick={() => handleNavigation("exhibitor-exhibition-map")}>
            <Link to="/exhibitor-exhibition-map">Exhibition Map</Link>
          </li>
          <li onClick={() => handleNavigation("why-exhibit")}>
            <Link to="/why-exhibit">Why Exhibit</Link>
          </li>
          <li onClick={() => handleNavigation("become-exhibitor")}>
            <Link to="/become-exhibitor">Become An Exhibitor</Link>
          </li>
          <li onClick={() => handleNavigation("rules-policy")}>
            <Link to="/rules-policy">Rules & Policy</Link>
          </li>
          <li onClick={() => setIsMenuOpen(false)}>
            <Link to="/reach-venue" state={{ fromExhibitor: true }}>
              How To Reach Venue
            </Link>
          </li>
          <li onClick={() => handleNavigation("exhibitor-login")}>
            <Link to="/exhibitor-login">Login</Link>
          </li>
        </ul>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="exhibitor-mobile-bottom-bar">
        <div className="exhibitor-hamburger-icon" onClick={toggleMenu}>
          {isMenuOpen ? (
            <span>
              <IoIosMenu className="exhibitor-mobile-menu-icon" />
              Menu
            </span>
          ) : (
            <span>
              <IoIosMenu className="exhibitor-mobile-menu-icon" />
              Menu
            </span>
          )}
        </div>

        <button
          className="exhibitor-bottom-btn"
          onClick={() => handleNavigation("")}
        >
          VISITOR AREA
        </button>
      </div>
    </>
  );
};

export default ExhibitorNavbar;
