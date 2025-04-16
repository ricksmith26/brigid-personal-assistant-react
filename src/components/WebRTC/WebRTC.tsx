import { useEffect, useRef, useState } from "react";
import { IncomingCall } from "./IncomingCall/IncomingCall";
import './WebRTC.css'
import { Videos } from "./Videos/Videos";
import { OutgoingCall } from "./OutgoingCall/OutgoingCall";
import { ModesEnum } from "../../types/Modes";
import { SocketEvent } from "../../socket/socketMiddleware";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setMode } from "../../redux/slices/ModeSlice";
import { selectAnswered, selectCaller, selectInBoundCall, selectOutBoundCall, selectRecipiant, setAnswered, setCaller, setInBoundCall, setOutBoundCall } from "../../redux/slices/CallsSlice";
import { selectContacts } from "../../redux/slices/ContactsSlice";
import useLocalTTS from "../../hooks/useLocalTTS";
import { useIncomingCallSound } from "../../hooks/IncomingCall";
import { useSocket } from "../../providers/socketProvider";
import { useOutGoingCallSound } from "../../hooks/outgoingCall";
import decline from './IncomingCall/decline.svg'

export const WebRTC = () => {
    const dispatch = useAppDispatch();
    const incomingCall = useAppSelector(selectInBoundCall)
    const outgoingCall = useAppSelector(selectOutBoundCall)
    const recipiant = useAppSelector(selectRecipiant)
    const contacts = useAppSelector(selectContacts)
    const caller = useAppSelector(selectCaller)
    const answered = useAppSelector(selectAnswered)
    const [receivedOffer, setReceivedOffer] = useState<RTCSessionDescriptionInit | null>(null);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const [areVisible, setAreVisible] = useState<boolean>(false)
    const toggelOutGoingSound = useOutGoingCallSound(outgoingCall)
    const toggleIncomingSound = useIncomingCallSound(incomingCall)

    const { socket } = useSocket();
    useLocalTTS()


    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {

        socket.on(SocketEvent.Offer, async ({ offer }: any) => {
            console.log("Incoming WebRTC Offer", offer);
            setReceivedOffer(offer);
        });

        socket.on(SocketEvent.Answer, async ({ answer }: any) => {
            console.log("Received Answer");
            toggelOutGoingSound()
            dispatch(setOutBoundCall(false))
            setAreVisible(true)
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });
        socket.on(SocketEvent.HangUp, async ({ toEmail }: any) => {
            console.log(SocketEvent.HangUp, "<<<<<SocketEvent.HangUp")
            dispatch(setMode(ModesEnum.IDLE))
            toggelOutGoingSound()
            toggleIncomingSound()
            dispatch(setAnswered())
            if (recipiant !== toEmail) hangupCall();
        });

        socket.on(SocketEvent.IceCandidate, ({ candidate }: any) => {
            if (peerConnection) {
                peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });


        return () => {
            socket.off(SocketEvent.IncomingCall);
            socket.off(SocketEvent.Offer);
            socket.off(SocketEvent.Answer);
            socket.off(SocketEvent.HangUp);
            socket.off(SocketEvent.IceCandidate);
        };
    }, [socket, peerConnection]);


    const startCall = async () => {
        if (!recipiant) return;
        dispatch(setOutBoundCall(true))
        const pc = createPeerConnection(recipiant);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log({ toEmail: recipiant, offer }, '<<<startCall<<')
        socket.emit(SocketEvent.CallUser, { toEmail: recipiant, offer });
    };

    const acceptCall = async () => {
        console.log({ caller, receivedOffer }, 'before toggle off<<<<<<')
        if (!caller || !receivedOffer) return;

        dispatch(setInBoundCall(false));
        toggleIncomingSound()

        const pc = createPeerConnection(caller);
        setPeerConnection(pc);

        // * Set Remote Description First**
        await pc.setRemoteDescription(new RTCSessionDescription(receivedOffer));

        // **Now, Create and Send an Answer**
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        setAreVisible(true)
        socket.emit(SocketEvent.Answer, { to: caller, answer });
    };

    const rejectCall = () => {
        console.log("Hanging up...");

        socket.emit(SocketEvent.HangUp, { toEmail: recipiant });
        socket.emit(SocketEvent.HangUp, { toEmail: caller });

        if (peerConnection) {
            peerConnection.close();
            setPeerConnection(null);
        }

        // Stop all local media tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        // Reset state

        dispatch(setInBoundCall(false));
        dispatch(setOutBoundCall(false))
        setCaller(null);
        setReceivedOffer(null);
        setAreVisible(false);
        setTimeout(() => {
            dispatch(setMode(ModesEnum.IDLE))
        }, 500)
        console.log("Call ended.");
    };


    const hangupCall = () => {
        console.log("Hanging up...");

        // Notify the other peer about the hangup
        if (caller) {
            socket.emit(SocketEvent.HangUp, { toEmail: caller });
        }

        // Close the peer connection
        if (peerConnection) {
            peerConnection.close();
            setPeerConnection(null);
        }

        // Stop all local media tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        // Reset state
        dispatch(setOutBoundCall(false))
        dispatch(setInBoundCall(false));
        // /toggelOutGoingSound
        setCaller(null);
        setReceivedOffer(null);
        setAreVisible(false);

        console.log("Call ended.");
    };

    const createPeerConnection = (peerEmail: string): RTCPeerConnection => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        localStreamRef.current?.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!));
        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit(SocketEvent.IceCandidate, { to: peerEmail, candidate: event.candidate });
            }
        };
        setPeerConnection(pc);
        return pc;
    };

    const getFullNameByEmail = (email: string, data: any) => {
        console.log(data, email, contacts, '<<getFullNameByEmail', incomingCall, outgoingCall)
        const person = data.find((p: any) => p.Email === email);
        if (!person) return 'Unknown Caller';
        const { Firstname, Lastname } = person;
        return `${Firstname} ${Lastname}`;
    };

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
        });
        setTimeout(() => {
            console.log({ outgoingCall, incomingCall })
            if (outgoingCall) startCall()
        }, 1000)
    }, []);

    useEffect(() => {
        if (answered) {
            acceptCall()
        }
    }, [answered])

    useEffect(() => {
        console.log({ caller, contacts }, '<<{aller, contacts<<<<<<')
    }, [incomingCall])

    return (
        <div>
            {outgoingCall && <OutgoingCall isOutgoing={outgoingCall} hangupCall={rejectCall} />}
            {incomingCall && <IncomingCall incomingCall={incomingCall} caller={getFullNameByEmail(caller, contacts)} acceptCall={acceptCall} rejectCall={rejectCall} />}
            <Videos areVisible={areVisible} localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} rejectCall={rejectCall} />
            {areVisible && <img src={decline} style={{ height: '75px', cursor: 'pointer', position: "fixed", left: '36px', top: '50%' }} onClick={() => rejectCall()} />}
        </div >
    );
};