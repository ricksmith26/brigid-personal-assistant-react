import { useEffect, useRef, useState } from "react";
import useSpeechToText, { ResultType } from "react-hook-speech-to-text";
import useVoskSTT from "./useVoskSTT";
import { ModesEnum } from "../types/Modes";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectMode, setMode } from "../redux/slices/ModeSlice";
import { selectCaller, selectInBoundCall, selectRecipiant, setAnswered } from "../redux/slices/CallsSlice";
import { useSocket } from "../providers/socketProvider";
import { SocketEvent } from "../socket/socketMiddleware";
import { selectUser } from "../redux/slices/AuthSlice";
import { setTriggerPlay } from "../redux/slices/SpotifySlice";

type TTSType = {
    transcript: string
    timestamp: number
}

const useLocalTTS = () => {
    const mode = useAppSelector(selectMode)
    const recipiant = useAppSelector(selectRecipiant)
    const caller = useAppSelector(selectCaller)
    // const isCallingOutbound = useAppSelector(selectInBoundCall)
    const isCallingInbound = useAppSelector(selectInBoundCall)
    const user = useAppSelector(selectUser)
    const dispatch = useAppDispatch()
    const { socket } = useSocket();
    const [isSupported, setIsSupported] = useState(true);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [useVosk, setUseVosk] = useState(false);
    const hasStartedRef = useRef(false);

    // Web Speech API hook
    const {
        error: webSpeechError,
        isRecording: webSpeechRecording,
        results: webSpeechResults,
        startSpeechToText,
        setResults: setWebSpeechResults,
        stopSpeechToText
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false,
        timeout: 10000,
        speechRecognitionProperties: {
            interimResults: true
        }
    });

    // Vosk fallback hook - always call but only use when needed
    const {
        isReady: voskReady,
        isRecording: voskRecording,
        results: voskResults,
        error: voskError,
        startRecording: startVosk,
        clearResults: clearVoskResults
    } = useVoskSTT();

    // Determine which STT to use
    const results = useVosk ? voskResults : webSpeechResults;
    const isRecording = useVosk ? voskRecording : webSpeechRecording;
    const error = useVosk ? voskError : webSpeechError;

    // Check browser compatibility on mount
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Web Speech API not supported, will use Vosk");
            setIsSupported(false);
            setUseVosk(true);
            return;
        }

        // Check for HTTPS or localhost/127.0.0.1
        const isLocalhost = window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '[::1]';
        if (window.location.protocol !== 'https:' && !isLocalhost) {
            console.warn("Web Speech API requires HTTPS, falling back to Vosk");
            setPermissionError("Speech Recognition requires HTTPS");
            setUseVosk(true);
            return;
        }

        // Request microphone permissions
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => {
                    console.log("Microphone permission granted - using Web Speech API");
                    setPermissionError(null);
                })
                .catch((err) => {
                    console.error("Microphone permission denied:", err);
                    setPermissionError("Microphone permission denied");
                });
        }
    }, []);

    // Handle speech recognition start/restart
    useEffect(() => {
        if (useVosk) {
            // Use Vosk
            if (!hasStartedRef.current && voskReady && !voskRecording) {
                console.log("Starting Vosk speech recognition...");
                startVosk();
                hasStartedRef.current = true;
            }
        } else {
            // Use Web Speech API
            if (!isSupported || permissionError) {
                console.log("Speech recognition not available:", { isSupported, permissionError });
                return;
            }

            if (!hasStartedRef.current && !webSpeechRecording) {
                console.log("Starting Web Speech API...");
                startSpeechToText();
                hasStartedRef.current = true;
            }

            // Handle errors and restart if needed
            if (webSpeechError) {
                console.error("Web Speech Error:", webSpeechError);
                setTimeout(() => {
                    if (!webSpeechRecording) {
                        console.log("Restarting Web Speech API after error...");
                        startSpeechToText();
                    }
                }, 1000);
            }
        }
    }, [isSupported, permissionError, webSpeechRecording, webSpeechError, startSpeechToText, useVosk, voskReady, voskRecording, startVosk]);

    // Process speech results (works for both Web Speech and Vosk)
    useEffect(() => {
        console.log(results, '<><><><>><><><>')
        if (!results || results.length === 0) return;

        try {
            const lastResult: string | ResultType = results[results.length - 1]
            console.log(lastResult, '<<<<<<lastResult', results)

            if (lastResult) {
                const transcript = (typeof lastResult === "string" ? lastResult : lastResult.transcript).toLowerCase().trim();

                if (transcript.includes("stop listening")) {
                    console.log("set to idle");
                    dispatch(setMode(ModesEnum.IDLE));
                }
                if (mode === ModesEnum.WEBRTC && (transcript.includes("hang up") || transcript.includes("end call"))) {
                    socket.emit(SocketEvent.HangUp, { toEmail: recipiant.length > 0 ? recipiant : user?.email });
                    socket.emit(SocketEvent.HangUp, { toEmail: caller.length > 0 ? caller : user?.email });
                }
                if (mode === ModesEnum.WEBRTC && transcript.includes("answer") && isCallingInbound) {
                    dispatch(setAnswered())
                }
                if (mode === ModesEnum.SPOTIFY && transcript.includes("play") ) {
                    dispatch(setTriggerPlay(true))
                }
                if (transcript.includes(ModesEnum.WINSTON)) {
                    dispatch(setMode(ModesEnum.WINSTON));
                    console.log("set to winston");
                }
                if (transcript.includes("dashboard")) {
                    dispatch(setMode('dashboard'));
                }
            }

            // Clean up old results to prevent memory issues
            if (results.length > 50) {
                if (useVosk) {
                    clearVoskResults();
                } else {
                    setWebSpeechResults([]);
                }
            }

        } catch (error) {
            console.log("Speech Recognition Processing Error:", error)
        }

    }, [results, mode, recipiant, caller, user, dispatch, socket, isCallingInbound, setWebSpeechResults, stopSpeechToText, useVosk, clearVoskResults]);

    return results
}

export default useLocalTTS;