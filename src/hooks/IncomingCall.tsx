import { useAudioPlayer } from "react-use-audio-player"
import incomingCallSound from "../assets/sounds/telephone-ring-129620.mp3"

export const useIncomingCallSound =(incomingCall: boolean) => {
    const { togglePlayPause, isPlaying } = useAudioPlayer(incomingCallSound, {
        autoplay: incomingCall ? true : false,
        loop: true
    })
    console.log(isPlaying, '<<<useIncomingCallSound<<<')
    const toggleIncomingSound = togglePlayPause

    return toggleIncomingSound
}