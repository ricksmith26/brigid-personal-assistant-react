import { useAudioPlayer } from "react-use-audio-player"
import outboundCallSound from '../assets/sounds/phone-outgoing-call-72202.mp3'

export const useOutGoingCallSound = (outgoingCall: boolean) =>{
    const { togglePlayPause, isPlaying } = useAudioPlayer(outboundCallSound, {
        autoplay: outgoingCall ? true : false,
        loop: true
    })
    console.log(isPlaying, '<<useOutGoingCallSound')
    return togglePlayPause
}