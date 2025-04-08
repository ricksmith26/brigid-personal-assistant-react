import { io, Socket } from "socket.io-client";
 
export interface SocketInterface {
  socket: Socket;
}
 
export class SocketConnection implements SocketInterface {
  public socket: Socket;
  public socketEndpoint = process.env.API_URL;
  // The constructor will initialize the Socket Connection
  constructor() {
    this.socket = io(this.socketEndpoint);
  }
}
 
let socketConnection: SocketConnection | undefined;
 
// The SocketFactory is responsible for creating and returning a single instance of the SocketConnection class
// Implementing the singleton pattern
class SocketFactory {
  public static create(): SocketConnection {
    if (!socketConnection) {
      socketConnection = new SocketConnection();
    }
    return socketConnection;
  }
}

export const socketInstance = SocketFactory.create();
 
export default SocketFactory;