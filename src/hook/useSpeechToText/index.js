import { useEffect, useRef, useState } from "react";

const useSpeechToText = (options = {}) => {
  const [transcripts, setTranscripts] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.error("Speech Recognition API is not supported");
      return;
    }

    recognitionRef.current = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    const recognition = recognitionRef.current;
    recognition.interimResults = options.interimResults || true;
    recognition.lang = options.lang || "vi-VN";
    recognition.continuous = options.continuous || false;

    if ("webkitSpeechGrammarList" in window) {
      const grammar =
        '#JSGF V1.0; grammar punctuation; public <punc> = "." | "!" | "?" | "," | ";" | "-" | "/" | "(" | ")" | "[" | "]" | "{" | "}" | "\\"" | """ | "@" | "#" | "$" | "%" | "^" | "&" | "*" | "+" | "~" | "_" | "|" | "<" | ">" | " " | "\\t" | "\\n";';
      const speechRecognitionList = new window.webkitSpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;
    }

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscripts(text);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error occurred", event);
    };

    // recognition.onend = () => {
    //   setIsListening(false);
    //   setTranscripts("");
    // };

    recognition.onspeechstart = () => {
      setIsSpeaking(true);
    };

    recognition.onspeechend = () => {
      setIsSpeaking(false);
      console.log("User stopped speaking");
    };

    return () => {
      recognition.stop();
    };
  }, [options.continuous, options.interimResults, options.lang]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  return {
    transcripts,
    isListening,
    startListening,
    stopListening,
    isSpeaking,
  };
};

export default useSpeechToText;
