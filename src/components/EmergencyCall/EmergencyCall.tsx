import React, { useEffect,  useState } from "react";
import { UserAgent, Web } from "sip.js";
import { Tile } from "../Tile/Tile";

interface EmergencyCallProps {
    username: string;
    password: string;
    domain: string;
    targetUser: string; // User to call, e.g., "User2"
}

const EmergencyCall: React.FC<EmergencyCallProps> = ({
    username,
    password,
    domain,
    targetUser,
}) => {
    const [simpleUser, setSimpleUser] = useState<Web.SimpleUser | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isCalling, setIsCalling] = useState<boolean>(false);
    const [registered, setRegistered] = useState(false)
    const [isAnswered, setIsAnswered] = useState(false)
    


    const webSocketServer = `wss://${domain}:4443/ws`;

    // Convert the SIP URI to a URI object
    const uri = UserAgent.makeURI(`sip:${username}@${domain}`) as any;
    if (!uri) {
        console.error("Failed to create URI from domain:", domain);
        return null;
    }

    const delegate: Web.SimpleUserDelegate = {
        onCallReceived: async () => {
            if (simpleUser) {
                await simpleUser.answer();
                setIsCalling(true);
            }
        },
        onCallHangup: () => setIsCalling(false),
        onCallAnswered: () => {
            setIsAnswered(true);
            setIsCalling(false);
        },
        onRegistered: () => setRegistered(true),
    };

    const config: Web.SimpleUserOptions = {
        aor: uri,
        userAgentOptions: {
            uri: uri,
            authorizationUsername: username,
            authorizationPassword: password,
            transportOptions: {
                server: webSocketServer,
            },
        },
        media: {
            local: {
                video: document.getElementById("vidLocal") as any,
            },
            remote: {
                video: document.getElementById("vidRemote") as any,
                audio: document.getElementById("vidRemote") as any,
            },
            constraints: {
                audio: true,
                video: true
            },
        },
        delegate: delegate,
    };

    // Connect to the SIP server
    const connect = async () => {
        if (simpleUser) {
            await disconnect();
        }

        const user = new Web.SimpleUser(webSocketServer, config);
        user.delegate = delegate;

        try {
            await user.connect();
            await user.register();
            setSimpleUser(user);
            setIsConnected(true);
        } catch (error) {
            console.error("Failed to connect or register:", error);
            // setErrorMessage("Failed to connect or register: " + error);
        }
    };

    // Disconnect from the SIP server
    const disconnect = async () => {
        if (simpleUser) {
            await simpleUser.disconnect();
            setSimpleUser(null);
            setIsConnected(false);
            setIsCalling(false);
        }
    };

    // Start a video call
    const startCall = async () => {
        if (!simpleUser) return;

        const targetUri = `sip:${targetUser}@${domain}`;
        if (!targetUri) {
            console.error("Failed to create URI from targetUser:", targetUser);
            return;
        }

        try {
            await simpleUser.call(targetUri);
            setIsCalling(true);
        } catch (error) {
            console.error("Error starting call:", error);
            // setErrorMessage("Error starting call: " + error);
        }
    };

    // End the current call
    const endCall = async () => {
        if (simpleUser && isCalling) {
            await simpleUser.hangup();
            setIsCalling(false);
        }
    };

      useEffect(() => {
        setTimeout(() => {
            connect()
        }, 5000)
 
      }, [])

    useEffect(() => {
        console.log(registered && simpleUser?.isConnected(), '<<<<<<<<<<<<registered<<<', document.getElementById("vidRemote"))
        
        // if (registered && simpleUser?.isConnected() && document.getElementById("vidRemote")) {
        //     setTimeout(() => {
        //         startCall()
        //     }, 4000)
        // }
    }, [registered])

    return (
        <>
            {/* {!isAnswered &&
                <div style={{ position: 'fixed', height: '100%', width: '100%', top: 0, left: 0, backgroundColor: 'red', zIndex: 200, padding: '36px' }}>
                    <Tile colour="white" backgroundColor='red' title='Emergency Call' style={{height: '100%', width: '100%'}}>
                        <div style={{color: 'white', height: "100%", width: '100%', alignContent: 'center', alignItems: 'center', textAlign: 'center', fontSize: '46px', "fontWeight": 900}}>
                            <div>Calling</div>
                            <div>Response Center</div>
                        </div>
                    </Tile>
                </div>} */}

            {isConnected ? <h1>Connected</h1> : <h1>Not connected</h1>}
            <h4 style={{ position: 'fixed', top: 0, right: 0, zIndex: 100 }}>{registered}</h4>
            <button onClick={connect} disabled={isConnected} style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }} id='connect'>
                Connect
            </button>
            <button onClick={disconnect} disabled={!isConnected} style={{ position: 'fixed', top: 60, left: 0, zIndex: 100 }}>
                Disconnect
            </button>
            <div>
                <button onClick={startCall} disabled={!isConnected || isCalling} style={{ position: 'fixed', top: 120, left: 0, zIndex: 100 }} id='call'>
                    Start Call
                </button>
                <button onClick={endCall} disabled={!isCalling} style={{ position: 'fixed', top: 180, left: 0, zIndex: 100 }}>
                    End Call
                </button>
            </div>

            <video
                id="vidLocal"
                className="localVideo"
                autoPlay
                muted
                style={{ position: 'fixed', bottom: '36px', right: '36px', width: "300px", height: "200px", objectFit: 'cover', zIndex: 99 }}
            />
            <video
                id="vidRemote"
                //   className="localVideo"
                autoPlay
                style={{ width: "100%", height: "100%", objectFit: 'cover' }}
            />

            {/* <div style={{width: '100%'}}>{errorMessage}</div> */}
        </>
    );
};

export default EmergencyCall;
