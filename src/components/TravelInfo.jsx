import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./TravelInfo.css";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs"; 

const TravelInfo = () => {
  const [travelMain, setTravelMain] = useState({});
  const [travelCards, setTravelCards] = useState([]);
 
const location = useLocation();
const queryParams = new URLSearchParams(location.search);
const fromExhibitor = queryParams.get("from") === "exhibitor";
console.log("Location state:", location.state);
console.log("From Exhibitor:", fromExhibitor);


  useEffect(() => {
    fetchTravelMain();
    fetchTravelCards();
  }, []);

  const fetchTravelMain = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_reach_main.php");
      const data = await res.json();
      setTravelMain(data || {});
    } catch (err) {
      console.error("Failed to fetch Travel Main", err);
    }
  };

  const fetchTravelCards = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_reach_cards.php");
      const data = await res.json();
      setTravelCards(data || []);
    } catch (err) {
      console.error("Failed to fetch Travel Cards", err);
    }
  };

  return (
    <div className="main-content-wrapper">
      <div className="reach-venue-container">
        <Breadcrumbs />
        <div className="reach-venue-extra-container">
         
          
          <h2
            className="visitor-extra-title"
            dangerouslySetInnerHTML={{
              __html: travelMain.title || "Travel Information",
            }}
          />
          <p dangerouslySetInnerHTML={{ __html: travelMain.text }} />

        
          {travelCards.length > 0 ? (
            travelCards.map((card) => (
              <div
                key={card.id}
                className="visitor-extra-content"
                style={{
                  display: "flex",
                  gap: "20px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  flexDirection:
                    card.position === "Left" ? "row-reverse" : "row",
                }}
              >
                <div className="visitor-extra-text" style={{ flex: 1 }}>
                  <p dangerouslySetInnerHTML={{ __html: card.description }} />
                </div>
                <div className="visitor-extra-image-wrapper" style={{ flex: 1 }}>
                  <img
                    src={card.image}
                    alt="Travel Info"
                    className="visitor-extra-image"
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p>Loading travel information...</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TravelInfo;
