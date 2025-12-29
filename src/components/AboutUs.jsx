import React, { useEffect, useState } from "react";
import Breadcrumbs from './Breadcrumbs';
import Footer from './Footer';
import './AboutUs.css';


const AboutUs = () => {
  const [aboutUsData, setAboutUsData] = useState([]);
    const [ourVisionData, setOurVisionData] = useState([]);

  useEffect(() => {
    fetchAboutUsData();
    fetchOurVisionData();
  }, []);

  const fetchAboutUsData = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_about_us.php");
      const data = await res.json();
      setAboutUsData(data || []);
    } catch (err) {
      console.error("Failed to fetch About Us data", err);
    }
  };

  const fetchOurVisionData = async () => {
  try {
    const res = await fetch("https://inoptics.in/api/get_our_vision.php");
    const data = await res.json();
    setOurVisionData(data || []);
  } catch (err) {
    console.error("Failed to fetch Our Vision data", err);
  }
};


  return (
     <div className="main-content-wrapper">
     <div className="about-us-container">
     <div className="about-us-breadcrumb"><Breadcrumbs /></div>

      {/* About Container */}
     <div className="about-container">
    <h1 className="about-heading">
            <span
              className="about-title"
              dangerouslySetInnerHTML={{
                __html: aboutUsData[0]?.title || "About Us",
              }}
            />
          </h1>

           <p
            className="about-paragraph"
            dangerouslySetInnerHTML={{
              __html:
                aboutUsData[0]?.description ||
                "Loading...",
            }}
          />
      </div>

      {/* Vision Container */}
      <div className="vision-container-wrapper">
      <div className="vision-container">
        <h2
              className="vision-heading"
              dangerouslySetInnerHTML={{
                __html: ourVisionData[0]?.title || "Our Vision",
              }}
            />

 <p
              className="vision-paragraph"
              dangerouslySetInnerHTML={{
                __html:
                  ourVisionData[0]?.description ||
                  "Loading...",
              }}
            />

      </div></div>
     
    </div>
    <Footer />
    </div>
  );
};

export default AboutUs;
