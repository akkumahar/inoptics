import React, { useEffect, useState } from 'react';
import './ExhibitorExhibitonMap.css';
import Footer from './Footer';
import Breadcrumbs from "./Breadcrumbs"; 

const ExhibitionMap = () => {
  const [exhibitionData, setExhibitionData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExhibitionData = async () => {
    try {
      const response = await fetch("https://inoptics.in/api/get_exhibition_map.php");
      const text = await response.text();
      const data = JSON.parse(text);
      console.log("Fetched Exhibition Map Data:", data);
      setExhibitionData(data);
    } catch (error) {
      console.error("Error fetching exhibition data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibitionData();
  }, []);

  const getImageUrl = () => {
    if (exhibitionData.length > 0 && exhibitionData[0].image) {
      return exhibitionData[0].image; 
    }
    return null;
  };

  return (
    <div className="main-content-wrapper">
      <div className="exhibition-container">
        <Breadcrumbs />
        <h1 className="exh-header">Exhibition Map</h1>
        <p className="exh-text">Save Time, Find the Booths – The Exhibition Map is Your Personal Guide to In-Optics!</p>

        {loading ? (
          <p>Loading map...</p>
        ) : getImageUrl() ? (
          <img
            src={getImageUrl()}
            alt="Exhibition Hall Map"
            style={{ width: '100%', borderRadius: '10px' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/assets/map-not-found.jpg"; // fallback image from local assets
            }}
          />
        ) : (
          <p>No map data available.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ExhibitionMap;
