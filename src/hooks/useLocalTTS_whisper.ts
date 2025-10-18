import { useEffect } from "react";
import { ModesEnum } from "../types/Modes";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectMode, setMode } from "../redux/slices/ModeSlice";
import { selectCaller, selectInBoundCall, selectRecipiant, setAnswered } from "../redux/slices/CallsSlice";
import { useSocket } from "../providers/socketProvider";
import { SocketEvent } from "../socket/socketMiddleware";
import { selectUser } from "../redux/slices/AuthSlice";
import { setTriggerPlay } from "../redux/slices/SpotifySlice";
import useWhisperSTT from "./useWhisperSTT";

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
        isListening,
        isLoading,
        error,
        startListening,
        stopListening,
        resetTranscript
    } = useWhisperSTT();

    // Auto-start listening when model is loaded
    useEffect(() => {
        if (!isLoading && !isListening && !error) {
            console.log("🚀 Auto-starting Whisper speech recognition...");
            startListening();
        }
    }, [isLoading, isListening, error]);

    // Log status changes
    useEffect(() => {
        if (isLoading) {
            console.log("⏳ Loading Whisper model...");
        } else if (isListening) {
            console.log("👂 Listening with Whisper...");
        } else if (error) {
            console.error("❌ Error:", error);
        }
    }, [isLoading, isListening, error]);

    // Process speech transcript
    useEffect(() => {
        if (!transcript || transcript.length === 0) return;

        try {
            const processedTranscript = transcript.toLowerCase().trim();
            console.log('✅ Whisper transcript:', processedTranscript);

            if (processedTranscript.includes("stop listening")) {
                console.log("Stopping speech recognition - set to idle");
                dispatch(setMode(ModesEnum.IDLE));
                stopListening();
                resetTranscript();
                return;
            }

            if (mode === ModesEnum.WEBRTC && (processedTranscript.includes("hang up") || processedTranscript.includes("end call"))) {
                socket.emit(SocketEvent.HangUp, { toEmail: recipiant.length > 0 ? recipiant : user?.email });
                socket.emit(SocketEvent.HangUp, { toEmail: caller.length > 0 ? caller : user?.email });
                resetTranscript();
                return;
            }

            if (mode === ModesEnum.WEBRTC && processedTranscript.includes("answer") && isCallingInbound) {
                dispatch(setAnswered());
                resetTranscript();
                return;
            }

            if (mode === ModesEnum.SPOTIFY && processedTranscript.includes("play")) {
                dispatch(setTriggerPlay(true));
                resetTranscript();
                return;
            }

            if (processedTranscript.includes(ModesEnum.WINSTON.toLowerCase())) {
                dispatch(setMode(ModesEnum.WINSTON));
                console.log("set to winston");
                resetTranscript();
                return;
            }

            if (processedTranscript.includes("dashboard")) {
                dispatch(setMode('dashboard'));
                resetTranscript();
                return;
            }

        } catch (error) {
            console.log("Speech Recognition Processing Error:", error);
        }

    }, [transcript, mode, recipiant, caller, user, dispatch, socket, isCallingInbound, resetTranscript, stopListening]);

    return { transcript, isListening, isLoading }
}

export default useLocalTTS;
