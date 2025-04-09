import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

interface LivekitMessagesState {
  newMessage: string
}

const initialState: LivekitMessagesState = {
    newMessage: '',
}

export const LivekitMessagesSlice = createSlice({
  name: 'LivekitMessages',
  initialState,
  reducers: {
    setNewMessage: (state, action) => {
      state.newMessage = action.payload
    }
   
  },
})

export const { setNewMessage } = LivekitMessagesSlice.actions

export const selectNewMessage = (state: RootState) => state.LivekitMessagesSlice.newMessage

export default LivekitMessagesSlice.reducer