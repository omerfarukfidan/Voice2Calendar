import React, { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:5000/api/hello")
      .then(res => res.json())
      .then(data => {
        console.log("Backend response:", data);
        setMessage(data.message);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setMessage("Backend not available");
      });
  }, []);
  

  return (
    <div style={{ padding: 20 }}>
      <h1>{message}</h1>
    </div>
  );
}

export default App;
