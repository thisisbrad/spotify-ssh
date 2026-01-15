import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/api/v1";

axios.defaults.withCredentials = true;

const GoogleLogin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/current-user`);
      setUser(response.data.user);
    } catch (error) {
      console.log("Not authenticated");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/login`;
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      {user ? (
        <div>
          <h2>Welcome, {user.name}!</h2>
          <img
            src={user.picture}
            alt="Profile"
            style={{ borderRadius: "50%", width: "100px", height: "100px" }}
          />
          <p>{user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <h2>Please sign in</h2>
          <button onClick={handleLogin}>Sign in with Google</button>
        </div>
      )}
    </div>
  );
};

export default GoogleLogin;
