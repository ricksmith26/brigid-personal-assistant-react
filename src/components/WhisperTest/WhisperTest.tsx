import { useEffect } from "react";
import useWhisperSTT from "../../hooks/useWhisperSTT";
import "./WhisperTest.css";

const WhisperTest = () => {
    const {
        transcript,
        isListening,
        isLoading,
        error,
        startListening,
        stopListening,
        resetTranscript
    } = useWhisperSTT();

    return (
        <div className="whisper-test-container">
            <h1>🎤 Whisper Speech Recognition Test</h1>

            <div className="status-section">
                <h2>Status</h2>
                {isLoading && <p className="status loading">⏳ Loading Whisper model...</p>}
                {error && <p className="status error">❌ Error: {error}</p>}
                {isListening && <p className="status listening">👂 Listening...</p>}
                {!isLoading && !isListening && !error && <p className="status ready">✅ Ready</p>}
            </div>

            <div className="controls-section">
                <h2>Controls</h2>
                <button
                    onClick={startListening}
                    disabled={isLoading || isListening}
                    className="btn btn-start"
                >
                    🎙️ Start Listening
                </button>
                <button
                    onClick={stopListening}
                    disabled={!isListening}
                    className="btn btn-stop"
                >
                    ⏹️ Stop Listening
                </button>
                <button
                    onClick={resetTranscript}
                    disabled={!transcript}
                    className="btn btn-reset"
                >
                    🔄 Reset Transcript
                </button>
            </div>

            <div className="transcript-section">
                <h2>Transcript</h2>
                <div className="transcript-box">
                    {transcript || <span className="placeholder">Transcript will appear here...</span>}
                </div>
            </div>

            <div className="instructions-section">
                <h2>Instructions</h2>
                <ol>
                    <li>Wait for the Whisper model to load (this may take a minute on first load)</li>
                    <li>Click "Start Listening" to begin recording</li>
                    <li>Speak clearly into your microphone</li>
                    <li>The transcription will update every 3 seconds</li>
                    <li>Try saying: "Winston", "Dashboard", "Play", or other commands</li>
                </ol>

                <div className="info-box">
                    <h3>ℹ️ About This Implementation</h3>
                    <ul>
                        <li><strong>Model:</strong> Whisper Tiny English (31 MB)</li>
                        <li><strong>Runs:</strong> Completely offline in your browser</li>
                        <li><strong>Works on:</strong> Mac, Raspberry Pi, and all browsers</li>
                        <li><strong>Privacy:</strong> No data sent to servers</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default WhisperTest;
