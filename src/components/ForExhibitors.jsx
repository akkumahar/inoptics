import React, { useEffect, useState } from 'react';
import "./ForExhibitors.css";
import Footer from "./Footer";
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { FaUsers, FaWarehouse, FaTags, FaEye } from 'react-icons/fa';

const ForExhibitors = () => {
  const [exhibitorsMain, setExhibitorsMain] = useState({});
  const [exhibitorsCards, setExhibitorsCards] = useState([]);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  // --- Fetch data on mount ---
  useEffect(() => {
    fetchExhibitorsMain();
    fetchExhibitorsCards();
  }, []);

  // --- Fetch Main ---
  const fetchExhibitorsMain = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_exhibitors_main.php");
      const data = await res.json();
      setExhibitorsMain(Array.isArray(data) ? data[0] : data || {});
    } catch (err) {
      console.error("Failed to fetch Exhibitors Main", err);
    }
  };

  // --- Fetch Cards ---
  const fetchExhibitorsCards = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_exhibitors_cards.php");
      const data = await res.json();
      setExhibitorsCards(data || []);
    } catch (err) {
      console.error("Failed to fetch Exhibitors Cards", err);
    }
  };

  return (
    <div className="main-content-wrapper">
      <div className="exhibitors-layout">
        
        {/* === LEFT SIDE (Main + Cards) === */}
        <div className="exhibitors-left">
          {/* Exhibitors Main */}
          <h1
            className="exhibitors-header"
            dangerouslySetInnerHTML={{
              __html: exhibitorsMain.header || "For Exhibitors",
            }}
          />
          <p
            className="exhibitors-text"
            dangerouslySetInnerHTML={{
              __html:
                exhibitorsMain.text ||
                "This section provides essential resources and guidelines for exhibitors at In-Optics.",
            }}
          />

          {/* Exhibitors Cards */}
          {exhibitorsCards
            .filter((card) => card.id === "2")
            .map((card) => (
              <div key={card.id} className="for-exhibitor-card full-width">
                <h2 dangerouslySetInnerHTML={{ __html: card.title }} />
                <p
                  className="for-exhibitor-card-text"
                  dangerouslySetInnerHTML={{ __html: card.description }}
                />
              </div>
            ))}
        </div>

{/* === RIGHT SIDE (Counter Wrapper + Quick Links) === */}
<div className="exhibitors-counter-wrapper right-side" ref={ref}>
  {/* Counter Boxes */}
  <div className="exhibitors-counter-box">
    <FaUsers className="exhibitors-counter-icon" />
    <h2>{inView && <CountUp end={349} duration={7} />}</h2>
    <p>Exhibitors</p>
  </div>
  <div className="exhibitors-counter-box">
    <FaWarehouse className="exhibitors-counter-icon" />
    <h2>{inView && <CountUp end={24000} duration={9} separator="," />}</h2>
    <p>Exhibition Area (sqm)</p>
  </div>
  <div className="exhibitors-counter-box">
    <FaTags className="exhibitors-counter-icon" />
    <h2>{inView && <CountUp end={1500} duration={7} separator="," />}+</h2>
    <p>Brands</p>
  </div>
  <div className="exhibitors-counter-box">
    <FaEye className="exhibitors-counter-icon" />
    <h2>{inView && <CountUp end={20000} duration={9} separator="," />}+</h2>
    <p>Visitors</p>
  </div>

  {/* Quick Links Section */}
  <div className="exhibitors-quick-links">
    <h3>Quick Links</h3>
    <ul>
      <li><a href="/why-exhibit">Why Exhibit</a></li>
      <li><a href="/become-exhibitor">Become an Exhibitor</a></li>
      <li><a href="/exhibitor-login">Login</a></li>
    </ul>
  </div>
</div>

      </div>
      <Footer />
    </div>
  );
};

export default ForExhibitors;
