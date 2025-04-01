import React, { useEffect, useRef } from "react";

import MC from "./mc.mp4";

export const VirtualMC = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
  
    useEffect(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
  
      
      video.src = MC 
      video.crossOrigin = "anonymous"; 
  
      
      video.oncanplay = async () => {
        try {
          await video.play();
          removeGreenScreen();
        } catch (err) {
          console.error("Lỗi phát video:", err);
        }
      };
  
      function removeGreenScreen() {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let data = frame.data;
  
        for (let i = 0; i < data.length; i += 4) {
          let r = data[i], g = data[i + 1], b = data[i + 2];
  
          
          if (g > 100 && r < 100 && b < 100) {
            data[i + 3] = 0;
          }
        }
  
        ctx.putImageData(frame, 0, 0);
        requestAnimationFrame(removeGreenScreen);
      }
    }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay muted loop style={{ display: "none" }} />
      <canvas ref={canvasRef} width={640} height={380} />
    </div>
  );
};
