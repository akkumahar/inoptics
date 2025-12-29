import React, { useEffect, useState } from "react";
import "./PressRelease.css";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

const PressRelease = () => {
  const [pressReleaseDetails, setPressReleaseDetails] = useState([]);

  // ✅ Fetch Press Release data on mount
  useEffect(() => {
    fetchPressReleaseDetails();
  }, []);

  const fetchPressReleaseDetails = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_pressrelease_details.php");
      const data = await res.json();
      setPressReleaseDetails(data || []);
    } catch (err) {
      console.error("Failed to fetch Press Release Details", err);
    }
  };

  return (
    <div className="main-content-wrapper">
      <div className="press-release-container">
        <Breadcrumbs />

        {/* ✅ Main heading stays fixed */}
        {/* <h1 className="press-heading">Press Release</h1> */}

        <div className="press-content-container">
          {/* ✅ Loop through API data */}
          {pressReleaseDetails.length > 0 ? (
            pressReleaseDetails.map((item, index) => (
              <div key={item.id || index} className="press-section">

                {/* Description only */}
                <p
                  className="press-para"
                  dangerouslySetInnerHTML={{
                    __html: item.description || "No description available.",
                  }}
                />
              </div>
            ))
          ) : (
            <p className="press-para">No Press Release details found.</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PressRelease;
