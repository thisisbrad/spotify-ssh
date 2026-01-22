import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000";
axios.defaults.withCredentials = true;

const ActivityLog = () => {
  const [loginHistory, setLoginHistory] = useState([]);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const [loginRes, sessionRes] = await Promise.all([
        axios.get(`${API_URL}/logs/login-history`),
        axios.get(`${API_URL}/logs/my-sessions`),
      ]);

      setLoginHistory(loginRes.data.logins);
      setSessionLogs(sessionRes.data.logs);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2>Login History</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>Date/Time</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Device</th>
            <th style={{ padding: "10px", textAlign: "left" }}>IP Address</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Event</th>
          </tr>
        </thead>
        <tbody>
          {loginHistory.map((login, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "10px" }}>
                {new Date(login.timestamp).toLocaleString()}
              </td>
              <td style={{ padding: "10px" }}>
                {login.device.browser}
                <br />
                <small>{login.device.os}</small>
              </td>
              <td style={{ padding: "10px" }}>{login.ip}</td>
              <td style={{ padding: "10px" }}>{login.event}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: "40px" }}>Recent Activity</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>Time</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Event</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Details</th>
          </tr>
        </thead>
        <tbody>
          {sessionLogs.slice(0, 20).map((log, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "10px" }}>
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td style={{ padding: "10px" }}>{log.event}</td>
              <td style={{ padding: "10px" }}>
                {log.deviceInfo?.browser} on {log.deviceInfo?.os}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityLog;
