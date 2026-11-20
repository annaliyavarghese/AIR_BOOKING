
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://https://air-booking-backend.onrender.com/api/auth/login/",
        { username, password }
      );

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      alert("Login successful!");

      // Login success aayal Home page lekku pokum
      navigate("/");

    } catch (error) {
      alert(
        error.response?.data?.detail ||
        "Login failed. Check username and password."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-banner">
          <h1>AirBooking</h1>
          <h2>Your Journey Begins Here!</h2>
          <p>Discover destinations and book your flights easily.</p>
        </div>

        <div className="auth-form">
          <h2>Welcome Back!</h2>
          <p>Login to continue your journey.</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                className="form-control"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary" type="submit">
              Login
            </button>
          </form>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
