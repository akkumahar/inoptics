import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";

import { FaEye, FaEyeSlash } from "react-icons/fa";

const AdminThreeLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginData = { email, password };

    try {
      const res = await fetch("https://inoptics.in/api/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const result = await res.json();
      console.log("Login result:", result);

      if (result.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("adminEmail", email);

       navigate("/power-dashboard");
      } else {
        setError(result.message || "Login failed. Please check credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="main-content-wrapper">
      <div className="main-login-container">
        <div className="login-text-container">
          <h2>Welcome Admin Power to In-Optics Portal</h2>
        </div>

        <div className="login-columns">
          <div className="login-container">
            <h2 className="login-main-heading">Admin Power</h2>

            <div className="login-form-container">
              <form onSubmit={handleSubmit} className="login-form">

                <div>
                  <label>Email:</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="password-input-wrapper">
                  <label>Password:</label>

                  <div className="password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <button type="submit">Admin Power Login</button>

              </form>
            </div>
          </div>
        </div>
      </div>

 
    </div>
  );
};

export default AdminThreeLogin;