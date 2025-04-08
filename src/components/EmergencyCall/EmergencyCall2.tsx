import React, { useEffect, useRef, useState } from 'react';
import {
  UserAgent,
  Registerer,
  Inviter,
  SessionState,
  UserAgentOptions,
  InviterOptions
} from 'sip.js';

const EmergencyCall2: React.FC = () => {
  const [target, setTarget] = useState('100');
  const [registered, setRegistered] = useState(false);
  const userAgentRef = useRef<UserAgent | null>(null);
  const registererRef = useRef<Registerer | null>(null);
  const sessionRef = useRef<Inviter | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const config: UserAgentOptions = {
    uri: UserAgent.makeURI('sip:User3@asterisk.brigid-personal-assistant.com'),
    transportOptions: {
      server: 'wss://asterisk.brigid-personal-assistant.com:4443/ws',
    },
    authorizationUsername: 'User3',
    authorizationPassword: '1234',
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
    console.log(userAgentRef, '<<<<<<userAgentRefS')
    if (!userAgentRef.current || !target) return;

    const targetURI = UserAgent.makeURI(`sip:${target}@asterisk.brigid-personal-assistant.com`);
    if (!targetURI) return alert('Invalid target');

    const inviterOptions: InviterOptions = {
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: true,
        }
      }
    };

    const inviter = new Inviter(userAgentRef.current, targetURI, inviterOptions);
    sessionRef.current = inviter;

    inviter.stateChange.addListener((state) => {
      console.log(`Call state: ${state}`);
      if (state === SessionState.Established) {
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
    if (registered) {
        handleCall()
    }
  }, [registered])

  return (
    <div>
      {/* <h2>📹 Video Call (SIP.js)</h2>
      <input
        type="text"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="Enter SIP extension"
        disabled={!registered}
      />
      <button onClick={handleCall} disabled={!registered || !target}>Call</button>
      <button onClick={hangUp} disabled={!sessionRef.current}>Hang Up</button> */}

      <div>
        <video  className="localVideo" ref={localVideoRef} autoPlay playsInline muted style={{ position: 'fixed', bottom: '36px', right: '36px', width: "300px", height: "200px", objectFit: 'cover', zIndex: 99 }}/>
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: 'cover' }} />
      </div>
    </div>
  );
};

export default EmergencyCall2;