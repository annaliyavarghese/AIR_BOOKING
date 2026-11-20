import { useEffect, useState } from "react";
import axios from "axios";
import "./ManageUsers.css";

const API = "http://https://air-booking-backend.onrender.com/api";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("access")}`,
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${API}/auth/admin/users/pending/`,
        { headers: getHeaders() }
      );

      setUsers(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      setMessage("Unable to load users. Check your admin login.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUser = async (id, action) => {
    try {
      await axios.post(
        `${API}/auth/admin/users/${id}/${action}/`,
        {},
        { headers: getHeaders() }
      );

      setMessage(
        action === "approve"
          ? "User approved successfully."
          : "User rejected successfully."
      );

      fetchUsers();
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Unable to update user."
      );
    }
  };

  if (loading) {
    return <div className="users-loading">Loading users...</div>;
  }

  return (
    <div className="admin-page">
      <div className="users-header">
        <div>
          <h1>Manage Users</h1>
          <p>Approve or reject pending registrations.</p>
        </div>

        <div className="users-count">
          {users.length} Pending Users
        </div>
      </div>

      {message && (
        <div className="users-message">
          {message}
        </div>
      )}

      <div className="users-card">
        <h2>Pending Registrations</h2>

        {users.length === 0 ? (
          <p className="users-empty">No pending users found.</p>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email || "—"}</td>
                    <td>
                      <div className="users-actions">
                        <button
                          className="approve-btn"
                          onClick={() => updateUser(user.id, "approve")}
                        >
                          Approve
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() => updateUser(user.id, "reject")}
                        >
                          Reject
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

export default ManageUsers;