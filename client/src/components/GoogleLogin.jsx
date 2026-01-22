import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/api/v1";

axios.defaults.withCredentials = true;

const GoogleLogin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);
  const refreshIntervalRef = useRef(null);

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

  const refreshSession = async () => {
    try {
      const response = await axios.post(`${API_URL}/session/refresh`);
      console.log("Session refreshed:", response.data);

      // Update session info
      await checkSessionStatus();
    } catch (error) {
      console.error("Session refresh failed:", error);

      // If refresh fails due to auth, log user out
      if (error.response?.status === 401) {
        setUser(null);
        setSessionInfo(null);
      }
    }
  };

  const checkSessionStatus = async () => {
    console.log("checking console...");
    try {
      const response = await axios.get(`${API_URL}/session/status`);

      if (response.data.authenticated) {
        setSessionInfo(response.data.session);
        console.log("Session Status: ", response.data.session);
        // Auto-refresh if less than 1 day remaining
        const oneDayInMs = 24 * 60 * 60 * 1000;
        if (response.data.session.timeRemainingMs < oneDayInMs) {
          console.log("Session expiring soon, refreshing...");
          await refreshSession();
        }
      }
    } catch (error) {
      console.error("Session check failed:", error);
    }
  };

  useEffect(() => {
    checkAuth();
    // Start checking session status every 5 minutes
    refreshIntervalRef.current = setInterval(
      () => {
        checkSessionStatus();
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Compontent Functions
  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/login`;
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
      setUser(null);
    } catch (error) {
      console.log("Failed to logout user.");
    }
  };

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
