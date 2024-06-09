import { Request, Response } from "express";
import { Socket } from "socket.io";
// import onvif from 'node-onvif';

// send camera video streaming to another server like localhost:8000
import { startVideoStreaming } from "../models/videoModel";

export function handleConnection(socket: Socket) {
  console.log("Client connected");
  startVideoStreaming(socket);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
}

export default handleConnection;

