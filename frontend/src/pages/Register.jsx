
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../App.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://https://air-booking-backend.onrender.com/api/auth/register/",
        formData
      );

      alert("Registration successful! Please wait for admin approval.");
      console.log(response.data);
    } catch (error) {
      console.log(error.response?.data);
      alert(JSON.stringify(error.response?.data || "Registration failed"));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-banner">
          <h1>AirBooking</h1>
          <h2>Start Your Journey!</h2>
          <p>Create your account and explore the world with us.</p>
        </div>

        <div className="auth-form">
          <h2>Create Account</h2>
          <p>Register to book your next flight.</p>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Username</label>
              <input
                className="form-control"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                className="form-control"
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                className="form-control"
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                className="form-control"
                type="password"
                name="password2"
                placeholder="Confirm password"
                value={formData.password2}
                onChange={handleChange}
                required
              />
            </div>

            <button className="btn btn-primary" type="submit">
              Create Account
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
