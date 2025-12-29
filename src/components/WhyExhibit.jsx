import React, { useEffect, useState } from 'react';
import './WhyExhibit.css';
import Footer from "./Footer";
import Breadcrumbs from './Breadcrumbs';
import { useNavigate } from 'react-router-dom';

const WhyExhibit = () => {
  const [showListThree, setShowListThree] = useState(true);
  const [whyExhibitData, setWhyExhibitData] = useState([]);
  const [whyExhibitImageData, setWhyExhibitImageData] = useState([]);
  const [whyExhibitPdfData, setWhyExhibitPdfData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);

  const navigate = useNavigate();

  // Fetch text content
  const fetchWhyExhibitData = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_why_exhibit.php");
      const data = await res.json();
      setWhyExhibitData(data || []);
    } catch (err) {
      console.error("Failed to fetch Why Exhibit data", err);
    }
  };

  // Fetch images
  const fetchWhyExhibitImageData = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_why_exhibit_image.php");
      const data = await res.json();
      setWhyExhibitImageData(data || []);
    } catch (err) {
      console.error("Failed to fetch Why Exhibit image data", err);
    }
  };

  // Fetch PDFs
  const fetchWhyExhibitPdfs = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_whyexhibit_pdf.php");
      const data = await res.json();
      setWhyExhibitPdfData(data || []);
    } catch (err) {
      console.error("Failed to fetch PDFs", err);
    }
  };

  useEffect(() => {
    fetchWhyExhibitData();
    fetchWhyExhibitImageData();
    fetchWhyExhibitPdfs();
  }, []);

  // Image slideshow
useEffect(() => {
  if (whyExhibitImageData.length === 0) return;

  const interval = setInterval(() => {
    setPrevIndex(currentIndex); // mark current as exiting
    setCurrentIndex((prev) => (prev + 1) % whyExhibitImageData.length);
  }, 5000);

  return () => clearInterval(interval);
}, [whyExhibitImageData, currentIndex]);

  const handleClick = () => {
    navigate('/become-exhibitor');
  };

  // Open PDF in new tab
  const handleDownloadPdf = () => {
    // Find the PDF by title (replace with exact title in your DB)
    const brochurePdf = whyExhibitPdfData.find(
      (item) => item.title === "In-Optics Brochure"
    );

    if (brochurePdf && brochurePdf.pdf_url) {
      window.open(brochurePdf.pdf_url, "_blank", "noopener,noreferrer");
    } else {
      alert("PDF not available.");
    }
  };

  return (
    <div className="main-content-wrapper">
      <div className="why-exhibit">
        <Breadcrumbs />

        <div className="whyexhibit-top-section">
          {/* LEFT SECTION */}
          <div className="whyexhibit-left">
            <h1
              className="whyexe-heading"
              dangerouslySetInnerHTML={{
                __html: whyExhibitData.length > 0
                  ? whyExhibitData[0].title || "Why Exhibit ?"
                  : "Why Exhibit ?",
              }}
            />
            <p
              className="exhibit-paragraph"
              dangerouslySetInnerHTML={{
                __html: whyExhibitData.length > 0
                  ? whyExhibitData[0].text || "Loading content..."
                  : "Loading...",
              }}
            />
          </div>
 {/* RIGHT SECTION */}
          <div className="whyexhibit-right">
            {whyExhibitImageData.length > 0 ? (
              <div className="slideshow">
                {whyExhibitImageData.map((img, index) => (
                  <img
                    key={index}
                    src={img.image_url}
                    alt={`Why Exhibit ${index}`}
                    className={`slide
                      ${index === currentIndex ? "active" : ""}
                      ${index === prevIndex ? "exit" : ""}`}
                  />
                ))}
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>

        {/* --- NEW SECTION UNDER TOP SECTION --- */}
 <div className="exhibitor-action-section">
  {/* Heading */}
  <h2 className="whyexe-sub-heading">Why Become an Exhibitor?</h2>

  {/* Sub Text */}
  <p className="exhibitor-subtext">
   Gain unmatched visibility across your target audience by connecting directly with influential industry leaders and decision-makers. Showcase your brand, products, and services on a global stage while unlocking powerful business opportunities and long-term partnerships. Position your company as a trusted leader in the industry and create lasting impressions that drive growth and success.
  </p>

  {/* Row 1 */}
  <div className="exhibitor-row">
    <p className="exhibitor-text">
      ➤&nbsp;&nbsp;Connect with industry leaders and showcase your brand
    </p>
    <button className="dynamic-button" onClick={handleClick}>
      Become an Exhibitor
    </button>
  </div>

  {/* Row 2 */}
  <div className="exhibitor-row">
    <p className="exhibitor-text">
      ➤&nbsp;&nbsp;Looking for complete event insights?
    </p>
    <button className="dynamic-button" onClick={handleDownloadPdf}>
      Download Brochure
    </button>
  </div>
</div>



{showListThree && (

 <div className="whyexhibit-card-wrapper">
    <h3 className="whyexe-heading1">Benefits </h3>

  <div className="whyexhibit-card-row">
    {/* 🏆 Industry Exposure */}
    <div className="whyexhibit-card slide-in-left card-1">
      <h3 className="whyexe-heading-two"> Industry Exposure</h3>
      <ul className="fade-in-list">
        <li>Gain visibility in one of the most targeted optical trade environments.</li>
        <li>Reach over 22,000+ verified trade visitors – both domestic and international.</li>
        <li>Showcase directly to key decision-makers including buyers, suppliers, and investors.</li>
        <li>Increase brand recognition within your niche through dedicated exhibiting space.</li>
      </ul>
    </div>

    {/* 🌍 Wider Market Reach */}
    <div className="whyexhibit-card slide-in-right delay card-2">
      <h3 className="whyexe-heading-two"> Wider Market Reach</h3>
      <ul className="fade-in-list">
        <li>Connect with clients from multiple regions and countries in one place.</li>
        <li>Explore opportunities in untapped regional and global markets.</li>
        <li>Engage with new segments including retail chains, startups, and B2B distributors.</li>
        <li>Position your brand as a national and international player.</li>
      </ul>
    </div>

    {/* 🔍 Brand & Product Visibility */}
    <div className="whyexhibit-card slide-in-right card-3">
      <h3 className="whyexe-heading-two">Brand & Product Visibility</h3>
      <ul className="fade-in-list">
        <li>Promote your latest offerings through live demos and product showcases.</li>
        <li>Utilize high-traffic footer ad slots for round-the-clock brand visibility.</li>
        <li>Let your brand stand out in a dedicated, professional setting.</li>
        <li>Highlight your USPs directly to industry buyers and media representatives.</li>
      </ul>
    </div>

    {/* 👥 Networking & Business Growth */}
    <div className="whyexhibit-card slide-in-left card-4">
      <h3 className="whyexe-heading-two">Networking & Business Growth</h3>
      <ul className="fade-in-list">
        <li>Meet new clients and build strategic partnerships.</li>
        <li>Reconnect with existing distributors and industry peers.</li>
        <li>Generate high-quality business leads across three packed days.</li>
        <li>Discover potential investment and expansion opportunities.</li>
      </ul>
    </div>

    {/* 🚀 Launchpad for New Products */}
    <div className="whyexhibit-card slide-in-right delay card-5">
      <h3 className="whyexe-heading-two">Launchpad for New Products</h3>
      <ul className="fade-in-list">
        <li>Launch new products or services in front of a live, responsive audience.</li>
        <li>Get instant feedback and interest from retail buyers and business owners.</li>
        <li>Use the event to test-market innovations and trends.</li>
        <li>Create pre-launch buzz and media attention around your brand.</li>
      </ul>
    </div>

    {/* 💼 Professional Brand Positioning */}
    <div className="whyexhibit-card slide-in-left card-6">
      <h3 className="whyexe-heading-two">Professional Brand Positioning</h3>
      <ul className="fade-in-list">
        <li>Establish your company as a trusted name in the optics industry.</li>
        <li>Build your brand reputation in a reputable and well-attended exhibition.</li>
        <li>Earn trust through direct face-to-face engagement with real buyers.</li>
        <li>Strengthen credibility by participating alongside top industry brands.</li>
      </ul>
    </div>
  </div>
  </div>
)}


      </div>
      <Footer />
    </div>
  );
};

export default WhyExhibit;
