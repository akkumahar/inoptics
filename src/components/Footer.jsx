import React, { useState, useEffect } from "react";
import "./Footer.css";
import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
  const [sponsorImages, setSponsorImages] = useState([]);
  const [footerDetails1, setFooterDetails1] = useState([]);
  const [footerDetails2, setFooterDetails2] = useState([]);
  const [footerDetails3, setFooterDetails3] = useState([]);
  const [footerDetails4, setFooterDetails4] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
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
        const res = await fetch(
          "https://inoptics.in/api/get_sponsor_images_list.php",
        );
        const data = await res.json();
        setSponsorImages(data);
      } catch (error) {
        console.error("Error fetching sponsor images:", error);
      }
    };
    fetchSponsors();
    fetchFooterDetails1();
    fetchFooterDetails2();
    fetchFooterDetails3();
    fetchFooterDetails4();
  }, []);

  const getSponsorImage = (type) => {
    const sponsor = sponsorImages.find(
      (img) => img.sponsor_type?.toLowerCase() === type.toLowerCase(),
    );
    return sponsor ? `https://inoptics.in/api/${sponsor.image_path}` : null;
  };

  const fetchFooterDetails1 = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_footer_details1.php",
      );
      const data = await res.json();
      setFooterDetails1(data || []);
    } catch (err) {
      console.error("Failed to fetch Footer Details 1", err);
    }
  };

  const fetchFooterDetails2 = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_footer_details2.php",
      );
      const data = await res.json();
      setFooterDetails2(data || []);
    } catch (err) {
      console.error("Failed to fetch Footer Details 2", err);
    }
  };

  const fetchFooterDetails3 = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_footer_details3.php",
      );
      const data = await res.json();
      setFooterDetails3(data || []);
    } catch (err) {
      console.error("Failed to fetch Footer Details 3", err);
    }
  };

  const addressDetail = footerDetails3.find((item) =>
    item.description?.toLowerCase().includes("address"),
  );

  const contactDetail = footerDetails3.find((item) =>
    item.description?.toLowerCase().includes("call"),
  );

  const emailDetail = footerDetails3.find((item) =>
    item.description?.toLowerCase().includes("email"),
  );

  const fetchFooterDetails4 = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_footer_details4.php",
      );
      const data = await res.json();
      setFooterDetails4(data || []);
    } catch (err) {
      console.error("Failed to fetch Footer Details 4", err);
    }
  };

  const fetchPrivacyDetails = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_privacy_details.php",
      );
      const data = await res.json();
      setPrivacyDetails(data || []);
    } catch (err) {
      console.error("Failed to fetch Privacy Policy", err);
    }
  };

  const fetchTermsDetails = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_terms_details.php");
      const data = await res.json();
      setTermsDetails(data || []);
    } catch (err) {
      console.error("Failed to fetch Terms & Conditions", err);
    }
  };

  const openModal = (type) => {
    setActiveModal(type);
    if (type === "privacy") fetchPrivacyDetails();
    if (type === "terms") fetchTermsDetails();
  };

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <footer className="footer">
        {/* ===== Sponsor Header Strip ===== */}
        <div className="sponsor-header-strip">
          <div className="sponsors-define sponsors-define-mobile-view">
            <p>Platinum Sponsors</p>
          </div>
          <div className="sponsors-define sponsors-define-mobile-view particular-mobile-view-hide">
            <p>Gold Sponsors</p>
          </div>
        </div>

        {/* ===== Main Sponsor Strip ===== */}
        <div className="sponsor-strip">
          <div className="sponsors-define-mobile-view-show">
            <div className="sponsors-define">
              <p>Platinum Sponsors</p>
            </div>
          </div>
          {/* Platinum */}
          <div className="platinum-box">
            {getSponsorImage("Footer-Platinum") && (
              <img
                src={getSponsorImage("Footer-Platinum")}
                alt="Platinum Sponsor"
              />
            )}
          </div>

          {/* Gold Sponsors Grid */}
          <div>
            <div className="sponsors-define-mobile-view-show mobile-view-show">
              <div className="sponsors-define ">
                <p>Gold Sponsors</p>
              </div>
            </div>

            <div className="sponsor-grid">
              {getSponsorImage("Footer-Gold") && (
                <div className="sponsor-cell">
                  <img
                    src={getSponsorImage("Footer-Gold")}
                    alt="Gold Sponsor"
                  />
                </div>
              )}

              {getSponsorImage("Footer-Silver") && (
                <div className="sponsor-cell">
                  <img
                    src={getSponsorImage("Footer-Silver")}
                    alt="Silver Sponsor"
                  />
                </div>
              )}

              {getSponsorImage("Footer-Media") && (
                <div className="sponsor-cell">
                  <img
                    src={getSponsorImage("Footer-Media")}
                    alt="Media Partner"
                  />
                </div>
              )}

              {getSponsorImage("Footer-Foreign") && (
                <div className="sponsor-cell">
                  <img
                    src={getSponsorImage("Footer-Foreign")}
                    alt="Foreign Partner"
                  />
                </div>
              )}

              {getSponsorImage("Footer-hoya") && (
                <div className="sponsor-cell">
                  <img src={getSponsorImage("Footer-hoya")} alt="Hoya" />
                </div>
              )}

              {getSponsorImage("Footer-fastrack") && (
                <div className="sponsor-cell">
                  <img
                    src={getSponsorImage("Footer-fastrack")}
                    alt="Fastrack"
                  />
                </div>
              )}

              {getSponsorImage("Footer-fastrack") && (
                <div className="sponsor-cell">
                  <img
                    src={getSponsorImage("Footer-fastrack")}
                    alt="Fastrack"
                  />
                </div>
              )}

              <div className="sponsor-cell-link">
                <Link to="/benefactors" className="explore-link">
                  Explore More Sponsors
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Footer Address Section ===== */}
        <div className="footer-address">
          <div className="footer-col">
            <div className="footer-column1">
              {footerDetails1.length > 0 && (
                <>
                  <Link to="/">
                    <img
                    src={footerDetails1[0].image}
                    alt="Footer Logo"
                    className="footer-logo-img"
                  />
                  </Link>
                  
                  <p
                    className="footer-description1"
                    dangerouslySetInnerHTML={{
                      __html:
                        footerDetails1[0]?.description ||
                        "Loading footer description...",
                    }}
                  ></p>
                </>
              )}
            </div>
          </div>

          <div className="footer-column2">
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

            <p
              className="footer-description2"
              dangerouslySetInnerHTML={{
                __html:
                  footerDetails2[0]?.description ||
                  "Big announcements, cutting-edge updates, and exclusive offers — straight to your inbox. Enter your email above and stay one step ahead.",
              }}
            />
          </div>

          <div className="footer-col1 footer-column-left-align">
            <div className="find-us">
              <p>
                <i className="fas fa-map-marker-alt"></i>
                <span
                  className="stay-updated2-address"
                  dangerouslySetInnerHTML={{
                    __html: addressDetail?.description || "Our Address",
                  }}
                />
              </p>
            </div>

            <div className="contact">
              <p>
                <i className="fas fa-phone"></i>

                <a
                  href={`tel:${(contactDetail?.description || "")
                    .replace(/<[^>]*>/g, "") // html tags remove
                    .replace(/[^0-9+]/g, "")}`} // only number keep
                  className="stay-updated2"
                  dangerouslySetInnerHTML={{
                    __html: contactDetail?.description || "Call us at:",
                  }}
                />
              </p>
            </div>

            <div className="Email">
              <p>
                <i className="far fa-envelope-open"></i>
                <a
                  href={`mailto:${(emailDetail?.description || "")
                    .replace(/<[^>]*>/g, "") // html tags remove
                    .replace(/.*?:/, "") // "Email:" label remove
                    .trim()}`}
                  className="stay-updated2-address-phone-email"
                  dangerouslySetInnerHTML={{
                    __html: emailDetail?.description || "Email:",
                  }}
                />
              </p>
            </div>
          </div>

          <div className="footer-column3">
            <div className="org">
              {footerDetails4.map((item, index) => (
                <div className="event-item" key={index}>
                  <p className="footer-description">{item.title}</p>
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

        {/* ===== Copyright Area ===== */}
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
      </footer>

      {/* Modal */}
      {activeModal && (
        <div className="custom-modal-overlay" onClick={closeModal}>
          <div
            className="custom-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
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
