import {
  LiveKitRoom,
  RoomAudioRenderer,
  AgentState,
  useChat
} from "@livekit/components-react";
import { useCallback, useEffect, useState } from "react";
import { MediaDeviceFailure } from "livekit-client";
import { NoAgentNotification } from "../components/NoAgentNotification";

import "@livekit/components-styles";
import SimpleVoiceAssistant from "./components/SimpleVoiceAssistant";
import { ModesEnum } from "../types/Modes";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { selectNewMessage, setNewMessage } from "../redux/slices/LivekitMessages";
import LiveKitInitMessage from "./components/livekitInitMessage";

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

export default function Winston({ mode, email }: any) {
  const newMessage = useAppSelector(selectNewMessage)
  const [connectionDetails, updateConnectionDetails] = useState<
    ConnectionDetails | undefined
  >(undefined);
  const [agentState, setAgentState] = useState<AgentState>("disconnected");

  const onConnectButtonClicked = useCallback(async () => {
    try {
      const url = new URL(
        import.meta.env.VITE_NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? "/api/connection-details",
        window.location.origin
      );
      const connectionUrl = newMessage.length > 0 ? `${url}/${email}/${newMessage}` : `${url}/${email}`
      const response = await fetch(connectionUrl);
      if (!response.ok) throw new Error("Failed to fetch connection details");

      const connectionDetailsData = await response.json();
      updateConnectionDetails(connectionDetailsData);
    } catch (error) {
      console.error("Error fetching connection details:", error);
      alert("Failed to connect to LiveKit. Please try again.");
    }
  }, []);


  useEffect(() => {
    if (mode === ModesEnum.WINSTON) {
      onConnectButtonClicked()
    } else {

    }
  }, [mode])

  return (
      <LiveKitRoom
        token={connectionDetails?.participantToken}
        serverUrl={connectionDetails?.serverUrl}
        connect={!!connectionDetails}
        audio={true}
        video={{ facingMode: "user" }}
        onMediaDeviceFailure={onDeviceFailure}
        onDisconnected={() => updateConnectionDetails(undefined)}
        // className="grid grid-rows-[2fr_1fr] items-center"
      >
        <LiveKitInitMessage/>
        <SimpleVoiceAssistant onStateChange={setAgentState} />
        {/* <ControlBar
        onConnectButtonClicked={onConnectButtonClicked}
        agentState={agentState}
      /> */}
        <RoomAudioRenderer />
        <NoAgentNotification state={agentState} />
      </LiveKitRoom>
  );
}

function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please ensure you grant the necessary permissions in your browser and reload the page."
  );
}