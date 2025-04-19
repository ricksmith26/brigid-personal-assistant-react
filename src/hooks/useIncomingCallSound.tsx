import { useAudioPlayer } from "react-use-audio-player"
import incomingCallSound from "../assets/sounds/telephone-ring-129620.mp3"

export const useIncomingCallSound =() => {
    const { togglePlayPause } = useAudioPlayer(incomingCallSound, {
        autoplay: true,
        loop: true
    })
    const toggleIncomingSound = togglePlayPause

    return toggleIncomingSound
}