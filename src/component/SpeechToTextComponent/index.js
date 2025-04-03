import React, { useEffect, useRef, useState } from "react";
import useSpeechToText from "../../hook/useSpeechToText";

const SpeechToTextComponent = () => {
  const [textInput, setTextInput] = useState("");
  const {
    transcripts,
    isListening,
    startListening,
    stopListening,
    isSpeaking,
  } = useSpeechToText({ continuous: true });
  console.log("🚀 ~ SpeechToTextComponent ~ isSpeaking:", isSpeaking);

  const wsRef = useRef();

  const wsUrl = `ws://13ef-123-20-193-12.ngrok-free.app/ws/voice/${"123"}`;

  useEffect(() => {
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connection opened");
    };

    socket.onmessage = async (event) => {
      if (event.data) {
        const data = JSON.parse(event.data);
        console.log("🚀 ~ socket.onmessage= ~ data:", data);
        const content = data.message;
        console.log("🚀 ~ useEffect ~ data:", content);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    wsRef.current = socket;

    return () => {
      socket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl]);

  const startStopListening = () => {
    if (isListening) {
      stopVoiceInput();
    } else {
      startListening();
    }
  };

  const stopVoiceInput = () => {
    const finalTranscript = transcripts.length
      ? (textInput.length ? textInput + " " : "") + transcripts
      : textInput;
    setTextInput(finalTranscript);
    stopListening();

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = { message: finalTranscript };
      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.error("WebSocket chưa kết nối!");
    }
  };

  return (
    <div>
      <div>
        <textarea
          disabled={!isListening}
          value={
            isListening
              ? textInput + (transcripts.length ? " " + transcripts : "")
              : textInput
          }
          onChange={(e) => setTextInput(e.target.value)}
        />
        <button onClick={startStopListening}>
          {isListening ? "Stop" : "Start"}
        </button>
      </div>
    </div>
  );
};

export default SpeechToTextComponent;
