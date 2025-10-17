import { useEffect } from "react";
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
    const {
        // error,
        isRecording,
        results,
        startSpeechToText,
        setResults
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
    });
    useEffect(() => {
        try {
            if (!isRecording) {
                startSpeechToText();
            }
            const lastResult: string | ResultType = results[results.length - 1]
            console.log(lastResult, '<<<<<<lastResult', results)

            if (lastResult) {
                const transcript = (typeof lastResult === "string" ? lastResult : lastResult.transcript).toLowerCase().trim();

                if (transcript.includes("stop listening")) {
                    console.log("set to idle");
                    dispatch(setMode(ModesEnum.IDLE));
                }
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
            else if (results.length > 50) {
                setResults([])
            }

        } catch (error) {
            console.log("Speech Recognition Error:", error)
        }

    }, [results, isRecording]);
    return results
}

export default useLocalTTS;