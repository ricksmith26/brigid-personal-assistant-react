import { useEffect, useRef, useState } from "react";
import { createModel, KaldiRecognizer, Model } from "vosk-browser";

interface VoskResult {
  result: {
    text?: string;
    partial?: string;
  };
}

const useVoskSTT = () => {
  const [isReady, setIsReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const modelRef = useRef<Model | null>(null);
  const recognizerRef = useRef<KaldiRecognizer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Load model on mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("Loading Vosk model...");
        // Model should be in public/models/vosk-model-small-en-us-0.15.tar.gz
        const model = await createModel("/models/vosk-model-small-en-us-0.15.tar.gz");
        modelRef.current = model;

        // Create recognizer with 16kHz sample rate
        recognizerRef.current = new model.KaldiRecognizer(16000);

        // Set up event listeners
        recognizerRef.current.on("result", (message: VoskResult) => {
          const text = message.result.text;
          if (text && text.trim()) {
            console.log("Vosk result:", text);
            setResults(prev => [...prev, text.trim()]);
          }
        });

        recognizerRef.current.on("partialresult", (message: VoskResult) => {
          const partial = message.result.partial;
          if (partial) {
            console.log("Vosk partial:", partial);
          }
        });

        setIsReady(true);
        console.log("Vosk model loaded successfully");
      } catch (err) {
        console.error("Failed to load Vosk model:", err);
        setError("Failed to load speech recognition model");
      }
    };

    loadModel();

    // Cleanup
    return () => {
      if (processorRef.current) {
        processorRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    if (!isReady || !recognizerRef.current) {
      console.warn("Vosk not ready");
      return;
    }

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
          sampleRate: 16000
        }
      });

      mediaStreamRef.current = stream;
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });

      // Create audio processor
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        if (recognizerRef.current) {
          try {
            recognizerRef.current.acceptWaveform(event.inputBuffer);
          } catch (error) {
            console.error("Vosk acceptWaveform error:", error);
          }
        }
      };

      // Connect audio pipeline
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      setIsRecording(true);
      console.log("Vosk recording started");
    } catch (err) {
      console.error("Failed to start recording:", err);
      setError("Microphone permission denied");
    }
  };

  const stopRecording = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
    console.log("Vosk recording stopped");
  };

  return {
    isReady,
    isRecording,
    results,
    error,
    startRecording,
    stopRecording,
    clearResults: () => setResults([])
  };
};

export default useVoskSTT;
