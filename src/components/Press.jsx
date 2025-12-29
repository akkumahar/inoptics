import React from 'react';
import './Press.css';
import Footer from './Footer';
import Breadcrumbs from './Breadcrumbs';

const Press = () => (
  <div className="main-content-wrapper">
    <div className="press-container">
      <Breadcrumbs />
      <h1 className="press-header">Press</h1>
      <p className="press-text">
        Welcome members of the media! Here, you’ll find press releases, event highlights, 
        media registration details, and contact information for press inquiries.
      </p>
    </div>
    <Footer />
  </div>
);

export default Press;
