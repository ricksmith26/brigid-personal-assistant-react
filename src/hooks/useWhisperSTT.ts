import { useEffect, useRef, useState } from "react";
import { pipeline, AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

export const useWhisperSTT = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState<string | null>(null);

    const recognizerRef = useRef<AutomaticSpeechRecognitionPipeline | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    // Initialize Whisper model
    useEffect(() => {
        const initModel = async () => {
            try {
                console.log("🔄 Loading Whisper model...");
                setIsLoading(true);

                // Use the tiny English model for faster loading (31 MB)
                recognizerRef.current = await pipeline(
                    'automatic-speech-recognition',
                    'Xenova/whisper-tiny.en'
                );

                console.log("✅ Whisper model loaded successfully");
                setIsLoading(false);
                setError(null);
            } catch (err) {
                console.error("❌ Failed to load Whisper model:", err);
                setError("Failed to load speech recognition model");
                setIsLoading(false);
            }
        };

        initModel();

        // Cleanup
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Start listening
    const startListening = async () => {
        if (!recognizerRef.current) {
            console.error("Model not loaded yet");
            return;
        }

        try {
            console.log("🎤 Requesting microphone access...");

            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                console.log("🔄 Processing audio...");

                // Create audio blob
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                // Convert blob to audio buffer for Whisper
                const arrayBuffer = await audioBlob.arrayBuffer();
                const audioContext = new AudioContext({ sampleRate: 16000 });
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                // Get audio data (Whisper expects Float32Array at 16kHz)
                const audioData = audioBuffer.getChannelData(0);

                try {
                    // Transcribe with Whisper
                    const result = await recognizerRef.current!(audioData);
                    console.log("✅ Transcription:", result.text);
                    setTranscript(result.text);
                } catch (err) {
                    console.error("❌ Transcription error:", err);
                    setError("Failed to transcribe audio");
                }

                // Clear chunks for next recording
                audioChunksRef.current = [];

                // Auto-restart after 100ms
                setTimeout(() => {
                    if (isListening && mediaRecorderRef.current) {
                        mediaRecorderRef.current.start();
                        console.log("🔄 Restarting recording...");
                    }
                }, 100);
            };

            // Start recording in 3-second chunks
            mediaRecorder.start();
            console.log("🎙️ Recording started");

            // Stop and process every 3 seconds for continuous transcription
            const recordingInterval = setInterval(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 3000);

            setIsListening(true);
            setError(null);

            // Store interval for cleanup
            (mediaRecorder as any).recordingInterval = recordingInterval;

        } catch (err) {
            console.error("❌ Microphone access error:", err);
            setError("Microphone access denied");
            setIsListening(false);
        }
    };

    // Stop listening
    const stopListening = () => {
        console.log("⏹️ Stopping listening...");

        if (mediaRecorderRef.current) {
            const mediaRecorder = mediaRecorderRef.current;

            // Clear interval
            if ((mediaRecorder as any).recordingInterval) {
                clearInterval((mediaRecorder as any).recordingInterval);
            }

            // Stop recording
            if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }

            mediaRecorderRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        setIsListening(false);
    };

    // Reset transcript
    const resetTranscript = () => {
        setTranscript("");
    };

    return {
        transcript,
        isListening,
        isLoading,
        error,
        startListening,
        stopListening,
        resetTranscript,
        browserSupportsWhisper: true // Always true since it runs in WebAssembly
    };
};

export default useWhisperSTT;
