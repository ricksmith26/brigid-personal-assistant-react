import { useChat, useVoiceAssistant } from "@livekit/components-react";
import { useEffect, useMemo, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { selectNewMessage, setNewMessage } from "../../redux/slices/LivekitMessages";

const LiveKitInitMessage = () => {
    const { state, audioTrack } = useVoiceAssistant();
    const newMessage = useAppSelector(selectNewMessage)
    const dispatch = useAppDispatch()
    const chatOptions = useMemo(() => ({ channelTopic: 'agent' }), []);
    const { send, chatMessages } = useChat(chatOptions);
    const hasSentRef = useRef(false);
    useEffect(() => {
        hasSentRef.current = true;
        console.log(newMessage.length > 0 , 
            ['listening', 'initializing'].includes(state) )
        if (
            newMessage.length > 0 &&
            ['listening', 'initializing'].includes(state) 
          ) {
        setTimeout(() => {
            console.log(`Sending: ${newMessage}`);
            send(newMessage);
            dispatch(setNewMessage(''));
        }, 1000);}
    }, [state]);

    useEffect(() => {
        chatMessages.forEach((message) => console.log(message.message, '<<chatMessages.forEach'))
    }, [chatMessages])

    return <><button onClick={() => send('What is the time?')}>Test</button></>
}

export default LiveKitInitMessage;