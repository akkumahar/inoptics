import React, { useState, useEffect } from "react";
import "./VisitorGuide.css";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

const VisitorGuide = () => {
  const [visitorMain, setVisitorMain] = useState({});
  const [visitorCards, setVisitorCards] = useState([]);
 

  // --- Fetch Data on Mount ---
  useEffect(() => {
    fetchVisitorGuideMain();
    fetchVisitorGuideCards();

  }, []);

  // --- Fetch Main ---
  const fetchVisitorGuideMain = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_visitor_guide_main.php");
      const data = await res.json();
      // API returns an array → take first row
      setVisitorMain(Array.isArray(data) ? data[0] : data || {});
    } catch (err) {
      console.error("Failed to fetch Visitor Guide Main", err);
    }
  };

  // --- Fetch Cards ---
  const fetchVisitorGuideCards = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_visitor_guide_cards.php");
      const data = await res.json();
      setVisitorCards(data || []);
    } catch (err) {
      console.error("Failed to fetch Visitor Guide Cards", err);
    }
  };


  return (
    <div className="main-content-wrapper">
      <div className="visitor-guide-container">
        <Breadcrumbs />

        {/* === Visitor Guide Main === */}
        <h1
          className="visitor-guide-header"
          dangerouslySetInnerHTML={{ __html: visitorMain.header || "Visitor Guide" }}
        />
        <p
          className="visitor-guide-text"
          dangerouslySetInnerHTML={{
            __html:
              visitorMain.text ||
              "Welcome to the In-Optics Visitor Guide. Here, you’ll find everything you need to plan your visit — from travel tips to event highlights, schedules, and facilities available at the venue.",
          }}
        />

        {/* === Visitor Guide Cards === */}
        <div className="visitor-cards">
          {visitorCards.length > 0 ? (
            visitorCards.map((card, index) => (
              <div key={card.id} className="visitor-card">
                <h2 dangerouslySetInnerHTML={{ __html: card.title }} />
                <p
                  className="visitor-exhibition-text"
                  dangerouslySetInnerHTML={{ __html: card.description }}
                />
                    
                {/* ✅ Show button only on the middle card */}
                {index === 1 && (
                  <a
                    href="https://rsdebadge.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="get-badge-btn"
                  >
                    Get Your Badge
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="visitor-card">
              <h2>Loading ...</h2>
            </div>
          )}
        </div>

      </div>


      

      <Footer />
    </div>
  );
};

export default VisitorGuide;
