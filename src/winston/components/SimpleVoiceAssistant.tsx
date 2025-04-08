import { AgentState, BarVisualizer, useVoiceAssistant } from "@livekit/components-react";
import { useEffect } from "react";

function SimpleVoiceAssistant({ onStateChange }: { onStateChange: (state: AgentState) => void }) {
  const { state, audioTrack } = useVoiceAssistant();

  useEffect(() => {
    onStateChange(state);
  }, [onStateChange, state]);



  return (
      <BarVisualizer
        state={state}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer"
        options={{ minHeight: 24 }}
      />
  );
}

export default SimpleVoiceAssistant;