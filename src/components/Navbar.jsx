import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from '../assets/INOP_BLUE.png';
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hoverBgRef = useRef(null);
  const menuRef = useRef(null);

  const [logo, setLogo] = useState(null);


  const handleNavigation = (path) => {
    navigate(`/${path}`);
  };

  const isActive = (path) => location.pathname === `/${path}`;

   const visitorGuidePaths = ["/visitor-guide", "/metro-map", "/exhibition-map", "/weather", "/tourist-spots", "/exhibitor-list"];
  // const exhibitorPaths = ["/for-exhibitors", "/why-exhibit", "/become-exhibitor", "/rules-policy", "/exhibitor-list", "/increase-visibility"];
  const pressPaths = ["/press", "/press-release", "/media-gallery"];
  const cepPaths = ["/about-cep", "/topics", "/faculty", "/testimonials"];

  // Reusable helper
  const isDropdownActive = (paths) => paths.includes(location.pathname);

  const updateHoverBgPosition = () => {
    const activeItem = menuRef.current.querySelector("li.active");
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
    const rect = e.target.getBoundingClientRect();
    const parentRect = menuRef.current.getBoundingClientRect();
    hoverBgRef.current.style.left = `${rect.left - parentRect.left}px`;
    hoverBgRef.current.style.width = `${rect.width}px`;
  };

  const handleMouseLeave = () => {
    updateHoverBgPosition();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={Logo} alt="Logo" className="logo-image" />
 
      </div>

      <div className="navbar-right">
        <div className="menu-wrapper">
          <ul className="menu-list" ref={menuRef}>
            <li
              className={isActive("home") ? "active" : ""}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <a href="#" onClick={() => handleNavigation("home")}>Home</a>
            </li>

            <li
              className={isActive("about") ? "active" : ""}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link to="/about">About Us</Link>
            </li>

         <li className={`dropdown ${isDropdownActive(visitorGuidePaths) ? "active" : ""}`}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}>
  <Link to="/visitor-guide">Visitor Guide</Link>
  <ul className="dropdown-menu">
    <li><Link to="/visitor-guide/metro-map">Metro Map</Link></li>
    {/* <li><Link to="/visitor-guide/exhibition-map">Exhibition Map</Link></li> */}
    <li><Link to="/visitor-guide/weather">Weather Info</Link></li>
    <li><Link to="/visitor-guide/tourist-spots">Tourist Spots</Link></li>
      <li><Link to="/visitor-guide/exhibitor-list">Exhibitor List</Link></li> 
  </ul>
</li>

  

         <li className={`dropdown ${isDropdownActive(pressPaths) ? "active" : ""}`}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}>
  <Link to="/press">Press</Link>
  <ul className="dropdown-menu">
    <li><Link to="/press/press-release">Press Release</Link></li>
    <li><Link to="/press/media-gallery">Media Gallery</Link></li>
  </ul>
</li>

   <li
              className={isActive("benefactors") ? "active" : ""}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link to="/benefactors">Our Partners</Link>
            </li>

          <li
  className={isActive("/reach-venue") ? "active" : ""}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
>
  <Link 
    to="/reach-venue" 
    state={{ from: "main-navbar" }}   
  >
    How To Reach Venue
  </Link>
</li>

            <li
              className={isActive("contact") ? "active" : ""}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link to="/contact">Contact Us</Link>
            </li>

            <span className="hover-bg" ref={hoverBgRef}></span>
          </ul>
        </div>
      </div>
    <div className="navbar-buttons">
  
  <button
    className="big-button"
    onClick={() => window.open('/for-exhibitors', '_blank')}
  >
    EXHIBITORS PERSONAL AREA
  </button>

  <button
    className="big-button"
    onClick={() => window.open('https://rsdebadge.in/', '_blank')}
  >
    VISITORS BADGE PRINT
  </button>
</div>
    </nav>
  );
};

export default Navbar;
