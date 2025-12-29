import React, { useEffect, useState } from "react";
import "./RulesPolicy.css";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

const RulesPolicy = () => {
  const [rulesDetails, setRulesDetails] = useState([]);

  // Fetch Rules & Policy data
  useEffect(() => {
    fetchRulesDetails();
  }, []);

  const fetchRulesDetails = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_rules_details.php");
      const data = await res.json();
      setRulesDetails(data || []);
    } catch (err) {
      console.error("Failed to fetch Rules & Policy Details", err);
    }
  };

  return (
    <div className="main-content-wrapper">
      <div className="Rules-container">
        <Breadcrumbs />

        {/* ✅ Main heading stays fixed */}
        {/* <h1 className="rules-heading">Rules & Policy</h1> */}

        <div className="rules-content-container">
          {/* ✅ Loop through API data */}
          {rulesDetails.length > 0 ? (
            rulesDetails.map((item, index) => (
              <div key={item.id || index} className="rules-section">
                {/* Removed Title */}

                {/* Description */}
                <p
                  className="rule-text"
                  dangerouslySetInnerHTML={{
                    __html: item.description || "No description available.",
                  }}
                />
              </div>
            ))
          ) : (
            <p className="rule-text">No Rules & Policy details found.</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RulesPolicy;
