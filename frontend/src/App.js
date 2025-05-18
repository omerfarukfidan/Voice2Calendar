import React, { useState } from "react";
import AudioRecorder from "./components/AudioRecorder";
import "./styles/App.css";

function App() {
  const [transcript, setTranscript] = useState("");
  const [datetimes, setDatetimes] = useState([]);

  const handleTranscriptionResult = (result) => {
    setTranscript(result.transcript || "");
    setDatetimes(result.datetimes || []);
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <img src="/logo.png" alt="Voice2Calendar logo" className="app-logo" />
        <h1 className="fw-bold">Voice2Calendar</h1>
        <p className="text-muted">Speak your plans — we’ll turn them into calendar events.</p>
      </div>

      <div className="card shadow-sm p-4 mx-auto" style={{ maxWidth: "540px" }}>
        <h4 className="mb-3 text-center">🎤 Record & Upload</h4>
        <AudioRecorder onTranscription={handleTranscriptionResult} />
      </div>

      {transcript && (
        <div className="card mt-4 mx-auto p-4 shadow-sm" style={{ maxWidth: "540px" }}>
          <h5 className="mb-3">📝 Transcription Result</h5>
          <p><strong>Text:</strong> {transcript}</p>
          <div className="mt-3">
            <h6>📅 Detected Date/Time:</h6>
            {datetimes.length > 0 ? (
              <ul>
                {datetimes.map((dt, index) => (
                  <li key={index}>
                    <strong>{dt.phrase}</strong> → {dt.parsed}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted"><em>No date/time detected.</em></p>
            )}
          </div>
        </div>
      )}

      <footer className="text-center mt-5 text-muted small">
        © 2025 Voice2Calendar. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
