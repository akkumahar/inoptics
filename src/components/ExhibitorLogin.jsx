import React, { useState, useEffect } from "react";
import Footer from "./Footer";
import "./ExhibitorLogin.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import ExhibitorNavbar from "./ExhibitorNavbar";
import exhibitorImage from "../assets/llll.png"; // ✅ Import image

const ExhibitorLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [exhibitorLoginDetails, setExhibitorLoginDetails] = useState([]);

  useEffect(() => {
    fetchExhibitorLoginDetails();
  }, []);

  const fetchExhibitorLoginDetails = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_exhibitor_login.php");
      const data = await res.json();
      setExhibitorLoginDetails(data || []);
    } catch (err) {
      console.error("Failed to fetch Exhibitor Login details", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;
    const loginData = { email, password };

    try {
      const res = await fetch("https://inoptics.in/api/exhibitor_login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      console.log(res)
      const result = await res.json();
      if (result.success) {
        localStorage.setItem("isExhibitorLoggedIn", "true");
        localStorage.setItem("exhibitorInfo", JSON.stringify(result.data));
        navigate("/exhibitor-dashboard");
      } else {
        setError(result.message || "Exhibitor login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="exhibitorlogin-page">
      <ExhibitorNavbar />
      <div className="exhibitorlogin-main-content-wrapper">
        <div className="exhibitorlogin-bottom-container">
          {/* 🔹 Gradient Section with Text */}
          <div className="exhibitorlogin-gradient-section">
            <div className="exhibitorlogin-text-container">
              {exhibitorLoginDetails.length > 0 ? (
                exhibitorLoginDetails.map((item, index) => (
                  <div key={item.id || index}>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: item.description || "No description available.",
                      }}
                    />
                  </div>
                ))
              ) : (
                <p>No Exhibitor Login details found.</p>
              )}
            </div>
          </div>

          {/* 🔹 Left Image Section under gradient */}
          <div className="exhibitorlogin-image-container">
            <img src={exhibitorImage} alt="Exhibitor Visual" />
          </div>

          {/* 🔹 Floating Login Form (50% above gradient, 50% above image) */}
          <div className="exhibitorlogin-container">
            <h3 className="exhibitorlogin-form-heading">Log in</h3>
            <div className="exhibitorlogin-form-container">
              <form onSubmit={handleSubmit} className="exhibitorlogin-form">
                <div>
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="password-input-wrapper">
                  <label>Password:</label>
                  <div className="password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                    />
                    <span
                      className="password-toggle-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>

                {error && <p className="error-text">{error}</p>}
                <button type="submit" className="exhibitorlogin-btn">
                  Login
                </button>

                <p className="exhibitorlogin-register-text">
                  Register for new User →{" "}
                  <Link to="/become-exhibitor" className="register-link">
                    Click Here
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ExhibitorLogin;
