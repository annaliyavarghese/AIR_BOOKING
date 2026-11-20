
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2>AirBooking</h2>
        <p>ADMIN PANEL</p>

        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/users">Manage Users</Link>
        <Link to="/admin/flights">Manage Flights</Link>
        <Link to="/admin/bookings">Manage Bookings</Link>

        <button onClick={handleLogout}>Logout</button>
      </aside>

      <main className="admin-main">
        <h1>Admin Dashboard</h1>
        <p>Welcome, Admin!</p>

        <div className="admin-cards">
          <Link to="/admin/users" className="admin-card">
            <h3>Manage Users</h3>
            <p>Approve or reject user registrations.</p>
          </Link>

          <Link to="/admin/flights" className="admin-card">
            <h3>Manage Flights</h3>
            <p>Add, edit and delete flights.</p>
          </Link>

          <Link to="/admin/bookings" className="admin-card">
            <h3>Manage Bookings</h3>
            <p>View and manage bookings.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
