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
            <div className={`videosContainer ${areVisible ? 'visible' : ''}`}>
                <div className="remoteVideoContainer">
                    <video ref={remoteVideoRef} autoPlay playsInline className="remoteVideo"></video>
                </div>
                <div className="localVideo">
                    <video ref={localVideoRef} autoPlay playsInline muted></video>
                </div>
            </div>
        </>
    )
}