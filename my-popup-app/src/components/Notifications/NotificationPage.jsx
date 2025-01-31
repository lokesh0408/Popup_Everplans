import React, { useState, useEffect } from "react";
import { requestForToken } from "../../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./NotificationPage.css";

function NotificationPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState(""); // User ID for targeted notification

  // Request for Notification Permission and fetch Token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        if (!("Notification" in window)) {
          alert("This browser does not support notifications.");
          return;
        }

        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            alert("Notification permission denied.");
            return;
          }
        }

        const newToken = await requestForToken();
        if (newToken) {
          setToken(newToken);
          // Store token in backend
          await fetch("http://localhost:5000/api/storeToken", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: newToken }),
          });
        }
      } catch (error) {
        alert("Error while fetching token or storing it: " + error.message);
      }
    };

    fetchToken();
  }, []);

  // Handle the notification send process
  const sendNotification = async (isSendToAll) => {
    if (!title || !body) {
      alert("Please enter both title and message!");
      return;
    }

    const endpoint = isSendToAll
      ? "http://localhost:5000/api/sendNotificationToAll"
      : "http://localhost:5000/api/sendNotification";

    const payload = isSendToAll
      ? { title, body }
      : { userId, title, body, token };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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
        console.log(endpoint);

        // Show browser notification if permission is granted
        if (Notification.permission === "granted") {
          new Notification(title, { body });
        }

        setTitle("");
        setBody("");
        setUserId("");
      } else {
        throw new Error("Error sending notification!");
      }
    } catch (error) {
      toast.error(error.message || "Error sending notification!");
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
      />
      <input
        type="text"
        placeholder="User ID (Leave empty to send to all)"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <div className="button-group">
        <button onClick={() => sendNotification(false)} className="SendToUser">
          Send to User
        </button>
        <button onClick={() => sendNotification(true)} className="SendToAll">
          Send to All
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default NotificationPage;
