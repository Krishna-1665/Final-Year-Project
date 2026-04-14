import { useEffect, useState } from "react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
const [allUsers, setAllUsers] = useState([]);
const [activeTab, setActiveTab] = useState("dashboard");
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`http://${window.location.hostname}:5000/api/live`)
        .then(res => res.json())
        .then(data => setUsers(data))
        .catch(err => console.error(err));
    }, 4000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
  const interval = setInterval(() => {
    fetch(`http://${window.location.hostname}:5000/api/all-users`)
      .then(res => res.json())
      .then(data => setAllUsers(data))
      .catch(err => console.error(err));
  }, 3000);

  return () => clearInterval(interval);
}, []);
  const filteredUsers = users.filter(u =>
  (u.name || "").toLowerCase().includes(search.toLowerCase())
);
const uniqueUsers = [...new Map(
  users
    .filter(u => !u.isCompleted)
    .map(u => [u.email, u])
).values()];
const total = uniqueUsers.length;
// const active = uniqueUsers.filter(u => !u.isCompleted).length;
const active = uniqueUsers.length;
const completed = uniqueUsers.filter(u => u.isCompleted).length;

return (
  <div className="dashboard">

    {/* SIDEBAR */}
    <div className="sidebar">
      <h2>HireVision</h2>
      <ul>
        <li 
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </li>

        <li 
          className={activeTab === "candidates" ? "active" : ""}
          onClick={() => setActiveTab("candidates")}
        >
          Candidates
        </li>
      </ul>
    </div>

    {/* MAIN */}
    <div className="main">

      {/* ===== DASHBOARD ===== */}
      {activeTab === "dashboard" && (
        <>
          <div className="header">
            <h1>Admin Dashboard</h1>
            <input
              type="text"
              placeholder="Search candidate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="cards">
            <div className="card">
              <p>Total Candidates</p>
              <h2>{total}</h2>
            </div>

            <div className="card">
              <p>Active Candidates</p>
              <h2 className="yellow">{active}</h2>
            </div>
          </div>

          <div className="table-container">
            <h2>Live Monitoring</h2>

            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Progress</th>
                  
                </tr>
              </thead>

              <tbody>
  {filteredUsers
    .filter(u => !u.isCompleted)
    .map((u, i) => (
      <tr key={i}>
        <td>{u.name}</td>
        <td>{u.email}</td>
        <td>{u.currentQuestion || 0}/15</td>
        
      </tr>
    ))}
</tbody>
            </table>

            <table>
              <tbody>
                {filteredUsers
                  .filter(u => u.isCompleted)
                  .map((u, i) => (
                    <tr key={i}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.currentQuestion || 15}/15</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <h2 style={{ marginTop: "30px" }}>Login History</h2>

            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Login Date</th>
                </tr>
              </thead>

              <tbody>
                {[...allUsers]
                  .sort((a, b) => {
                    const getTime = (t) => {
                      if (!t) return 0;
                      const s = String(t);
                      const d = new Date(s.endsWith('Z') ? s : `${s}Z`);
                      return isNaN(d.getTime()) ? 0 : d.getTime();
                    };
                    return getTime(b.loginTime) - getTime(a.loginTime);
                  })
                  .map((u, i) => (
                    <tr key={i}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        {u.loginTime ? (() => {
                          const dateStr = String(u.loginTime);
                          const dateObj = new Date(dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`);
                          if (isNaN(dateObj.getTime())) return "Invalid Date";
                          const day = String(dateObj.getDate()).padStart(2, '0');
                          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                          const year = dateObj.getFullYear();
                          return (
                            <>
                              {day}-{month}-{year}
                            </>
                          );
                        })() : "N/A"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ===== CANDIDATES ===== */}
      {activeTab === "candidates" && (
  <div className="candidates-section">

    <h2>Live Monitoring</h2>

    {uniqueUsers
  .filter(u => !u.isCompleted && u.status === "In Interview")
  .map((u, i) => (
      <div
        key={i}
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          margin: "10px",
          borderRadius: "10px"
        }}
      >
        <p><b>Name:</b> {u.name}</p>
        <p><b>Email:</b> {u.email}</p>
        <p><b>Status:</b> {u.isCompleted ? "Completed" : "In Progress"}</p>
        
        {/* 🔥 SHOW LIVE CAMERA */}
        {u.image ? (
  <>
    <img
      src={u.image}
      alt="live"
      style={{ width: "300px", borderRadius: "10px" }}
    />

    {/* 🔴 STOP BUTTON */}
    <button
      style={{
        marginTop: "10px",
        padding: "8px 12px",
        background: "red",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
      }}
      onClick={async () => {
  await fetch(`http://${window.location.hostname}:5000/api/admin-stop`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: u.email })
  });

  // ✅ REMOVE USER INSTANTLY FROM UI
  setUsers(prev => prev.filter(user => user.email !== u.email));

  alert("Interview stopped for " + u.name);
}}
    >
      ❌ Stop Interview
    </button>
  </>
) : (
  <p>No camera feed</p>
)}
      </div>
    ))}

  </div>
)}
    </div>
  </div>
);
}
