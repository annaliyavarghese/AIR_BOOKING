
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../App.css";

function MyTrips() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("access");

        const response = await axios.get(
          "http://https://air-booking-backend.onrender.com/api/bookings/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;
        setBookings(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Unable to load your trips."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return <div className="my-trips-page">Loading your trips...</div>;
  }

  return (
    <div className="my-trips-page">
      <nav className="air-navbar">
        <Link to="/" className="brand">AirBooking</Link>
        <Link to="/" className="nav-link">Home</Link>
      </nav>

      <div className="my-trips-container">
        <h1>My Trips</h1>
        <p>View your flight bookings here.</p>

        {error && <p className="flight-message">{error}</p>}

        {!error && bookings.length === 0 && (
          <p className="no-trips">You have no bookings yet.</p>
        )}

        <div className="my-trips-list">
          {bookings.map((booking) => (
            <div className="my-trip-card" key={booking.id}>
              <h3>Booking #{booking.id}</h3>

              <p><strong>Flight ID:</strong> {booking.flight}</p>
              <p><strong>Passengers:</strong> {booking.passengers}</p>
              <p><strong>Total Amount:</strong> ₹{booking.total_amount}</p>
              <p><strong>Booking Status:</strong> {booking.booking_status}</p>
              <p><strong>Payment Status:</strong> {booking.payment_status}</p>
              <p>
                <strong>Booking Date:</strong>{" "}
                {new Date(booking.booking_date).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyTrips;
