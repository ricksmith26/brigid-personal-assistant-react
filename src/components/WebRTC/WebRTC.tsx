import { useEffect, useRef, useState } from "react";
import { IncomingCall } from "./IncomingCall/IncomingCall";
import './WebRTC.css'
import { Videos } from "./Videos/Videos";
import { OutgoingCall } from "./OutgoingCall/OutgoingCall";
import { ModesEnum } from "../../types/Modes";
import { SocketEvent } from "../../socket/socketMiddleware";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setMode } from "../../redux/slices/ModeSlice";
import { selectCaller, selectInBoundCall, selectOutBoundCall, selectRecipiant, setAnswered, setInBoundCall, setOutBoundCall, selectCurrentCallId, setCurrentCallId, setCallStartTime, resetCallState } from "../../redux/slices/CallsSlice";
import { selectContacts } from "../../redux/slices/ContactsSlice";
import useLocalTTS from "../../hooks/useLocalTTS";
import { useSocket } from "../../providers/socketProvider";
import decline from './IncomingCall/decline.svg'

export const WebRTC = () => {
    const dispatch = useAppDispatch();
    const incomingCall = useAppSelector(selectInBoundCall)
    const outgoingCall = useAppSelector(selectOutBoundCall)
    const recipiant = useAppSelector(selectRecipiant)
    const contacts = useAppSelector(selectContacts)
    const caller = useAppSelector(selectCaller)
    const currentCallId = useAppSelector(selectCurrentCallId)
    const [receivedOffer, setReceivedOffer] = useState<RTCSessionDescriptionInit | null>(null);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const [areVisible, setAreVisible] = useState<boolean>(false)

    const { socket } = useSocket();
    useLocalTTS()


    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {

        socket.on(SocketEvent.Offer, async ({ offer, callId }: any) => {
            console.log("Incoming WebRTC Offer", offer, "with callId:", callId);
            setReceivedOffer(offer);
            if (callId) {
                dispatch(setCurrentCallId(callId));
                console.log("Stored callId:", callId);
            }
        });

        socket.on(SocketEvent.Answer, async ({ answer }: any) => {
            console.log("Received Answer from remote peer");
            dispatch(setOutBoundCall(false))
            setAreVisible(true)

            if (peerConnection) {
                // Check peer connection state before setting remote description
                if (peerConnection.signalingState === 'have-local-offer') {
                    console.log("Setting remote description (answer)");
                    try {
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                        console.log("Remote description set successfully");
                    } catch (error) {
                        console.error("Error setting remote description:", error);
                    }
                } else {
                    console.warn("Cannot set remote description, peer connection in wrong state:", peerConnection.signalingState);
                }
            } else {
                console.warn("No peer connection available to set remote description");
            }
        });
        socket.on(SocketEvent.HangUp, async ({ toEmail }: any) => {
            console.log(SocketEvent.HangUp)
            dispatch(setMode(ModesEnum.IDLE))
            dispatch(setAnswered())
            if (recipiant !== toEmail) hangupCall();
        });

        socket.on(SocketEvent.IceCandidate, async ({ candidate }: any) => {
            if (peerConnection && candidate) {
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    console.log("Added ICE candidate");
                } catch (error) {
                    console.error("Error adding ICE candidate:", error);
                }
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
        socket.emit(SocketEvent.CallUser, { toEmail: recipiant, offer });
    };

    const acceptCall = async () => {
        if (!caller || !receivedOffer) return;

        // Prevent multiple calls to acceptCall
        if (peerConnection) {
            console.log("Peer connection already exists, skipping acceptCall");
            return;
        }

        try {
            console.log("Accepting incoming call from:", caller);
            dispatch(setInBoundCall(false));

            // Set call start time when accepting
            dispatch(setCallStartTime(Date.now()));

            // Ensure we have local media stream before creating peer connection
            if (!localStreamRef.current) {
                console.log("Getting user media before accepting call...");
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            }

            const pc = createPeerConnection(caller);
            setPeerConnection(pc);

            // Set Remote Description First
            await pc.setRemoteDescription(new RTCSessionDescription(receivedOffer));

            // Now, Create and Send an Answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            setAreVisible(true)

            // Emit acceptCall event with callId for backend tracking
            if (currentCallId) {
                socket.emit('acceptCall', {
                    from: caller,
                    callId: currentCallId,
                });
                console.log('Sent acceptCall event with callId:', currentCallId);
            }

            socket.emit(SocketEvent.Answer, { to: caller, answer });
        } catch (error) {
            console.error('Error accepting call:', error);
            // Handle error appropriately
        }
    };

    const rejectCall = () => {
        console.log("Rejecting call...");

        // Emit rejectCall event with callId for backend tracking
        if (currentCallId && caller) {
            socket.emit('rejectCall', {
                from: caller,
                callId: currentCallId,
            });
            console.log('Sent rejectCall event with callId:', currentCallId);
        }

        // Cleanup WebRTC resources
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
        dispatch(resetCallState());
        setReceivedOffer(null);
        setAreVisible(false);
        setTimeout(() => {
            dispatch(setMode(ModesEnum.IDLE))
        }, 500)
        console.log("Call rejected.");
    };


    const hangupCall = () => {
        console.log("Hanging up...");

        // Emit hangup event with callId for backend tracking
        const otherParty = caller || recipiant;
        if (currentCallId && otherParty) {
            socket.emit('hangup', {
                toEmail: otherParty,
                callId: currentCallId,
                endReason: 'completed',
            });
            console.log('Sent hangup event with callId:', currentCallId);
        }

        // Cleanup WebRTC connection
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
        dispatch(resetCallState());
        setReceivedOffer(null);
        setAreVisible(false);
        console.log("Call ended.");
    };

    const createPeerConnection = (peerEmail: string): RTCPeerConnection => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        // Add local stream tracks to peer connection
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                console.log('Adding track to peer connection:', track.kind);
                pc.addTrack(track, localStreamRef.current!);
            });
        } else {
            console.warn('No local stream available when creating peer connection');
        }

        // Handle incoming remote stream
        pc.ontrack = (event) => {
            console.log('Received remote track:', event.track.kind);
            if (remoteVideoRef.current && event.streams && event.streams[0]) {
                console.log('Setting remote stream to video element');
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit(SocketEvent.IceCandidate, { to: peerEmail, candidate: event.candidate });
            }
        };

        // Log connection state changes for debugging
        pc.onconnectionstatechange = () => {
            console.log('Connection state:', pc.connectionState);
        };

        pc.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', pc.iceConnectionState);
        };

        setPeerConnection(pc);
        return pc;
    };

    const getFullNameByEmail = (email: string, data: any) => {
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
            if (outgoingCall) startCall()
        }, 1000)
    }, []);

    return (
        <div>
            {outgoingCall
                && <OutgoingCall
                    isOutgoing={outgoingCall}
                    recipiant={getFullNameByEmail(recipiant, contacts)}
                    hangupCall={rejectCall}/>}
            {incomingCall
                && <IncomingCall
                    incomingCall={incomingCall}
                    caller={getFullNameByEmail(caller, contacts)}
                    acceptCall={acceptCall}
                    rejectCall={rejectCall} />}
            <Videos
                areVisible={areVisible}
                localVideoRef={localVideoRef}
                remoteVideoRef={remoteVideoRef}
                rejectCall={rejectCall} />
            {areVisible
                && <img
                    src={decline}
                    style={{ height: '75px', cursor: 'pointer', position: "fixed", left: '36px', top: '50%' }}
                    onClick={() => rejectCall()} />}
        </div >
    );
};