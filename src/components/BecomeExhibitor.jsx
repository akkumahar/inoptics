import React, { useState, useEffect } from 'react';
import './BecomeExhibitor.css';
import Footer from "./Footer";
// import ReCAPTCHA from "react-google-recaptcha";
import axios from 'axios';
import Breadcrumbs from './Breadcrumbs';

const productOptions = [
  "Artificial Eyes",
  "Contact & Cosmetic lenses",
  "Contact lens solutions & Accessories",
  "Eye Testing Equipments",
  "Instruments",
  "Machines for Manufacturing Lenses",
  "Reading Spectacles",
  "Retail Management Software",
  "Raw Material for Manufacturing",
  "Showroom Setup & Display Products",
  "Spare Parts & Tools",
  "Spectacle Frames & Cases",
  "Sunglasses",
  "Trade Journal",
 
];

const apiUrl = 'https://api.countrystatecity.in/v1';
const apiKey = 'MUFmM25DMFNOcGlWMVMydXdxOWxEd3ZsRVFQdGpnY1F3ZzNQcDZYeQ==';


const SITE_KEY = "6LcCLpkrAAAAAPDSzN2dcfQ0Be_AbQUFVmI7W8Hu";

const BecomeExhibitor = () => {

   const [successMessage, setSuccessMessage] = useState("");

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [manualProduct, setManualProduct] = useState('');
    const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCountryName, setSelectedCountryName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedStateName, setSelectedStateName] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [poweringFutureData, setPoweringFutureData] = useState([]);
const [whyExhibitData, setWhyExhibitData] = useState([]);

  // const [recaptchaToken, setRecaptchaToken] = useState('');
  
useEffect(() => {
  fetchPoweringFutureBecomeAnExhibitor();
}, []);

const fetchPoweringFutureBecomeAnExhibitor = async () => {
  try {
    const res = await fetch("https://inoptics.in/api/get_powering_future_become_an_exhibitor.php");
    const data = await res.json();
    setPoweringFutureData(data || []);
  } catch (err) {
    console.error("Failed to fetch Powering Future data", err);
  }
};

useEffect(() => {
  fetchWhyExhibitBecomeAnExhibitor();
}, []);

const fetchWhyExhibitBecomeAnExhibitor = async () => {
  try {
    const res = await fetch("https://inoptics.in/api/get_why_exhibit_become_an_exhibitor.php");
    const data = await res.json();
    setWhyExhibitData(data || []);
  } catch (err) {
    console.error("Failed to fetch Why Exhibit data", err);
  }
};


  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${SITE_KEY}`;
    script.async = true;
    document.body.appendChild(script);
  }, []);


  useEffect(() => {
    axios.get(`${apiUrl}/countries`, {
      headers: { 'X-CSCAPI-KEY': apiKey }
    })
    .then(response => setCountries(response.data))
    .catch(error => console.error("Error fetching countries:", error));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const country = countries.find(c => c.iso2 === selectedCountry);
      setSelectedCountryName(country?.name || '');

      axios.get(`${apiUrl}/countries/${selectedCountry}/states`, {
        headers: { 'X-CSCAPI-KEY': apiKey }
      })
      .then(response => setStates(response.data))
      .catch(error => console.error("Error fetching states:", error));
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      const state = states.find(s => s.iso2 === selectedState);
      setSelectedStateName(state?.name || '');

      axios.get(`${apiUrl}/countries/${selectedCountry}/states/${selectedState}/cities`, {
        headers: { 'X-CSCAPI-KEY': apiKey }
      })
      .then(response => setCities(response.data))
      .catch(error => console.error("Error fetching cities:", error));
    }
  }, [selectedState]);

  const handleProductChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedProducts((prev) => [...prev, value]);
    } else {
      setSelectedProducts((prev) => prev.filter((item) => item !== value));
    }
  };

  const showManualInput = selectedProducts.length === 1 && selectedProducts.includes('Other');

    
  // const handleCaptchaChange = (token) => {
  //   setRecaptchaToken(token);
  // };
   const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    // Validate mandatory fields
    const mandatoryFields = ['companyName', 'personName', 'address', 'pincode', 'mobile', 'email', 'gst'];
    for (let field of mandatoryFields) {
      if (!form[field].value.trim()) {
        alert("Please fill all mandatory fields.");
        return;
      }
    }

    try {
      const token = await window.grecaptcha.execute(SITE_KEY, { action: 'submit' });

      const formData = new FormData(form);
      formData.append('recaptcha_token', token);
      formData.append('selectedProducts', JSON.stringify(selectedProducts));
      formData.append('manualProduct', manualProduct);
      formData.append('selectedCountry', selectedCountry);
      formData.append('selectedState', selectedState);
      formData.append('selectedCity', selectedCity);

      await axios.post('https://inoptics.in/api/submit_become_an_exhibitor.php', formData);

      setSuccessMessage("✅ Submission Successful\nThank you for your application. Our team will review it and contact you shortly to proceed further.");

      setTimeout(() => setSuccessMessage(""), 3000);
      form.reset();
      setSelectedProducts([]);
      setManualProduct('');
      setSelectedCountry('');
      setSelectedState('');
      setSelectedCity('');
      setStates([]);
      setCities([]);
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="main-content-wrapper">
      <div className="become-exhibitor-container">
         <Breadcrumbs />
        <h1 className='become-exhibitor-heading'>Become an Exhibitor</h1>
       <div className="info-section-exhibitor">
  <div className="info-left-exhibitor">
  <h2
    className="become-exhibitor-heading-two"
    dangerouslySetInnerHTML={{
      __html:
        poweringFutureData.length > 0
          ? poweringFutureData[0].title || "POWERING THE FUTURE OF INOPTICS"
          : "Loading title...",
    }}
  />
  <p
    className="become-exhibitor-paragraph"
    dangerouslySetInnerHTML={{
      __html:
        poweringFutureData.length > 0
          ? poweringFutureData[0].description || "Loading description..."
          : "Loading description...",
    }}
  />
</div>
 {/* RIGHT SECTION */}
<div className="info-right-exhibitor">
  <h2
    className="become-exhibitor-heading-two-right"
    dangerouslySetInnerHTML={{
      __html:
        whyExhibitData.length > 0
          ? whyExhibitData[0].title || "Why Exhibit at In-Optics"
          : "Loading title...",
    }}
  />
  <p
    className="become-exhibitor-paragraph-right"
    dangerouslySetInnerHTML={{
      __html:
        whyExhibitData.length > 0
          ? whyExhibitData[0].description || "Loading content..."
          : "Loading content...",
    }}
  />
</div>
</div>



        <div className="form-wrapper">

        <div className='form-heading'>
          Registration Form 
        </div>

          <form className="form-container" onSubmit={handleSubmit}>
            {/* Left Side Form */}
            <div className="form-column">
              <div className="form-row">
                <label>Company<br />Name:</label>
                <input type="text" name="companyName" />
              </div>
              <div className="form-row">
                <label>Person Name:</label>
                <input type="text" name="personName" />
              </div>
              <div className="form-row">
                <label>Address:</label>
                <input type="text" name="address" />
              </div>
              <div className="form-row">
                <label>Country:</label>
                <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.iso2} value={country.iso2}>{country.name}</option>
                  ))}
                </select>

                <label>State:</label>
                <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.iso2} value={state.iso2}>{state.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>City:</label>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.name}>{city.name}</option>
                  ))}
                </select>

                <label>Pin-Code:</label>
                <input type="text" name="pincode" />
              </div>
              <div className="form-row">
                <label>Mobile:</label>
                <input type="text" name="mobile" />
                <label>Landline:</label>
                <input type="text" name="landline" />
              </div>
              <div className="form-row">
                <label>Email:</label>
                <input type="email" name="email" />
              </div>
              <div className="form-row">
                <label>GST:</label>
                <input type="text" name="gst" />
              </div>

               <div className="consent-checkbox">
    <label>
      <input type="checkbox" name="consentUpdates" required />
      I agree to receive all updates related to In-Optics on my provided email<br /> address from:
      inforsd@inoptic.com, infoinoptics@gmail.com
    </label>
  </div>
            </div>

          {/* Right Side Form */}
<div className="form-column right-empty">
  <div className="form-row-right">
    <label>Booth Space Requires:</label>
    <select name="boothSpace">
      <option value="9sq m">9 sq m</option>
      <option value="12sq m">12 sq m</option>
      <option value="15sq m">15 sq m</option>
      <option value="20sq m">20 sq m</option>
    </select>
    <span style={{ marginLeft: '10px' }}>Approx</span>
  </div>

  <div className="form-row-right">
  <label>Choose Space:</label>
  <div className="radio-group-inline">
    <label>
      <input type="radio" name="spaceType" value="bare" />
      Bare Space
    </label>
    <label>
      <input type="radio" name="spaceType" value="stall" />
      Stall Space
    </label>
  </div>
</div>

  <div className="form-row-right products-label-right">
    <label>Products:</label>
  </div>

  {/* 3 Column x 5 Row Checkbox Grid */}
  <div className="form-row-right product-options-right">
    <div className="product-grid-right">
      {[...productOptions, 'Other'].map((product, index) => (
        <label key={index}>
          <input
            type="checkbox"
            value={product}
            checked={selectedProducts.includes(product)}
            onChange={handleProductChange}
          />
          <span>{product}</span>
        </label>
      ))}
    </div>
  </div>

  {/* Manual Input */}
  {showManualInput && (
    <div className="form-row-right">
      <label>Please Specify<br />Product Manually:</label>
      <input
        type="text"
        value={manualProduct}
        onChange={(e) => setManualProduct(e.target.value)}
      />
    </div>
  )}

  <div className="form-row-right">
    <label>Brands:</label>
    <input type="text" name="brands" />
  </div>
  <div className="form-row-right">
    <label>Home<br /> Brands:</label>
    <input type="text" name="homeBrands" />
  </div>
   <div className="form-bottom-row">
 

    <div className="submit-container">
                {/* <ReCAPTCHA
                  sitekey="6LeeGokrAAAAACooBCgnH2_xj350zYgS8HFZKWMD"
                  onChange={handleCaptchaChange}
                /> */}
                <button type="submit">Register</button>
              </div>
</div>
</div>



     </form>     
  {/* ✅ Show success message */}
        {successMessage && (
          <div className="submission-success-message" style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "15px",
            borderRadius: "6px",
            marginBottom: "20px",
            whiteSpace: "pre-line",
            border: "1px solid #c3e6cb"
          }}>
            {successMessage}
          </div>
        )}

</div>
      </div>
       <Footer />
    </div>
  );
};

export default BecomeExhibitor;
