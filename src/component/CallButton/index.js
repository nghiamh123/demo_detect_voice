import React, { useState } from "react";
import { useMicVAD } from "@ricky0123/vad-react";
import "./styles.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhoneSlash, faPhone } from '@fortawesome/free-solid-svg-icons';
import { VirtualMC } from "../VirtualMC";
export const CallButton = () => {
  const [audioList, setAudioList] = useState([]);
  const [isCalling, setIsCalling] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const vad = useMicVAD({
    onSpeechEnd: async (audio) => {
      console.log("User stopped talking");
      const wavBlob = convertFloat32ToWav(audio, 16000);
      const audioURL = URL.createObjectURL(wavBlob);
      setAudioList((prev) => [...prev, audioURL]);

    //   const text = await transcribeAudio(wavBlob);
    //   console.log("🚀 ~ onSpeechEnd: ~ text:", text)
    //   if (text) {
    //     setTranscripts((prev) => [...prev, text]);
    //   }
    },
  });

  return (
    <div className="container">
      {/* Hiển thị màn hình gọi đến */}
      {!isCalling ? (
        <div className="call-screen">
          <h1 className="title">John Smith</h1>
          <p className="subtitle">Incoming call</p>
          <div className="avatar-container">
            <img
              src="https://storage.googleapis.com/a1aa/image/y6j_NxPI2LSlQkuRvMoeX_uIfcjceK1tajoH8uIPqOw.jpg"
              alt="Profile picture of John Smith"
              className="avatar"
            />
          </div>
          <div className="button-group">
            <button className="btn btn-red" onClick={() => setIsCalling(false)}>
              <FontAwesomeIcon icon={faPhoneSlash} />
            </button>
            <button className="btn btn-green" onClick={() => setIsCalling(true)}>
              <FontAwesomeIcon icon={faPhone} />
            </button>
          </div>
        </div>
      ) : (
        <div className="call-active">
          <h2 className="title">Call in Progress...</h2>
          <VirtualMC/>
          <div>{vad.userSpeaking && "User is speaking..."}</div>

          {audioList.map((audioURL, index) => (
            <div key={index}>
              <audio controls>
                <source src={audioURL} type="audio/wav" />
              </audio>
              <p className="transcript">{transcripts[index] || "Đang xử lý..."}</p>
            </div>
          ))}
          <button className="btn btn-red" onClick={() => setIsCalling(false)}>
            End Call
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Chuyển đổi Float32Array (PCM) thành tệp WAV
 */
function convertFloat32ToWav(float32Array, sampleRate) {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    int16Array[i] = Math.max(-1, Math.min(1, float32Array[i])) * 0x7FFF;
  }

  const buffer = new ArrayBuffer(44 + int16Array.length * 2);
  const view = new DataView(buffer);

  // Header của WAV
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + int16Array.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, int16Array.length * 2, true);

  for (let i = 0; i < int16Array.length; i++) {
    view.setInt16(44 + i * 2, int16Array[i], true);
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}


async function transcribeAudio(blob) {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.error("Speech Recognition API is not supported");
      return "Speech-to-Text không khả dụng trên trình duyệt này.";
    }
  
    return new Promise((resolve) => {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = "en-US";
  
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        resolve(text);
      };
  
      recognition.onerror = () => {
        resolve("Lỗi nhận diện giọng nói.");
      };
  
      // Chuyển đổi blob thành URL để nhận diện giọng nói
      const audioURL = URL.createObjectURL(blob);
      const audio = new Audio(audioURL);
      audio.onended = () => recognition.stop();
      audio.play();
      recognition.start();
    });
  }