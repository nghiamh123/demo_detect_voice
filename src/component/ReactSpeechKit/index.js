import React, { useEffect, useRef, useState } from "react";
import { useSpeechRecognition } from "react-speech-kit";

const ReactSpeechKit = () => {
  const [value, setValue] = useState("");
  const [isListing, setIsListing] = useState(false);

  const [filnalText, setFilnalText] = useState("");

  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result) => {
      console.log("🚀 ~ ReactSpeechKit ~ result:", result);
      setValue(result);
    },
  });

  const wsRef = useRef();

  const wsUrl = `ws://aacb-123-20-193-12.ngrok-free.app/ws/voice/${"123"}`;

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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const message = filnalText + " " + value;
      if (!value) return;
      setFilnalText(message);
      console.log("🚀 ~ timeoutId ~ message:", message);

      const sendMessageTimeout = setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const payload = { message: value };
          wsRef.current.send(JSON.stringify(payload));
        } else {
          console.error("WebSocket chưa kết nối!");
        }
      }, 500); // Gửi tin nhắn sau 500ms

      return () => clearTimeout(sendMessageTimeout);
    }, 2000);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  console.log(filnalText);

  console.log(value);

  const start = () => {
    setIsListing(true);
    listen();
  };

  const onStop = () => {
    setIsListing(false);
    stop();
  };

  const handleListen = () => {
    return isListing ? onStop() : start();
  };

  return (
    <div>
      <textarea
        value={filnalText}
        onChange={(event) => setValue(event.target.value)}
      />
      <button onClick={handleListen}>{isListing ? "Stop" : "Listen"}</button>
      {listening && <div>Go ahead I'm listening</div>}
    </div>
  );
};

export default ReactSpeechKit;
