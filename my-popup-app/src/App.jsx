import React, { useState } from "react";
import Popup from "./Popup";

function App() {
  const [showPopup, setShowPopup] = useState(true);

  return (
    <div className="App">
      {showPopup && (
        <Popup show={showPopup} handleClose={() => setShowPopup(false)} />
      )}
    </div>
  );
}

export default App;
