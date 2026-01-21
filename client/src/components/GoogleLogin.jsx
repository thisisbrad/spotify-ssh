import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/api/v1";

axios.defaults.withCredentials = true;

const GoogleLogin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/login`;
  };

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/current-user`);
      console.log(response.data.user);
      setUser(response.data.user);
    } catch (error) {
      console.log("Not authenicated");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
      setUser(null);
    } catch (error) {
      console.log("Failed to logout user.");
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      {user ? (
        <div>
          <p>{user.name}</p>
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
