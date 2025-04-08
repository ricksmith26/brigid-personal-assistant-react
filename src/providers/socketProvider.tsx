// src/context/SocketContext.tsx
import React, { createContext, useContext } from "react";
import { socketInstance } from "../socket/socketFactory";
import type { SocketInterface } from "../socket/socketFactory";

const SocketContext = createContext<SocketInterface | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SocketContext.Provider value={socketInstance}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};