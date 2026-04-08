const BASE = "http://localhost:5000";

export const loginAdmin = async (data) => {
  const res = await fetch(`${BASE}/api/admin-login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });
  return res.json();
};

export const getUsers = async () => {
  const res = await fetch(`${BASE}/api/users`);
  return res.json();
};

export const getLive = async () => {
  const res = await fetch(`${BASE}/api/live`);
  return res.json();
};