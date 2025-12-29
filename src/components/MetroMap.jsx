import React, { useEffect, useState } from "react";
import "./MetroMap.css";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

const MetroMap = () => {
  const [metroData, setMetroData] = useState([]);

  useEffect(() => {
    const fetchMetroMaps = async () => {
      try {
        const res = await fetch("https://inoptics.in/api/get_visitor_metro_map.php");
        const data = await res.json();
        setMetroData(data || []);
      } catch (err) {
        console.error("Failed to fetch Visitor Metro Map", err);
      }
    };

    fetchMetroMaps();
  }, []);

  return (
    <div className="main-content-wrapper">
      <div className="metro-container">
        <Breadcrumbs />
        
        <p
          className="metro-description"
          dangerouslySetInnerHTML={{
            __html:
              metroData[0]?.description ||
              "Loading Metro Map description...",
          }}
        />

      
        {metroData[0]?.image && (
          <img
            src={metroData[0].image}
            alt="Metro Map"
            style={{ width: "100%", borderRadius: "10px", marginTop: "10px" }}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MetroMap;
