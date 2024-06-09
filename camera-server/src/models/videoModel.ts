import fs from "fs";
import { Socket } from "socket.io";

export function startVideoStreaming(socket: Socket) {
  const videoPath =
    "/home/fadymaher/git-fedora/AIoT-Platform-for-smart-cities/camera-server/stream/Object_Tracking.mp4";

  if (fs.existsSync(videoPath)) {
    const videoStream = fs.createReadStream(videoPath);

    videoStream.on("error", (err) => {
      console.error(
        `An error occurred while reading the video stream: ${err.message}`
      );
    });

    videoStream.on("open", () => {
      console.log("Video stream opened successfully.");
    });

    videoStream.on("end", () => {
      console.log("Video stream ended.");
    });

    videoStream.on("data", (chunk) => {
      socket.emit("videoChunk", chunk);
    });
  } else {
    console.error(`The video file does not exist at path: ${videoPath}`);
  }
}
// Handle the streaming request
