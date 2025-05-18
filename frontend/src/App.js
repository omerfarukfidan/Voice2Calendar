import React from "react";
import AudioRecorder from "./components/AudioRecorder";
import "./styles/App.css";

function App() {
  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <img src="/logo.png" alt="Voice2Calendar logo" className="app-logo" />
        <h1 className="fw-bold">Voice2Calendar</h1>
        <p className="text-muted">Speak your plans — we’ll turn them into calendar events.</p>
      </div>

      <div className="card shadow-sm p-4 mx-auto" style={{ maxWidth: "540px" }}>
        <h4 className="mb-3 text-center">🎤 Record & Upload</h4>
        <AudioRecorder />
      </div>

      <footer className="text-center mt-5 text-muted small">
        © 2025 Voice2Calendar. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
