import { Ref } from "react";
import decline from '../IncomingCall/decline.svg'
import './Videos.css'

interface VideosProps {
    areVisible: boolean;
    localVideoRef: Ref<HTMLVideoElement>;
    remoteVideoRef: Ref<HTMLVideoElement>;
    rejectCall: Function;
}

export const Videos = ({ areVisible, localVideoRef, remoteVideoRef }: VideosProps) => {
    return (
        <>
            {<div style={{ visibility: areVisible ? 'visible' : 'hidden' }}>
                <div style={{ position: 'fixed', top: 0, left: 0 }}>
                    <video ref={remoteVideoRef} autoPlay playsInline
                        style={{
                            position: 'fixed',
                            right: 0,
                            bottom: 0,
                            minWidth: '100%',
                            minHeight: '100%',
                            zIndex: -1
                        }}></video>
                </div>
                <div className="localVideo">
                    <video ref={localVideoRef} autoPlay playsInline muted style={{ height: '150px', zIndex: 100 }}></video>
                </div>
            </div>}
        </>

    )
}