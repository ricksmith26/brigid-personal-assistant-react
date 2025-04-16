import { useAudioPlayer } from "react-use-audio-player"
import outboundCallSound from '../assets/sounds/phone-outgoing-call-72202.mp3'

export const useOutGoingCallSound = () =>{
    const { togglePlayPause } = useAudioPlayer(outboundCallSound, {
        autoplay: true,
        loop: true
    })
    return togglePlayPause
}