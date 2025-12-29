


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { useNavigate } from 'react-router-dom';



const Footer = () => {
  const [sponsorImages, setSponsorImages] = useState([]);
  const [footerDetails1, setFooterDetails1] = useState([]);
  const [footerDetails2, setFooterDetails2] = useState([]);
  const [footerDetails3, setFooterDetails3] = useState([]);
  const [footerDetails4, setFooterDetails4] = useState([]);
   const [activeModal, setActiveModal] = useState(null); // "privacy" | "terms" | null
  const [privacyDetails, setPrivacyDetails] = useState([]);
  const [termsDetails, setTermsDetails] = useState([]);

  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
const [loginOpen, setLoginOpen] = useState(false);

const handleNavigation = (path) => {
  navigate(`/${path}`);
  setMenuOpen(false);
  setLoginOpen(false);
};

const toggleMenu = () => {
  setMenuOpen(!menuOpen);
  if (loginOpen) setLoginOpen(false);
};

const toggleLogin = () => {
  setLoginOpen(!loginOpen);
  if (menuOpen) setMenuOpen(false);
};




  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const res = await fetch("https://inoptics.in/api/get_sponsor_images_list.php");
        const data = await res.json();
        setSponsorImages(data);
      } catch (error) {
        console.error("Error fetching sponsor images:", error);
      }
    };
    fetchSponsors();
  }, []);

  const getSponsorImage = (type) => {
    const sponsor = sponsorImages.find(
      (img) => img.sponsor_type?.toLowerCase() === type.toLowerCase()
    );
    return sponsor ? `https://inoptics.in/api/${sponsor.image_path}` : null;
  };

  useEffect(() => {
    fetchFooterDetails1();
    fetchFooterDetails2();
    fetchFooterDetails3();
    fetchFooterDetails4();
  }, []);

  // ====== FOOTER DETAILS 1 API CALL ======
  const fetchFooterDetails1 = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_footer_details1.php");
      const data = await res.json();
      setFooterDetails1(data || []);
    } catch (err) {
      console.error("Failed to fetch Footer Details 1", err);
    }
  };

  // ====== FETCH FOOTER DETAILS 2 ======
  const fetchFooterDetails2 = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_footer_details2.php");
      const data = await res.json();
      setFooterDetails2(data || []);
    } catch (err) {
      console.error("Failed to fetch Footer Details 2", err);
    }
  };

  // ====== FOOTER DETAILS 3 API CALLS ======
  const fetchFooterDetails3 = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_footer_details3.php");
      const data = await res.json();
      setFooterDetails3(data || []);
    } catch (err) {
      console.error("Failed to fetch Footer Details 3", err);
    }
  };

  // ✅ Extract content by checking keywords
  const addressDetail = footerDetails3.find((item) =>
    item.description?.toLowerCase().includes("address")
  );

  const contactDetail = footerDetails3.find((item) =>
    item.description?.toLowerCase().includes("call")
  );

  const emailDetail = footerDetails3.find((item) =>
    item.description?.toLowerCase().includes("email")
  );

  // ====== FOOTER DETAILS 4 API CALL ======
  const fetchFooterDetails4 = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_footer_details4.php");
      const data = await res.json();
      setFooterDetails4(data || []);
    } catch (err) {
      console.error("Failed to fetch Footer Details 4", err);
    }
  };

 // Fetch Privacy Policy
  const fetchPrivacyDetails = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_privacy_details.php");
      const data = await res.json();
      setPrivacyDetails(data || []);
    } catch (err) {
      console.error("Failed to fetch Privacy Policy", err);
    }
  };

  // Fetch Terms & Conditions
  const fetchTermsDetails = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_terms_details.php");
      const data = await res.json();
      setTermsDetails(data || []);
    } catch (err) {
      console.error("Failed to fetch Terms & Conditions", err);
    }
  };

  // Open modal with correct data
  const openModal = (type) => {
    setActiveModal(type);
    if (type === "privacy") fetchPrivacyDetails();
    if (type === "terms") fetchTermsDetails();
  };

  const closeModal = () => setActiveModal(null);


  return (
     <>
    <footer className="footer">
      <div className="media-boxes-container custom-layout">
        {/* 1. Platinum Sponsor */}
        <div className="media-box">
        
          {getSponsorImage("Footer-Platinum") && (
            <>
              {/* <h3 className="footer-media-title">Platinum Sponsor</h3> */}
              <img
                className="media-foreground-img full-img"
                src={getSponsorImage("Footer-Platinum")}
                alt="Platinum Sponsor"
              // style={{ filter: "brightness(0)" }}
              />
            </>
          )}
        </div>

        {/* 2. Gold Sponsor */}
        <div className="media-box">
      
          {getSponsorImage("Footer-Gold") && (
            <>
              {/* <h3 className="footer-media-title">Gold Sponsor</h3> */}
              <img
                className="media-foreground-img full-img"
                src={getSponsorImage("Footer-Gold")}
                alt="Gold Sponsor"
              />
            </>
          )}
        </div>

        {/* 3. Silver Sponsor */}
        <div className="media-box">
       
          {getSponsorImage("Footer-Silver") && (
            <>
              {/* <h3 className="footer-media-title">Silver Sponsor</h3> */}
              <img
                className="media-foreground-img full-img"
                src={getSponsorImage("Footer-Silver")}
                alt="Silver Sponsor"
              />
            </>
          )}
        </div>

        {/* 4. Media Partner */}
        <div className="media-box">
      
          {getSponsorImage("Footer-Media") && (
            <>
              {/* <h3 className="footer-media-title">Media Partner</h3> */}
              <img
                className="media-foreground-img full-img"
                src={getSponsorImage("Footer-Media")}
                alt="Media Partner"
              />
            </>
          )}
        </div>

        {/* 5. Foreign Partner */}
        <div className="media-box">
       
          {getSponsorImage("Footer-Foreign") && (
            <>
              {/* <h3 className="footer-media-title">Foreign Partner</h3> */}
              <img
                className="media-foreground-img full-img"
                src={getSponsorImage("Footer-Foreign")}
                alt="Foreign Partner"
              />
            </>
          )}
        </div>
      </div>


      <div className="footer-address">
        <div className="footer-col">
          <div className="footer-column1">
            {footerDetails1.length > 0 && (
              <>
                <img
                  src={footerDetails1[0].image}
                  alt="Footer Logo"
                  className="footer-logo-img"
                />
                <p
                  className="footer-description1"
                  dangerouslySetInnerHTML={{
                    __html: footerDetails1[0]?.description || "Loading footer description...",
                  }}
                ></p>
              </>
            )}
          </div>
        </div>

        <div className="footer-column2">
          {/* ✅ Fetch Title */}
          <p className="stay-updated">
            {footerDetails2[0]?.title || "Loading..."}
          </p>

          <form className="mailing-list">
            <div className="input-wrapper">
              <input type="text" placeholder="Your Email Address" />
              <button type="submit">
                <i className="fab fa-telegram-plane"></i>
              </button>
            </div>
          </form>

          {/* ✅ Fetch Description with HTML support */}
          <p
            className="footer-description2"
            dangerouslySetInnerHTML={{
              __html:
                footerDetails2[0]?.description ||
                "Big announcements, cutting-edge updates, and exclusive offers — straight to your inbox. Enter your email above and stay one step ahead.",
            }}
          />
        </div>



        <div className="footer-col1">
          {/* === Find Us === */}
          <div className="find-us">
            <p>
              <i className="fas fa-map-marker-alt"></i>
              <span
                className="stay-updated2"
                style={{ marginLeft: "8px" }}
                dangerouslySetInnerHTML={{
                  __html:
                    addressDetail?.description || "Our Address",
                }}
              />
            </p>
          </div>

          {/* === Contact === */}
          <div className="contact">
            <p>
              <i className="fas fa-phone"></i>
              <span
                className="stay-updated2"
                style={{ marginLeft: "8px" }}
                dangerouslySetInnerHTML={{
                  __html:
                    contactDetail?.description || "Call us at:",
                }}
              />
            </p>
          </div>

          {/* === Email === */}
          <div className="Email">
            <p>
              <i className="far fa-envelope-open"></i>
              <span
                className="stay-updated2"
                style={{ marginLeft: "8px" }}
                dangerouslySetInnerHTML={{
                  __html:
                    emailDetail?.description || "Email:",
                }}
              />
            </p>
          </div>
        </div>

        <div className="footer-column3">
          <div className="org">
            {footerDetails4.map((item, index) => (
              <div className="event-item" key={index}>
                {/* Title from backend */}
                <p className="footer-description">{item.title}</p>

                {/* Image from backend */}
                <img
                  src={item.image}
                  alt={item.title}
                  className={`event-image${index + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

          <div className="copyright-area">
          <p className="cp-description">
            © 2021 Inoptic. All rights reserved. Developed by RSD Expositions.
            <span className="separator">|</span>
            <button
              className="link-button"
              onClick={() => openModal("privacy")}
            >
              Privacy Policy
            </button>
            <span className="separator">|</span>
            <button className="link-button" onClick={() => openModal("terms")}>
              Terms & Conditions
            </button>
          </p>
        </div>



{/* footer mobile-stickt-menu */}
<div className="mobile-footer-navbar">
  {/* Slide-up Panel for Menu */}
  <div className={`footer-slideup-panel ${menuOpen ? "open" : ""}`}>
    <ul>
      <li onClick={() => handleNavigation("home")}>Home</li>
      <li onClick={() => handleNavigation("about")}>About Us</li>
      <li onClick={() => handleNavigation("visitor-guide")}>Visitor Guide</li>
      <li onClick={() => handleNavigation("press")}>Press</li>
      <li onClick={() => handleNavigation("contact")}>Contact Us</li>
    </ul>
  </div>

  {/* Slide-up Panel for Login */}
  <div className={`footer-slideup-panel ${loginOpen ? "open" : ""}`}>
    <ul>
      <li onClick={() => window.open("/for-exhibitors", "_blank")}>
        Exhibitors Personal Area
      </li>
      <li onClick={() => window.open("https://rsdebadge.in/", "_blank")}>
        Visitors Badge Print
      </li>
    </ul>
  </div>

  {/* Button Bar (always fixed at bottom) */}
  <div className="footer-nav-buttons">
    <button onClick={toggleMenu}>
      <i className="fas fa-bars"></i>
      <span>Menu</span>
    </button>
    <button onClick={toggleLogin}>
      <i className="fas fa-lock"></i>
      <span>Login</span>
    </button>
  </div>
</div>


    </footer>

 
  {/* Modal */}
{activeModal && (
  <div className="custom-modal-overlay">
    <div className="custom-modal-box">
      <div className="custom-modal-header">
        <h2>
          {activeModal === "privacy"
            ? "Privacy Policy"
            : "Terms & Conditions"}
        </h2>
        <button className="custom-close-btn" onClick={closeModal}>
          ✕
        </button>
      </div>

      <div className="custom-modal-content">
        {activeModal === "privacy" &&
          (privacyDetails.length > 0 ? (
            privacyDetails.map((item, i) => (
              <p
                key={i}
                dangerouslySetInnerHTML={{
                  __html: item.description,
                }}
              />
            ))
          ) : (
            <p>Loading Privacy Policy...</p>
          ))}

        {activeModal === "terms" &&
          (termsDetails.length > 0 ? (
            termsDetails.map((item, i) => (
              <p
                key={i}
                dangerouslySetInnerHTML={{
                  __html: item.description,
                }}
              />
            ))
          ) : (
            <p>Loading Terms & Conditions...</p>
          ))}
      </div>
    </div>
  </div>
)}

    </>


  );
};

export default Footer;
