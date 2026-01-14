import React, { useState, useEffect } from "react";
import "./Footer.css";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay, FreeMode } from "swiper/modules";
import { IoIosMenu } from "react-icons/io";


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
        const res = await fetch(
          "https://inoptics.in/api/get_sponsor_images_list.php"
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
      (img) => img.sponsor_type?.toLowerCase() === type.toLowerCase()
    );
    return sponsor ? `https://inoptics.in/api/${sponsor.image_path}` : null;
  };

  useEffect(() => {}, []);

  // ====== FOOTER DETAILS 1 API CALL ======
  const fetchFooterDetails1 = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_footer_details1.php"
      );
      const data = await res.json();
      setFooterDetails1(data || []);
    } catch (err) {
      console.error("Failed to fetch Footer Details 1", err);
    }
  };

  // ====== FETCH FOOTER DETAILS 2 ======
  const fetchFooterDetails2 = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_footer_details2.php"
      );
      const data = await res.json();
      setFooterDetails2(data || []);
    } catch (err) {
      console.error("Failed to fetch Footer Details 2", err);
    }
  };

  // ====== FOOTER DETAILS 3 API CALLS ======
  const fetchFooterDetails3 = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_footer_details3.php"
      );
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
      const res = await fetch(
        "https://inoptics.in/api/get_footer_details4.php"
      );
      const data = await res.json();
      setFooterDetails4(data || []);
    } catch (err) {
      console.error("Failed to fetch Footer Details 4", err);
    }
  };

  // Fetch Privacy Policy
  const fetchPrivacyDetails = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_privacy_details.php"
      );
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
        {/* ===== Sponsor Strip ===== */}
        <div >
          <div className="sponsor-strip sponsors-define-name">
            <div className="sponsors-define"><p>Platinum Sponsors</p></div>
            <div className="sponsors-define"><p>Gold Sponsors</p></div>
          </div>
          <div className="sponsor-strip">
          {/* Platinum */}
          <div className="platinum-box">
            {getSponsorImage("Footer-Platinum") && (
              <img
                src={getSponsorImage("Footer-Platinum")}
                alt="Platinum Sponsor"
              />
            )}
          </div>

          {/* Other sponsors */}
          <div className="sponsor-grid">
            {getSponsorImage("Footer-Gold") && (
              <div className="sponsor-cell">
                <img src={getSponsorImage("Footer-Gold")} alt="Gold Sponsor" />
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
                <img
                  src={getSponsorImage("Footer-hoya")}
                  alt="Foreign Partner"
                />
              </div>
            )}
            {getSponsorImage("Footer-fastrack") && (
              <div className="sponsor-cell">
                <img
                  src={getSponsorImage("Footer-fastrack")}
                  alt="Foreign Partner"
                />
              </div>
            )}
            {getSponsorImage("Footer-fastrack") && (
              <div className="sponsor-cell">
                <img
                  src={getSponsorImage("Footer-fastrack")}
                  alt="Foreign Partner"
                />
              </div>
            )}
            {getSponsorImage("Footer-Foreign") && (
              <div className="sponsor-cell-link">
                
                <p>explore more sponsors</p>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* <Swiper
         modules={[Autoplay, FreeMode]}
          loop={true}
          freeMode={{
            enabled: true,
            momentum: false,   // 👈 IMPORTANT (no snap)
            sticky: false
          }}
          slidesPerView="auto"
          spaceBetween={0}
          allowTouchMove={false}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: false
          }}
          speed={7000}
          watchSlidesProgress={true}
          grabCursor={false}
          className="continuous-swiper"
        >
          <SwiperSlide>
            {getSponsorImage("Footer-Gold") && (
              <div className="sponsor-swiper">
                <img src={getSponsorImage("Footer-Gold")} alt="Gold Sponsor" />
              </div>
            )}

          </SwiperSlide>
          <SwiperSlide>
            {getSponsorImage("Footer-Silver") && (
              <div className="sponsor-swiper">
                <img
                  src={getSponsorImage("Footer-Silver")}
                  alt="Silver Sponsor"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {getSponsorImage("Footer-hoya") && (
              <div className="sponsor-swiper">
                <img
                  src={getSponsorImage("Footer-hoya")}
                  alt="Foreign Partner"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {getSponsorImage("Footer-fastrack") && (
              <div className="sponsor-swiper">
                <img
                  src={getSponsorImage("Footer-fastrack")}
                  alt="Foreign Partner"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {getSponsorImage("Footer-Foreign") && (
              <div className="sponsor-swiper">
                <img
                  src={getSponsorImage("Footer-Foreign")}
                  alt="Foreign Partner"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
             {getSponsorImage("Footer-fastrack") && (
              <div className="sponsor-swiper">
                <img
                  src={getSponsorImage("Footer-fastrack")}
                  alt="Foreign Partner"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {getSponsorImage("Footer-Media") && (
              <div className="sponsor-swiper">
                <img
                  src={getSponsorImage("Footer-Media")}
                  alt="Media Partner"
                />
              </div>
            )}
          </SwiperSlide>

          <SwiperSlide>
            {getSponsorImage("Footer-Silver") && (
              <div className="sponsor-swiper">
                <img
                  src={getSponsorImage("Footer-Silver")}
                  alt="Silver Sponsor"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {getSponsorImage("Footer-Foreign") && (
              <div className="sponsor-swiper">
                <img
                  src={getSponsorImage("Footer-Foreign")}
                  alt="Foreign Partner"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {getSponsorImage("Footer-Foreign") && (
              <div className="sponsor-swiper">
                <img
                  src={getSponsorImage("Footer-Foreign")}
                  alt="Foreign Partner"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {getSponsorImage("Footer-Foreign") && (
              <div className="sponsor-swiper">
                <img
                  src={getSponsorImage("Footer-Foreign")}
                  alt="Foreign Partner"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {getSponsorImage("Footer-Foreign") && (
              <div className="sponsor-swiper">
                <img
                  src={getSponsorImage("Footer-Foreign")}
                  alt="Foreign Partner"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {getSponsorImage("Footer-Foreign") && (
              <div className="sponsor-swiper">
                <img
                  src={getSponsorImage("Footer-Foreign")}
                  alt="Foreign Partner"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {getSponsorImage("Footer-Foreign") && (
              <div className="sponsor-swiper">
                <img
                  src={getSponsorImage("Footer-Foreign")}
                  alt="Foreign Partner"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {getSponsorImage("Footer-Foreign") && (
              <div className="sponsor-swiper">
                <img
                  src={getSponsorImage("Footer-Foreign")}
                  alt="Foreign Partner"
                />
              </div>
            )}
          </SwiperSlide>
          <SwiperSlide>
            {getSponsorImage("Footer-Foreign") && (
              <div className="sponsor-swiper">
                <img
                  src={getSponsorImage("Footer-Foreign")}
                  alt="Foreign Partner"
                />
              </div>
            )}
          </SwiperSlide>
        </Swiper> */}

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
                    __html: addressDetail?.description || "Our Address",
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
                    __html: contactDetail?.description || "Call us at:",
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
