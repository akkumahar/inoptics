import React, { useEffect, useState } from "react";
import Breadcrumbs from "./Breadcrumbs";
import Footer from "./Footer";
import "./Benefactors.css";

const Benefactors = () => {
  const [sponsorImages, setSponsorImages] = useState([]);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const res = await fetch("https://inoptics.in/api/get_sponsor_images_list.php");
        const data = await res.json();
        setSponsorImages(data || []);
      } catch (error) {
        console.error("Error fetching sponsor images:", error);
      }
    };

    fetchSponsors();
  }, []);

  const getSponsor = (type) =>
    sponsorImages.find(
      (img) => img.sponsor_type?.toLowerCase() === type.toLowerCase()
    );

  return (
    <div className="main-content-wrapper">
      <div className="ourbenefactors-container">
        <div className="ourbenefactors-breadcrumb">
          <Breadcrumbs />
        </div>

        <div className="benefactors-container">
          <section className="sponsors">

            {/* Platinum */}
            {getSponsor("Platinum") && (
              <div className="platinum-block">
                <h3 className="platinum-title">
                  {getSponsor("Platinum").name}
                </h3>
                <img
                  src={`https://inoptics.in/api/${getSponsor("Platinum").image_path}`}
                  alt={getSponsor("Platinum").name}
                  className="platinum"
                />
              </div>
            )}

            {/* Gold */}
            {getSponsor("Gold") && (
              <div className="gold-block">
                <h3 className="gold-title">
                  {getSponsor("Gold").name}
                </h3>
                <img
                  src={`https://inoptics.in/api/${getSponsor("Gold").image_path}`}
                  alt={getSponsor("Gold").name}
                  className="gold"
                />
              </div>
            )}

            {/* Silver */}
            {getSponsor("Silver") && (              
                <div className="silver-block">
                  <h3 className="silver-title">
                    {getSponsor("Silver").name}
                  </h3>
                  <img
                    src={`https://inoptics.in/api/${getSponsor("Silver").image_path}`}
                    alt={getSponsor("Silver").name}
                    className="silver"
                  />
                </div>           
            )}

            {/* Media + Foreign Partners */}
            <div className="sponsor-row">
              {getSponsor("Media") && (
                <div className="media-block">
                  <h3 className="media-title">
                    {getSponsor("Media").name}
                  </h3>
                  <img
                    src={`https://inoptics.in/api/${getSponsor("Media").image_path}`}
                    alt={getSponsor("Media").name}
                    className="media"
                  />
                </div>
              )}

              {getSponsor("Foreign") && (
                <div className="foreign-block">
                  <h3 className="foreign-title">
                    {getSponsor("Foreign").name}
                  </h3>
                  <img
                    src={`https://inoptics.in/api/${getSponsor("Foreign").image_path}`}
                    alt={getSponsor("Foreign").name}
                    className="foreign"
                  />
                </div>
              )}
            </div>

            {/* Organiser */}
           {/* Organisers + Member Of */}
<div className="sponsor-row">
  {getSponsor("Organisers") && (
    <div className="organiser-block">
      <h3 className="organiser-title">
        {getSponsor("Organisers").name}
      </h3>
      <img
        src={`https://inoptics.in/api/${getSponsor("Organisers").image_path}`}
        alt={getSponsor("Organisers").name}
        className="organiser"
      />
    </div>
  )}

  {getSponsor("Memberof") && (
    <div className="memberof-block">
      <h3 className="memberof-title">
        {getSponsor("Memberof").name}
      </h3>
      <img
        src={`https://inoptics.in/api/${getSponsor("Memberof").image_path}`}
        alt={getSponsor("Memberof").name}
        className="memberof"
      />
    </div>
  )}
</div>
            
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Benefactors;
