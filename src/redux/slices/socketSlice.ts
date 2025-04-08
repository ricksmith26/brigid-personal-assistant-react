import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface SocketState {
  isConnected: boolean;
}

const initialState: SocketState = {
  isConnected: false,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    initSocket: (_state, _action) => {
      // Handled by middleware – nothing needed in reducer
    },
    connectionEstablished: (state) => {
      state.isConnected = true;
    },
    connectionLost: (state) => {
      state.isConnected = false;
    },
    register: (_state, _action) => {
      // Also handled in middleware
    },
  },
});

export const {
  initSocket,
  connectionEstablished,
  connectionLost,
  register,
} = socketSlice.actions;

export const selectIsConnected = (state: RootState) => state.socketSlice.isConnected;

export default socketSlice;