import { Middleware } from "redux";
import {
  connectionEstablished,
  connectionLost,
  initSocket,
} from "../redux/slices/socketSlice";
import SocketFactory from "../socket/socketFactory";
import type { SocketInterface } from "../socket/socketFactory";
import { ModesEnum } from "../types/Modes";
import { setMode } from "../redux/slices/ModeSlice";

export enum SocketEvent {
  Connect = "connect",
  Disconnect = "disconnect",
  Error = "error",
  IncomingCall = "incomingCall",
  Offer = "offer",
  CallUser = "callUser",
  Answer = "answer",
  HangUp = "hangup",
  IceCandidate = "iceCandidate",
  Message = "message",
  EmergencyCall = 'emergencyCall',
  EventNotifcation = 'eventNotification',
  Register = "register",
  ModeChange = "modeChange",
  Spotify = "spotify"
}

let socket: SocketInterface | null = null;

const socketMiddleware: Middleware = (store) => (next) => (action) => {
    // console.log(store, "<<<store")
  if (initSocket.match(action)) {
    if (!socket && typeof window !== "undefined") {
      // 1. Create socket
      socket = SocketFactory.create();

      // 2. Emit register event if payload exists
      if (action.payload) {
        socket.socket.emit(SocketEvent.Register, action.payload);
        console.log(SocketEvent.Register, action.payload)
      }

      // 3. Attach socket listeners
      socket.socket.on(SocketEvent.Connect, () => {
        console.log(SocketEvent.Connect, '<<<<SocketEvent.Connect')
        store.dispatch(connectionEstablished());
      });

      socket.socket.on(SocketEvent.Error, (message) => {
        console.error("Socket error:", message);
      });

      socket.socket.on(SocketEvent.Disconnect, () => {
        store.dispatch(connectionLost());
      });

      socket.socket.on(SocketEvent.Register, () => {
        console.log("Socket registered");
      });

      // socket.socket.on(SocketEvent.ModeChange, (mode) => {
      //   console.log("MODE CHANGE", mode)
      //   store.dispatch(setMode(mode))
      // })

      

      socket.socket.on(SocketEvent.Message, (message: any) => {
        console.log('HITTIN FACCTORY<<<<<<<<*************')
        if (message.type === ModesEnum.WEBRTC) {
            console.log('HITTIN FACCTOIRY<<<<<<<<,')
          if (message.toEmail) {
            // store.dispatch(setOutBoundCall(true));
          } else {
            // store.dispatch(setInBoundCall());
          }
          store.dispatch(setMode(ModesEnum.WEBRTC));
        }
      });
    }
  }

  next(action);
};

export default socketMiddleware;