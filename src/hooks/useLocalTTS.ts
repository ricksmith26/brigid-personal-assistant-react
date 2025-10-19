import { useEffect, useRef, useState } from "react";
import useSpeechToText, { ResultType } from "react-hook-speech-to-text";
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
    const hasStartedRef = useRef(false);

    const {
        error,
        isRecording,
        results,
        startSpeechToText,
        setResults,
        stopSpeechToText
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false,
        timeout: 10000,
        speechRecognitionProperties: {
            interimResults: true
        }
    });

    // Check browser compatibility on mount
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech Recognition API is not supported in this browser");
            setIsSupported(false);
            return;
        }

        // Check for HTTPS or localhost
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            console.warn("Speech Recognition requires HTTPS or localhost");
            setPermissionError("Speech Recognition requires HTTPS");
        }

        // Request microphone permissions
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => {
                    console.log("Microphone permission granted");
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
        if (!isSupported || permissionError) {
            console.log("Speech recognition not available:", { isSupported, permissionError });
            return;
        }

        // Start speech recognition on mount
        if (!hasStartedRef.current && !isRecording) {
            console.log("Starting speech recognition...");
            startSpeechToText();
            hasStartedRef.current = true;
        }

        // Handle errors and restart if needed
        if (error) {
            console.error("Speech Recognition Error:", error);
            // Reset and try to restart after error
            setTimeout(() => {
                if (!isRecording) {
                    console.log("Restarting speech recognition after error...");
                    startSpeechToText();
                }
            }, 1000);
        }
    }, [isSupported, permissionError, isRecording, error, startSpeechToText]);

    // Process speech results
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
                setResults([])
            }

        } catch (error) {
            console.log("Speech Recognition Processing Error:", error)
        }

    }, [results, mode, recipiant, caller, user, dispatch, socket, isCallingInbound, setResults, stopSpeechToText]);

    return results
}

export default useLocalTTS;