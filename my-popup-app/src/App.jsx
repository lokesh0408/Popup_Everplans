import React, { useState } from "react";
import Popup from "./components/Popup/Popup";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import NotificationPage from "./components/Notifications/NotificationPage";

function App() {
  const [showPopup, setShowPopup] = useState(true);

  return (
    <Router>
      <nav>
        <Link to="/notifications">Notifications</Link>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            showPopup && (
              <Popup show={showPopup} handleClose={() => setShowPopup(false)} />
            )
          }
        />
        <Route path="/notifications" element={<NotificationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
