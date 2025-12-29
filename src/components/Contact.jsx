import React, { useRef, useState, useEffect } from 'react';
import Breadcrumbs from './Breadcrumbs';
import Footer from './Footer';
// import ReCAPTCHA from 'react-google-recaptcha';
import './Contact.css';
import axios from 'axios';

const SITE_KEY = '6LcCLpkrAAAAAPDSzN2dcfQ0Be_AbQUFVmI7W8Hu';

const Contact = () => {
  // const recaptchaRef = useRef();
  const contactEmailRef = useRef();

  const [formData, setFormData] = useState({
    message: '',
    name: '',
    company: '',
    email: '',
    mobile: '',
    consent: false,
  });

  // const [recaptchaToken, setRecaptchaToken] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  useEffect(() => {
  if (successMessage) {
    const timer = setTimeout(() => {
      setSuccessMessage('');
    }, 3000); // 3 seconds

    // Clear the timer when the component unmounts or message changes early
    return () => clearTimeout(timer);
  }
}, [successMessage]);



  const handleSubmit = async (e) => {
    e.preventDefault();

      // Validate required fields
  if (
    !formData.name.trim() ||
    !formData.email.trim() ||
    !formData.mobile.trim() ||
    !formData.company.trim() ||
    !formData.message.trim() ||
    !formData.consent
  ) {
    setErrorMessage('❌ Please fill in all fields and accept the consent.');
    setSuccessMessage('');
    return;
  }

    try {
      // Step 1: get token from reCAPTCHA v3
      const token = await window.grecaptcha.execute(SITE_KEY, { action: 'submit' });

      // Step 2: prepare and send form
      const toEmail = contactEmailRef.current?.textContent?.trim() || "support@inoptics.in";

      const submitData = new FormData();
      submitData.append('from_email', formData.email);
      submitData.append('from_name', formData.name);
      submitData.append('message', formData.message);
      submitData.append('mobile', formData.mobile);
      submitData.append('company', formData.company);
      submitData.append('recaptcha_token', token);
      submitData.append('to_email', toEmail);

      const res = await axios.post('https://inoptics.in/api/submit_contact_form.php', submitData);

      setSuccessMessage(
        '✅ Submission Successful\nThank you for your application. Our team will review it and contact you shortly to proceed further.\nWe will get back to you within 24 hours.'
      );
      setErrorMessage('');
      setFormData({
        message: '',
        name: '',
        company: '',
        email: '',
        mobile: '',
        consent: false
      });
    } catch (err) {
      console.error(err);
      setErrorMessage('❌ Submission failed. Please try again later.');
      setSuccessMessage('');
    }
  };


  return (
    <div className="main-content-wrapper">
      <div className="contact-page-container">
        <Breadcrumbs />

        <form className="contact-form-row" onSubmit={handleSubmit}>
          <div className="contact-left-container">
            <h1>
              <div className='contact-heading'>Contact</div>
              <div className='contact-heading-two'>Us</div>
            </h1>

            <label className='contact-label'>Message</label>
            <textarea name="message" rows="4" className="contact-input-box" placeholder="Type your message..." value={formData.message} onChange={handleChange} required />

            <label className='contact-label'>Name</label>
            <input type="text" name="name" className="contact-input-box" placeholder="Your Name" value={formData.name} onChange={handleChange} required />

            <label className='contact-label'>Company Name</label>
            <input type="text" name="company" className="contact-input-box" placeholder="Company Name" value={formData.company} onChange={handleChange} />

            <div className="contact-row-inputs">
              <div className="contact-column">
                <label className='contact-label'>Email</label>
                <input type="email" name="email" className="contact-input-box" placeholder="Email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="contact-column">
                <label className='contact-label'>Mobile</label>
                <input type="tel" name="mobile" className="contact-input-box" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} />
              </div>
            </div>

            <div className="contact-checkbox-section">
              <input type="checkbox" id="communicationConsent" name="consent" checked={formData.consent} onChange={handleChange} />
              <label htmlFor="communicationConsent" className='contact-label'>
                I would like to receive communication from <strong>The InOptics®</strong> via SMS, Email, OBD, Google RCS and WhatsApp for my services, offers and updates.
              </label>
            </div>

            <div className="contact-form-footer">
    
              <button type="submit" className="contact-send-button">Send</button>
            </div>

            {successMessage && (
              <div className="success-message" style={{ marginTop: '15px', background: '#e6f4ea', padding: '10px', borderLeft: '4px solid #34a853', borderRadius: '4px', whiteSpace: 'pre-line' }}>
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="error-message" style={{ marginTop: '15px', background: '#fdecea', padding: '10px', borderLeft: '4px solid #d93025', borderRadius: '4px' }}>
                {errorMessage}
              </div>
            )}
          </div>

          <div className="contact-right-container">
            <iframe
              title="The Indian Optician Optical Magazine Location"
              width="80%"
              height="500"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=99,+Block+A,+Defence+Colony,+New+Delhi,+Delhi+110024&output=embed"
            />

            <div className="contact-info">
              <p><i className="fas fa-map-marker-alt"></i> A-99, Defence Colony, New Delhi – 110024</p>
              <p><i className="fas fa-phone-alt"></i> Landline: 011-41815099</p>
              <p><i className="fas fa-mobile-alt"></i> Mobile: 9873989649</p>
              <p><i className="fas fa-envelope"></i> <span ref={contactEmailRef}>support@inoptics.in</span></p>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
