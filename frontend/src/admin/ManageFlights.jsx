
import { useEffect, useState } from "react";
import axios from "axios";
import "./ManageFlights.css";

const API = "http://127.0.0.1:8000/api";

const emptyFlight = {
  flight_number: "",
  airline: "",
  source: "",
  destination: "",
  departure_date: "",
  departure_time: "",
  arrival_time: "",
  price: "",
  total_seats: "",
  available_seats: "",
  status: "On-time",
};

function ManageFlights() {
  const [flights, setFlights] = useState([]);
  const [flight, setFlight] = useState(emptyFlight);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("access")}`,
  };

  const fetchFlights = async () => {
    try {
      const response = await axios.get(`${API}/flights/admin/`, {
        headers,
      });
      setFlights(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error(error);
      setMessage("Unable to load flights.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleChange = (e) => {
    setFlight({
      ...flight,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const data = {
        ...flight,
        price: Number(flight.price),
        total_seats: Number(flight.total_seats),
        available_seats: Number(flight.available_seats),
      };

      if (editingId) {
        await axios.put(
          `${API}/flights/admin/${editingId}/`,
          data,
          { headers }
        );
        setMessage("Flight updated successfully.");
      } else {
        await axios.post(
          `${API}/flights/admin/`,
          data,
          { headers }
        );
        setMessage("Flight added successfully.");
      }

      setFlight(emptyFlight);
      setEditingId(null);
      fetchFlights();
    } catch (error) {
      console.error(error);
      setMessage(
        JSON.stringify(error.response?.data || "Unable to save flight.")
      );
    }
  };

  const handleEdit = (item) => {
    setFlight({
      flight_number: item.flight_number || "",
      airline: item.airline || "",
      source: item.source || "",
      destination: item.destination || "",
      departure_date: item.departure_date || "",
      departure_time: item.departure_time || "",
      arrival_time: item.arrival_time || "",
      price: item.price || "",
      total_seats: item.total_seats || "",
      available_seats: item.available_seats || "",
      status: item.status || "On-time",
    });

    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this flight?")) {
      return;
    }

    try {
      await axios.delete(`${API}/flights/admin/${id}/`, { headers });
      setMessage("Flight deleted successfully.");
      fetchFlights();
    } catch (error) {
      console.error(error);
      setMessage("Unable to delete flight.");
    }
  };

  const handleStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `${API}/flights/admin/${id}/status/`,
        { status: newStatus },
        { headers }
      );

      setMessage("Flight status updated.");
      fetchFlights();
    } catch (error) {
      console.error(error);
      setMessage(
        JSON.stringify(error.response?.data || "Unable to update status.")
      );
    }
  };

  if (loading) {
    return <div className="flights-loading">Loading flights...</div>;
  }

  return (
    <div className="admin-page">
      <div className="flights-header">
        <div>
          <h1>Manage Flights</h1>
          <p>Add, edit, delete and update flight details.</p>
        </div>
        <div className="flights-count">
          {flights.length} Total Flights
        </div>
      </div>

      {message && <div className="flights-message">{message}</div>}

      <form className="flight-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit Flight" : "Add New Flight"}</h2>

        <div className="flight-form-grid">
          {Object.entries({
            flight_number: "Flight Number",
            airline: "Airline",
            source: "Source",
            destination: "Destination",
            departure_date: "Departure Date",
            departure_time: "Departure Time",
            arrival_time: "Arrival Time",
            price: "Price",
            total_seats: "Total Seats",
            available_seats: "Available Seats",
          }).map(([name, label]) => (
            <label className="flight-field" key={name}>
              {label}
              <input
                name={name}
                type={
                  name === "departure_date" ? "date" :
                  name.includes("time") ? "time" :
                  ["price", "total_seats", "available_seats"].includes(name)
                    ? "number"
                    : "text"
                }
                min={
                  ["price", "total_seats", "available_seats"].includes(name)
                    ? "0"
                    : undefined
                }
                step={name === "price" ? "0.01" : "1"}
                value={flight[name]}
                onChange={handleChange}
                required
              />
            </label>
          ))}

          <label className="flight-field">
            Flight Status
            <select
              name="status"
              value={flight.status}
              onChange={handleChange}
            >
              <option value="On-time">On-time</option>
              <option value="Delayed">Delayed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>
        </div>

        <div className="flight-form-actions">
          <button className="flight-submit-btn" type="submit">
            {editingId ? "Update Flight" : "Add Flight"}
          </button>

          {editingId && (
            <button
              className="flight-cancel-btn"
              type="button"
              onClick={() => {
                setFlight(emptyFlight);
                setEditingId(null);
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="flights-list-card">
        <h2>All Flights ({flights.length})</h2>

        {flights.length === 0 ? (
          <p className="flights-empty">No flights available.</p>
        ) : (
          <div className="flights-table-wrapper">
            <table className="flights-table">
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {flights.map((item) => (
                  <tr key={item.id}>
                    <td>{item.flight_number}</td>
                    <td>{item.source} → {item.destination}</td>
                    <td>{item.departure_date}</td>
                    <td>₹{item.price}</td>
                    <td>{item.available_seats}/{item.total_seats}</td>
                    <td>
                      <select
                        className="flight-status-select"
                        value={item.status}
                        onChange={(e) =>
                          handleStatus(item.id, e.target.value)
                        }
                      >
                        <option value="On-time">On-time</option>
                        <option value="Delayed">Delayed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="flight-action-buttons">
                        <button
                          className="flight-edit-btn"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="flight-delete-btn"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageFlights;
