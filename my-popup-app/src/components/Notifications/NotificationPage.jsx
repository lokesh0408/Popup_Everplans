import React, { useState, useEffect } from "react";
import { requestForToken } from "../../firebase";
import "./NotificationPage.css";

function NotificationPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        async function fetchToken() {
          const newToken = await requestForToken();
          console.log("Fetched Token:", newToken);
          if (newToken) {
            setToken(newToken);
          }
        }
        fetchToken();
      }
    });
  }, []);

  const sendNotification = async () => {
    const payload = { title, body, token };
    console.log("Payload:", payload);

    const response = await fetch("http://localhost:5000/api/sendNotification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Notification sent:", data);
    alert(data.message || "Error sending notification");

    if (data.success) {
      setTitle("");
      setBody("");
    }
  };

  return (
    <div className="notification-container">
      <h2>Send Push Notification</h2>
      <input
        type="text"
        placeholder="Notification Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Notification Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      ></textarea>
      <input type="text" placeholder="User Token" value={token} readOnly />
      <button onClick={sendNotification}>Send</button>
    </div>
  );
}

export default NotificationPage;
