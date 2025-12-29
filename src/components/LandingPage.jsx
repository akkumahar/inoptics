import React, { useEffect, useState } from 'react';
import './LandingPage.css';
import backgroundVideo from '../assets/Background_Video3.webm';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [sponsorImages, setSponsorImages] = useState([]);

 
  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const res = await fetch("https://inoptics.in/api/get_sponsor_images_list.php");
        const data = await res.json();
        setSponsorImages(data);
      } catch (error) {
        console.error("Error fetching sponsor images:", error);
      }
    };
    fetchSponsors();
  }, []);


  const getSponsorImage = (type) => {
    const sponsor = sponsorImages.find(
      (img) => img.sponsor_type?.toLowerCase() === type.toLowerCase()
    );
    return sponsor ? `https://inoptics.in/api/${sponsor.image_path}` : null;
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="landing-page" style={{ overflow: 'hidden', height: '100vh' }}>
      <video autoPlay loop muted playsInline className="background-video">
       <source src={backgroundVideo} type="video/webm" />

        Your browser does not support the video tag.
      </video>

      <div className="bg-overlay"></div>

  
      <section id="section1" className="elements" style={{ position: 'absolute' }}>
        {getSponsorImage("Main-logo") && (
          <img
            src={getSponsorImage("Main-logo")}
            alt="InOptics Logo"
            className="landing-logo threedflip"
          />
        )}
        <p className="landing-tagline slideinleft">India's #1 Exhibition on Optics</p>
        <p className="landing-subtagline slideinright">
          A Grand Showcase of Visionary Innovation, Technology, and Excellence in the World of Optics
        </p>
        <p className="landing-dates fadeInText">
          <span className="thedate">28<sup>th</sup> - 30<sup>th</sup> MARCH, 2026</span><br />
          <span className="thevenue">HALL #1 – Yashobhoomi (India International Convention & Expo Centre)</span><br />
          <span className="thevenue">Sector 25, Dwarka, New Delhi</span>
        </p>
      </section>
    </div>
  );
};

export default LandingPage;
