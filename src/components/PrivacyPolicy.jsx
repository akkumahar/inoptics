import React, { useEffect, useState } from "react";
import "./PrivacyPolicy.css";
import Breadcrumbs from "./Breadcrumbs";
import Footer from "./Footer";

const PrivacyPolicy = ({ goBack }) => {
  const [privacyDetails, setPrivacyDetails] = useState([]);

  // Fetch Privacy Policy data from backend
  useEffect(() => {
    fetchPrivacyDetails();
  }, []);

  const fetchPrivacyDetails = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_privacy_details.php");
      const data = await res.json();
      setPrivacyDetails(data || []);
    } catch (err) {
      console.error("Failed to fetch Privacy Policy Details", err);
    }
  };

  return (
    <div className="main-content-wrapper">
      <div className="privacy-policy-container">
        {/* Breadcrumbs */}
        <Breadcrumbs />

        <div className="privacy-main-container">
          <div className="privacy-content-container">
            {/* Loop through fetched data */}
            {privacyDetails.length > 0 ? (
              privacyDetails.map((item, index) => (
                <div key={item.id || index} className="privacy-section">
                  {/* Only Description */}
                  <p
                    className="privacy-text"
                    dangerouslySetInnerHTML={{
                      __html: item.description || "No description available.",
                    }}
                  />
                </div>
              ))
            ) : (
              <p className="privacy-text">No Privacy Policy details found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
