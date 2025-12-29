import React, { useRef, useState, useEffect } from "react";
import Draggable from "react-draggable";
import {
  FaInstagram,
  FaYoutube,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";
import "./FloatingCard.css";

const FloatingCard = () => {
  const nodeRef = useRef(null);
  const [floatingCards, setFloatingCards] = useState([]);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    fetchFloatingCards();
  }, []);

  const fetchFloatingCards = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/get_floatingcard_details.php"
      );
      const data = await res.json();
      setFloatingCards(data || []);
    } catch (err) {
      console.error("Failed to fetch Floating Card Details", err);
    }
  };

  return (
    <Draggable nodeRef={nodeRef}>
      <div
        className={`floating-card ${minimized ? "minimized" : ""}`}
        ref={nodeRef}
      >
        {/* Expanded View */}
        {!minimized && (
          <div className="card-body">
            {/* Left side → text */}
            <div className="card-text">
              <button
                className="minimize-btn"
                onClick={() => setMinimized(true)}
              >
                –
              </button>

              {floatingCards.length > 0 ? (
                floatingCards.map((card) => (
                  <div key={card.id} className="visitor-card-floating">
                    <h3
                      className="visitor-title"
                      dangerouslySetInnerHTML={{ __html: card.title }}
                    />
                    <p
                      className="visitor-description"
                      dangerouslySetInnerHTML={{ __html: card.description }}
                    />
                  </div>
                ))
              ) : (
                <p>Loading floating card data...</p>
              )}
            </div>

            {/* Right side → icons */}
            <div className="social-icons-vertical">
              <a href="https://www.instagram.com/inoptic99/#" target="_blank" rel="noopener noreferrer" className="instagram"><FaInstagram /></a>
              <a href="https://www.youtube.com/channel/UCZzX2F7ztBatHyOkZo2cmQw" target="_blank" rel="noopener noreferrer" className="youtube"><FaYoutube /></a>
              <a href="https://www.facebook.com/inopticsonoptics" target="_blank" rel="noopener noreferrer" className="facebook"><FaFacebook /></a>
              <a href="https://x.com/in_inoptics" target="_blank" rel="noopener noreferrer" className="twitter"><FaTwitter /></a>
              <a href="https://www.linkedin.com/company/inoptics" target="_blank" rel="noopener noreferrer" className="linkedin"><FaLinkedin /></a>
            </div>
          </div>
        )}

        {/* Minimized View */}
        {minimized && (
          <div className="social-icons-vertical minimized-icons">
            <a href="https://www.instagram.com/inoptic99/#" target="_blank" rel="noopener noreferrer" className="instagram"><FaInstagram /></a>
            <a href="https://www.youtube.com/channel/UCZzX2F7ztBatHyOkZo2cmQw" target="_blank" rel="noopener noreferrer" className="youtube"><FaYoutube /></a>
            <a href="https://www.facebook.com/inopticsonoptics" target="_blank" rel="noopener noreferrer" className="facebook"><FaFacebook /></a>
            <a href="https://x.com/in_inoptics" target="_blank" rel="noopener noreferrer" className="twitter"><FaTwitter /></a>
            <a href="https://www.linkedin.com/company/inoptics" target="_blank" rel="noopener noreferrer" className="linkedin"><FaLinkedin /></a>

            {/* Expand button at bottom */}
            <button className="expand-btn" onClick={() => setMinimized(false)}>
              +
            </button>
          </div>
        )}
      </div>
    </Draggable>
  );
};

export default FloatingCard;
