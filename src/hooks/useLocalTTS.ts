import { useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { ModesEnum } from "../types/Modes";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectMode, setMode } from "../redux/slices/ModeSlice";
import { selectCaller, selectInBoundCall, selectRecipiant, setAnswered } from "../redux/slices/CallsSlice";
import { useSocket } from "../providers/socketProvider";
import { SocketEvent } from "../socket/socketMiddleware";
import { selectUser } from "../redux/slices/AuthSlice";
import { setTriggerPlay } from "../redux/slices/SpotifySlice";

const useLocalTTS = () => {
    const mode = useAppSelector(selectMode)
    const recipiant = useAppSelector(selectRecipiant)
    const caller = useAppSelector(selectCaller)
    const isCallingInbound = useAppSelector(selectInBoundCall)
    const user = useAppSelector(selectUser)
    const dispatch = useAppDispatch()
    const { socket } = useSocket();

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // Check browser compatibility on mount
    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            console.error("Speech Recognition API is not supported in this browser");
            return;
        }

        // Check for HTTPS or localhost
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            console.warn("Speech Recognition requires HTTPS or localhost");
        }

        console.log("Speech recognition supported!");
        console.log("Browser:", navigator.userAgent);
        console.log("Language:", navigator.language);
    }, [browserSupportsSpeechRecognition]);

    // Start speech recognition on mount and keep it running
    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            return;
        }

        const startListening = async () => {
            try {
                console.log("Starting continuous speech recognition...");
                await SpeechRecognition.startListening({
                    continuous: true,
                    language: navigator.language || 'en-US'
                });
                console.log("✓ Speech recognition started successfully");
            } catch (err) {
                console.error("Error starting speech recognition:", err);
            }
        };

        // Start listening on mount
        if (!listening) {
            startListening();
        }

        // Log listening status
        console.log("Listening status:", listening);

        // Cleanup function - stop listening when component unmounts
        return () => {
            SpeechRecognition.stopListening();
        };
    }, [browserSupportsSpeechRecognition, listening]);

    // Handle speech recognition stopping unexpectedly - auto-restart
    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            return;
        }

        // If we should be listening but we're not, restart
        const checkAndRestart = setTimeout(() => {
            if (!listening) {
                console.warn("⚠ Speech recognition stopped unexpectedly, restarting...");
                SpeechRecognition.startListening({
                    continuous: true,
                    language: navigator.language || 'en-US'
                });
            }
        }, 1000);

        return () => clearTimeout(checkAndRestart);
    }, [listening, browserSupportsSpeechRecognition]);

    // Process speech transcript
    useEffect(() => {
        if (!transcript || transcript.length === 0) return;

        try {
            const processedTranscript = transcript.toLowerCase().trim();
            console.log('Transcript:', processedTranscript);

            if (processedTranscript.includes("stop listening")) {
                console.log("Stopping speech recognition - set to idle");
                dispatch(setMode(ModesEnum.IDLE));
                SpeechRecognition.stopListening();
                resetTranscript();
            }

            if (mode === ModesEnum.WEBRTC && (processedTranscript.includes("hang up") || processedTranscript.includes("end call"))) {
                socket.emit(SocketEvent.HangUp, { toEmail: recipiant.length > 0 ? recipiant : user?.email });
                socket.emit(SocketEvent.HangUp, { toEmail: caller.length > 0 ? caller : user?.email });
                resetTranscript();
            }

            if (mode === ModesEnum.WEBRTC && processedTranscript.includes("answer") && isCallingInbound) {
                dispatch(setAnswered());
                resetTranscript();
            }

            if (mode === ModesEnum.SPOTIFY && processedTranscript.includes("play")) {
                dispatch(setTriggerPlay(true));
                resetTranscript();
            }

            if (processedTranscript.includes(ModesEnum.WINSTON.toLowerCase())) {
                dispatch(setMode(ModesEnum.WINSTON));
                console.log("set to winston");
                resetTranscript();
            }

            if (processedTranscript.includes("dashboard")) {
                dispatch(setMode('dashboard'));
                resetTranscript();
            }

        } catch (error) {
            console.log("Speech Recognition Processing Error:", error);
        }

    }, [transcript, mode, recipiant, caller, user, dispatch, socket, isCallingInbound, resetTranscript]);

    return { transcript, listening }
}

export default useLocalTTS;
