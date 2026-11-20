
import { useEffect, useState } from "react";
import axios from "axios";
import "./ManageBookings.css";

const API = "http://https://air-booking-backend.onrender.com/api";

function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/bookings/admin/all/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      setBookings(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="admin-page">
      <div className="bookings-header">
        <div>
          <h1>Manage Bookings</h1>
          <p>View all customer bookings.</p>
        </div>

        <button
          className="booking-refresh-btn"
          onClick={fetchBookings}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh Bookings"}
        </button>
      </div>

      {error && <div className="bookings-error">{error}</div>}

      {loading && (
        <div className="bookings-loading">Loading bookings...</div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="bookings-empty">No bookings found.</div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="bookings-card">
          <div className="bookings-card-header">
            <h2>All Customer Bookings</h2>
            <span className="bookings-count">
              Total: {bookings.length}
            </span>
          </div>

          <div className="bookings-table-wrapper">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Flight ID</th>
                  <th>Passengers</th>
                  <th>Amount</th>
                  <th>Booking Status</th>
                  <th>Payment Status</th>
                  <th>Booking Date</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>{booking.flight}</td>
                    <td>{booking.passengers}</td>
                    <td>₹{booking.total_amount}</td>
                    <td>
                      <span className={`booking-status ${String(booking.booking_status || "").toLowerCase()}`}>
                        {booking.booking_status}
                      </span>
                    </td>
                    <td>
                      <span className={`payment-status ${String(booking.payment_status || "").toLowerCase()}`}>
                        {booking.payment_status}
                      </span>
                    </td>
                    <td>
                      {booking.booking_date
                        ? new Date(booking.booking_date).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageBookings;
