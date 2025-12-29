import React, { useEffect, useState } from "react";
import "./Terms.css";
import Breadcrumbs from "./Breadcrumbs";
import Footer from "./Footer";

const Terms = ({ goBack }) => {
  const [termsDetails, setTermsDetails] = useState([]);

  // Fetch Terms & Conditions data from backend
  useEffect(() => {
    fetchTermsDetails();
  }, []);

  const fetchTermsDetails = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_terms_details.php");
      const data = await res.json();
      setTermsDetails(data || []);
    } catch (err) {
      console.error("Failed to fetch Terms & Conditions Details", err);
    }
  };

  return (
    <div className="main-content-wrapper">
      <div className="terms-condition-container">
        {/* Breadcrumbs */}
        <Breadcrumbs />

        <div className="terms-main-container">
          <div className="terms-content-container">
            {/* Loop through fetched Terms & Conditions */}
            {termsDetails.length > 0 ? (
              termsDetails.map((item, index) => (
                <div key={item.id || index} className="terms-section">
                  {/* Description only */}
                  <p
                    className="terms-text"
                    dangerouslySetInnerHTML={{
                      __html:
                        item.description || "No terms & conditions available.",
                    }}
                  />
                </div>
              ))
            ) : (
              <p className="terms-text">
                No Terms & Conditions details found.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Terms;
