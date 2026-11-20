
import { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate
} from "react-router-dom";

import Login from "./pages/LoginPage";
import Register from "./pages/Register";
import MyTrips from "./pages/MyTrips";

import AdminDashboard from "./admin/AdminDashboard";
import ManageUsers from "./admin/ManageUsers";
import ManageFlights from "./admin/ManageFlights";
import ManageBookings from "./admin/ManageBookings";

import "./App.css";

const API = "https://air-booking-backend.onrender.com/api";


// ADMIN ROUTE PROTECTION

function AdminRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      setStatus("login");
      return;
    }

    axios.get(`${API}/auth/admin/users/pending/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(() => setStatus("allowed"))
      .catch(() => setStatus("denied"));
  }, []);

  if (status === "checking") {
    return <p>Checking admin access...</p>;
  }

  if (status === "login") {
    return <Navigate to="/login" replace />;
  }

  if (status === "denied") {
    return <Navigate to="/" replace />;
  }

  return children;
}

// HOME PAGE

function Home() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  const [availableOnly, setAvailableOnly] = useState(false);

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [passengers, setPassengers] = useState(1);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // BOOKING CONFIRMATION STATE
  const [confirmation, setConfirmation] = useState(null);

  const [liveStatuses, setLiveStatuses] = useState({});
  const [liveLoading, setLiveLoading] = useState(null);

  const filteredFlights = availableOnly
    ? flights.filter(
        (flight) => Number(flight.available_seats) > 0
      )
    : flights;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access");

    if (!token) {
      throw new Error("Please login first to continue.");
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // FLIGHT SEARCH

  const handleSearch = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setFlights([]);
    setBookingMessage("");
    setConfirmation(null);
    setLiveStatuses({});

    try {
      const response = await axios.get(
        `${API}/flights/search/`,
        {
          params: {
            source,
            destination,
            date,
          },
        }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setFlights(data);

      if (data.length === 0) {
        setError("No available flights found.");
      }
    } catch (err) {
      console.log(err);
      setError("Unable to search flights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // LIVE FLIGHT STATUS

  const handleLiveStatus = async (flightId) => {
    setLiveLoading(flightId);

    try {
      const response = await axios.get(
        `${API}/flights/${flightId}/live-status/`
      );

      setLiveStatuses((previous) => ({
        ...previous,
        [flightId]: response.data,
      }));

    } catch (err) {
      console.log(err);

      setLiveStatuses((previous) => ({
        ...previous,
        [flightId]: {
          error: "Unable to fetch live flight status.",
        },
      }));
    } finally {
      setLiveLoading(null);
    }
  };

  // CREATE BOOKING

  const handleBooking = async (flightId) => {
    setBookingLoading(true);
    setBookingMessage("");
    setConfirmation(null);

    try {
      const selectedFlight = flights.find(
        (flight) => flight.id === flightId
      );

      const response = await axios.post(
        `${API}/bookings/`,
        {
          flight: flightId,
          passengers: Number(passengers),
        },
        {
          headers: getAuthHeaders(),
        }
      );

      // SAVE BOOKING CONFIRMATION DETAILS

      setConfirmation({
        booking: response.data,
        flight: selectedFlight,
        passengers: Number(passengers),
        totalAmount:
          Number(selectedFlight?.price || 0) *
          Number(passengers),
      });

      setBookingMessage("");

      // REFRESH FLIGHT SEAT AVAILABILITY

      const flightResponse = await axios.get(
        `${API}/flights/search/`,
        {
          params: { source, destination, date },
        }
      );

      const data = Array.isArray(flightResponse.data)
        ? flightResponse.data
        : flightResponse.data.results || [];

      setFlights(data);

    } catch (err) {
      console.log(err);

      const message =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.error ||
        err.message ||
        "Booking failed.";

      setBookingMessage(
        typeof message === "string"
          ? message
          : JSON.stringify(message)
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // CLOSE CONFIRMATION

  const handleCloseConfirmation = () => {
    setConfirmation(null);
    setBookingMessage("");
  };

  return (
    <div className="air-home">

      {/* BOOKING CONFIRMATION */}

      {confirmation && (
        <div className="booking-confirmation">
          <div className="confirmation-card">

            <div className="confirmation-icon">
              ✓
            </div>

            <h1>Booking Confirmed!</h1>

            <p>
              Your flight booking was successful.
            </p>

            <div className="confirmation-details">

              <p>
                <strong>Booking ID:</strong>{" "}
                {confirmation.booking.id}
              </p>

              <p>
                <strong>Flight:</strong>{" "}
                {confirmation.flight?.airline} -{" "}
                {confirmation.flight?.flight_number}
              </p>

              <p>
                <strong>From:</strong>{" "}
                {confirmation.flight?.source}
              </p>

              <p>
                <strong>To:</strong>{" "}
                {confirmation.flight?.destination}
              </p>

              <p>
                <strong>Travel Date:</strong>{" "}
                {confirmation.flight?.departure_date}
              </p>

              <p>
                <strong>Departure:</strong>{" "}
                {confirmation.flight?.departure_time}
              </p>

              <p>
                <strong>Arrival:</strong>{" "}
                {confirmation.flight?.arrival_time}
              </p>

              <p>
                <strong>Passengers:</strong>{" "}
                {confirmation.passengers}
              </p>

              <p>
                <strong>Total Amount:</strong>{" "}
                ₹{confirmation.totalAmount.toFixed(2)}
              </p>

              <p>
                <strong>Payment Status:</strong>{" "}
                {confirmation.booking.payment_status ||
                  confirmation.booking.payment_status_display ||
                  "Pending"}
              </p>

              <p>
                <strong>Booking Status:</strong>{" "}
                {confirmation.booking.status || "Confirmed"}
              </p>

            </div>

            <Link
              to="/my-trips"
              className="confirmation-btn"
            >
              View My Bookings
            </Link>

            <button
              type="button"
              className="confirmation-btn secondary"
              onClick={handleCloseConfirmation}
            >
              Book Another Flight
            </button>

          </div>
        </div>
      )}

      {/* NAVBAR */}

      <nav className="air-navbar">
        <Link to="/" className="brand">
          ✈ AirBooking
        </Link>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#destinations">Destinations</a>
          <a href="#services">Services</a>

          {localStorage.getItem("access") ? (
            <>
              <Link to="/my-trips">My Trip</Link>

              <Link
                to="/dashboard"
                className="user-profile-icon"
                title="User Dashboard"
                aria-label="User Dashboard"
              >
                👤
              </Link>

              <Link to="/admin">Admin Panel</Link>

              <button
  type="button"
  className="logout-btn"
  onClick={() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/";
  }}
>
  Logout
</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="signup-btn">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}

      <section className="hero-section" id="home">
        <div className="hero-content">
          <span className="eyebrow">
            ✦ DISCOVER THE WORLD
          </span>

          <h1>
            Your Journey<br />
            Begins <span>With Us.</span>
          </h1>

          <p>
            Find your flight. Book your journey. Travel with ease.
            Explore the world with AirBooking.
          </p>

          <a href="#flight-search" className="hero-btn">
            Explore Flights →
          </a>

          <div className="hero-features">
            <span>✓ Easy Booking</span>
            <span>✓ Secure Travel</span>
            <span>✓ Best Experience</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="plane-circle">
            <div className="plane">✈</div>
          </div>

          <div className="floating-card">
            Explore the world
          </div>

          <div className="floating-card second-card">
             Happy Journey!
          </div>
        </div>
      </section>

      {/* FLIGHT SEARCH */}

      <section className="search-area" id="flight-search">
        <div className="search-heading">
          <span>START YOUR ADVENTURE</span>
          <h2>Where would you like to go?</h2>
        </div>

        <form className="flight-search" onSubmit={handleSearch}>
          <div className="search-field">
            <label>FROM</label>
            <input
              placeholder="Departure airport"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
            />
          </div>

          <div className="search-field">
            <label>TO</label>
            <input
              placeholder="Arrival airport"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>

          <div className="search-field">
            <label>TRAVEL DATE</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="search-btn"
            disabled={loading}
          >
            {loading ? "Searching..." : "⌕ Search Flights"}
          </button>
        </form>

        {/* AVAILABILITY FILTER */}

        <div className="availability-filter">
          <label>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            Show only flights with available seats
          </label>
        </div>

        {error && (
          <p className="flight-message">{error}</p>
        )}

        {/* FLIGHT RESULTS */}

        {filteredFlights.length > 0 && (
          <div className="flight-results">
            <h2>Available Flights</h2>

            <div className="search-field">
              <label>NUMBER OF PASSENGERS</label>

              <input
                type="number"
                min="1"
                max="10"
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
              />
            </div>

            {filteredFlights.map((flight) => {
              const flightStatus = liveStatuses[flight.id];
              const liveData = flightStatus?.live_status;

              return (
                <div className="flight-result-card" key={flight.id}>
                  <h3>
                    ✈ {flight.airline} - {flight.flight_number}
                  </h3>

                  <p>
                    <strong>From:</strong> {flight.source}
                  </p>

                  <p>
                    <strong>To:</strong> {flight.destination}
                  </p>

                  <p>
                    <strong>Date:</strong> {flight.departure_date}
                  </p>

                  <p>
                    <strong>Departure:</strong> {flight.departure_time}
                  </p>

                  <p>
                    <strong>Arrival:</strong> {flight.arrival_time}
                  </p>

                  <p>
                    <strong>Price per passenger:</strong> ₹{flight.price}
                  </p>

                  <p>
                    <strong>Available Seats:</strong> {flight.available_seats}
                  </p>

                  <p>
                    <strong>Status:</strong> {flight.status}
                  </p>

                  {/* LIVE FLIGHT STATUS BUTTON */}

                  <button
                    type="button"
                    className="search-btn"
                    onClick={() => handleLiveStatus(flight.id)}
                    disabled={liveLoading === flight.id}
                  >
                    {liveLoading === flight.id
                      ? "Checking..."
                      : "Check Live Status"}
                  </button>

                  {/* LIVE FLIGHT INFORMATION */}

                  {flightStatus && (
                    <div className="live-status-box">
                      <h4>Flight Information</h4>

                      {flightStatus.error ? (
                        <p>{flightStatus.error}</p>
                      ) : (
                        <>
                          <p>
                            <strong>Scheduled Status:</strong>{" "}
                            {flightStatus.scheduled_status || flight.status}
                          </p>

                          <p>
                            <strong>Live Flight Status:</strong>{" "}
                            {liveData?.status ||
                              liveData?.message ||
                              "Live status unavailable"}
                          </p>

                          {liveData?.error && (
                            <p>{liveData.error}</p>
                          )}

                          {liveData?.status && (
                            <>
                              <p>
                                <strong>Latitude:</strong>{" "}
                                {liveData.latitude ?? "N/A"}
                              </p>

                              <p>
                                <strong>Longitude:</strong>{" "}
                                {liveData.longitude ?? "N/A"}
                              </p>

                              <p>
                                <strong>Speed:</strong>{" "}
                                {liveData.velocity ?? "N/A"} m/s
                              </p>

                              <p>
                                <strong>Heading:</strong>{" "}
                                {liveData.heading ?? "N/A"}
                              </p>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <p>
                    <strong>Total Amount:</strong> ₹
                    {(Number(flight.price) * Number(passengers || 0)).toFixed(2)}
                  </p>

                  <button
                    type="button"
                    className="search-btn"
                    disabled={
                      bookingLoading ||
                      !localStorage.getItem("access") ||
                      Number(passengers) < 1 ||
                      Number(passengers) > flight.available_seats
                    }
                    onClick={() => handleBooking(flight.id)}
                  >
                    {bookingLoading ? "Processing..." : "Book Now"}
                  </button>

                  {!localStorage.getItem("access") && (
                    <p>Please login to book this flight.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* NO FLIGHTS AFTER FILTERING */}

        {flights.length > 0 && filteredFlights.length === 0 && (
          <p className="flight-message">
            No flights with available seats found.
          </p>
        )}

        {bookingMessage && (
          <p className="flight-message">
            {bookingMessage}
          </p>
        )}
      </section>

      {/* DESTINATIONS */}

      <section className="destinations-section" id="destinations">
        <div className="section-heading">
          <span>MAKE MEMORIES</span>
          <h2>Popular Destinations</h2>
          <p>Find inspiration for your next great adventure.</p>
        </div>

        <div className="destination-grid">
          <div className="destination-card dubai">
            <div>
              <span>UNITED ARAB EMIRATES</span>
              <h3>Dubai</h3>
            </div>
          </div>

          <div className="destination-card paris">
            <div>
              <span>FRANCE</span>
              <h3>Paris</h3>
            </div>
          </div>

          <div className="destination-card maldives">
            <div>
              <span>INDIAN OCEAN</span>
              <h3>Maldives</h3>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}

      <section className="services-section" id="services">
        <div className="section-heading">
          <span>WHY CHOOSE US</span>
          <h2>Travel Made Simple</h2>
        </div>

        <div className="service-grid">
          <div className="service-card">
            <div></div>
            <h3>Explore Anywhere</h3>
            <p>Discover exciting destinations around the world.</p>
          </div>

          <div className="service-card">
            <div></div>
            <h3>Secure Booking</h3>
            <p>Enjoy a simple and secure booking experience.</p>
          </div>

          <div className="service-card">
            <div></div>
            <h3>Travel Support</h3>
            <p>Manage your trips with a convenient experience.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="air-footer">
        <h2>✈ AirBooking</h2>
        <p>Your journey, our priority.</p>
        <small>© 2026 AirBooking. All rights reserved.</small>
      </footer>

    </div>
  );
}

// PERSONAL USER DASHBOARD

function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      setLoading(false);
      setError("Please login to view your dashboard.");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`
    };

    Promise.all([
      axios.get(`${API}/auth/profile/`, { headers }),
      axios.get(`${API}/bookings/`, { headers })
    ])
      .then(([profileResponse, bookingResponse]) => {
        setProfile(profileResponse.data);

        const data = Array.isArray(bookingResponse.data)
          ? bookingResponse.data
          : bookingResponse.data.results || [];

        setBookings(data);
      })
      .catch((err) => {
        console.log("Dashboard API error:", err);
        setError(
          "Unable to load your profile. Please login again and try."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (!localStorage.getItem("access")) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="user-dashboard">

      <div className="user-dashboard-header">
        <Link to="/" className="dashboard-back-link">
          ← Home
        </Link>

        <div className="user-dashboard-icon">
          👤
        </div>

        <h1>My Dashboard</h1>
        <p>Welcome to your personal AirBooking dashboard!</p>
      </div>

      {/* PERSONAL DETAILS */}

      {loading && (
        <p>Loading your details...</p>
      )}

      {error && (
        <p>{error}</p>
      )}

      {!loading && profile && (
        <div className="user-booking-summary">
          <h2>My Personal Details</h2>

          <p>
            <strong>User ID:</strong> {profile.id}
          </p>

          <p>
            <strong>Username:</strong> {profile.username}
          </p>

          <p>
            <strong>Email:</strong> {profile.email}
          </p>

          <p>
            <strong>Account Status:</strong>{" "}
            {profile.approval_status}
          </p>
        </div>
      )}

      {/* DASHBOARD CARDS */}

      <div className="user-dashboard-cards">

        <Link to="/my-trips" className="user-dashboard-card">
          <span>✈️</span>
          <h3>My Trips</h3>
          <p>View and manage your flight bookings.</p>
        </Link>

        <Link to="/" className="user-dashboard-card">
          <span></span>
          <h3>Search Flights</h3>
          <p>Find and book your next flight.</p>
        </Link>

      </div>

      {/* BOOKING SUMMARY */}

      <div className="user-booking-summary">
        <h2>My Booking Summary</h2>

        {!loading && !error && (
          <>
            <h3>Total Bookings: {bookings.length}</h3>

            {bookings.length === 0 ? (
              <p>You have not made any bookings yet.</p>
            ) : (
              <p>
                Your personal bookings are available in the My Trips section.
              </p>
            )}

            <Link to="/my-trips" className="dashboard-trips-btn">
              View My Trips
            </Link>
          </>
        )}
      </div>

    </div>
  );
}

// MAIN APP

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/my-trips" element={<MyTrips />} />

        {/* ADMIN ROUTES */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/flights"
          element={
            <AdminRoute>
              <ManageFlights />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <ManageBookings />
            </AdminRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
