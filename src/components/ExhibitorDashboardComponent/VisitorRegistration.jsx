import React from "react";
import "./VisitorRegistration.css";

const VisitorRegistration = ({ company, email }) => {

  // 🔹 Clean company name
  const cleanCompany = company
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  // 🔹 Clean email (no encoding)
  const cleanEmail = email
    ?.toLowerCase()
    .trim();

  console.log(
    "exhibitor company name",
    cleanCompany,
    "exhibitor company email",
    cleanEmail
  );

  const url = `https://rsdebadge.in/inoptic/exhibitor/${encodeURIComponent(
    cleanCompany
  )}/${cleanEmail}/visitor-badge`;

  return (
    <div className="visitor-badge-wrapper">

      {/* Info Banner */}
      {/* <div className="visitor-badge-banner">
        <h3>Visitor Badge Registration</h3>

        <p>
          For the convenience of your customers, please complete the form below
          and register them in advance to avoid long queues at the venue.
          After submitting the form, the visitor badge will be sent to them via
          <strong> Email </strong> and <strong> WhatsApp</strong>.
        </p>
      </div> */}

      {/* Iframe Container */}
      <div className="visitor-badge-frame">
        <div className="visitor-badge-banner">
        <h3>Visitor Badge Registration</h3>
        <hr />

        <p>
          For the convenience of your customers, please complete the form below
          and register them in advance to avoid long queues at the venue.
          After submitting the form, the visitor badge will be sent to them via
          <strong> Email </strong> and <strong> WhatsApp</strong>.
        </p>
      </div>
        <iframe
          src={url}
          title="Visitor Badge"
          className="visitor-badge-iframe"
        />
      </div>

    </div>
  );
};

export default VisitorRegistration;


