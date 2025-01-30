import React, { useState, useEffect } from "react";
import { requestForToken } from "../../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./NotificationPage.css";

function NotificationPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [token, setToken] = useState("");

  // Request for Notification Permission and fetch Token
  useEffect(() => {
    const fetchToken = async () => {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const newToken = await requestForToken();
        if (newToken) setToken(newToken);
      }
    };

    fetchToken();
  }, []);

  // Handle the notification send process
  const sendNotification = async () => {
    if (!title || !body) {
      alert("Please enter both title and message before sending!");
      return;
    }

    const payload = { title, body, token };

    try {
      const response = await fetch(
        "http://localhost:5000/api/sendNotification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Notification sent successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });

        // Show browser notification if permission is granted
        if (Notification.permission === "granted") {
          new Notification(title, { body });
        }

        setTitle("");
        setBody("");
      } else {
        throw new Error("Error while sending notification!");
      }
    } catch (error) {
      alert(error.message || "Error while sending notification!");
    }
  };

  return (
    <div className="notification-container">
      <h2>Send Push Notification</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Message..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      ></textarea>
      <input type="text" placeholder="User Token" value={token} readOnly />
      <button onClick={sendNotification}>Send</button>

      <ToastContainer />
    </div>
  );
}

export default NotificationPage;
