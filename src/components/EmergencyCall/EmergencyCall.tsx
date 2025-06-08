import React, { useEffect, useRef, useState } from 'react';
import {
  UserAgent,
  Registerer,
  Inviter,
  SessionState,
  UserAgentOptions,
  InviterOptions
} from 'sip.js';
import { useAppDispatch } from '../../redux/hooks';
import { setMode } from '../../redux/slices/ModeSlice';
import { ModesEnum } from '../../types/Modes';
import { Tile } from '../Tile/Tile';
import { Videos } from '../WebRTC/Videos/Videos';
import { EmergencyCallCredentialsType } from '../../types/EmergencyCallCredentials';
interface EmergencyCallProps {
  emergencyCallCredentials: EmergencyCallCredentialsType | null;
  agentEmergencyCallCredentials: EmergencyCallCredentialsType | null
}

const EmergencyCall = ({ emergencyCallCredentials, agentEmergencyCallCredentials }: EmergencyCallProps) => {
  const [target, setTarget] = useState(agentEmergencyCallCredentials?.extension);
  const [registered, setRegistered] = useState(false);
  const userAgentRef = useRef<UserAgent | null>(null);
  const registererRef = useRef<Registerer | null>(null);
  const sessionRef = useRef<Inviter | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isAnswered, setIsAnswered] = useState(false)
  const dispatch = useAppDispatch()

  const config: UserAgentOptions = {
    uri: UserAgent.makeURI(emergencyCallCredentials?.sipUri || ''),
    transportOptions: {
      server: emergencyCallCredentials?.websocketUrl,
    },
    authorizationUsername: emergencyCallCredentials?.username,
    authorizationPassword: emergencyCallCredentials?.password,
    sessionDescriptionHandlerFactoryOptions: {
      peerConnectionOptions: {
        rtcConfiguration: {
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        }
      }
    }
  };
  useEffect(() => {
    const userAgent = new UserAgent(config);
    userAgentRef.current = userAgent;

    const registerer = new Registerer(userAgent);
    registererRef.current = registerer;

    userAgent.start()
      .then(() => registerer.register())
      .then(() => setRegistered(true))
      .catch(console.error);

    return () => {
      registerer.unregister().catch(console.error);
      userAgent.stop().catch(console.error);
    };
  }, []);

  const handleCall = async () => {
    if (!userAgentRef.current || !target) return;
    const targetURI = UserAgent.makeURI(
      agentEmergencyCallCredentials
        ? `${agentEmergencyCallCredentials?.sipUri}`.replace(
          agentEmergencyCallCredentials.username, agentEmergencyCallCredentials.extension)
        : '');
    if (!targetURI) return alert('Invalid target');

    const inviterOptions: InviterOptions = {
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: true,
        }
      }
    };
    console.log({ inviter: emergencyCallCredentials, agent: targetURI, agentEmergencyCallCredentials }, "+++++++++++++")
    const inviter = new Inviter(userAgentRef.current, targetURI, inviterOptions);
    sessionRef.current = inviter;

    inviter.stateChange.addListener((state) => {
      console.log(`Call state: ${state}`);
      if (state === SessionState.Established) {
        setIsAnswered(true)
        const sessionDescriptionHandler: any = inviter.sessionDescriptionHandler;
        if (sessionDescriptionHandler) {
          const handler: any = inviter.sessionDescriptionHandler;
          const pc: RTCPeerConnection = handler.peerConnection;
          pc.addEventListener('track', (event) => {
            console.log('📡 Got remote track:', event.track.kind);
            remoteStream.addTrack(event.track);
          });
          // Setup local video
          const localStream = sessionDescriptionHandler.localMediaStream;
          if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
          }
          const remoteStream = sessionDescriptionHandler.remoteMediaStream;
          if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        }
      }
      if (state === SessionState.Terminated) {
        sessionRef.current = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        dispatch(setMode(ModesEnum.IDLE))
      }
    });

    try {
      await inviter.invite();
      console.log('📹 Video call started');
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };

  const hangUp = async () => {
    if (sessionRef.current) {
      await sessionRef.current.bye();
    }
  };

  useEffect(() => {
    if (!!agentEmergencyCallCredentials) {
      console.log(agentEmergencyCallCredentials, '<<<<agentEmergencyCallCredentialsagentEmergencyCallCredentials')
      handleCall()
    }
  }, [agentEmergencyCallCredentials])

  return (
    <div>
      {!isAnswered &&
        <div style={{ position: 'fixed', height: '100%', width: '100%', top: 0, left: 0, backgroundColor: 'red', zIndex: 200, padding: '36px' }}>
          <Tile colour="white" backgroundColor='red' title='Emergency Call' style={{ height: '100%', width: '100%' }}>
            <div style={{ color: 'white', height: "100%", width: '100%', alignContent: 'center', alignItems: 'center', textAlign: 'center', fontSize: '46px', "fontWeight": 900 }}>
              <div>Calling</div>
              <div>Response Center</div>
            </div>
          </Tile>
        </div>}
      <Videos localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} areVisible={true} rejectCall={() => { }} />
    </div>
  );
};

export default EmergencyCall;