import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../store'

interface CallsState {
  isInboundCall: boolean,
  isOutboundCall: boolean,
  answered: boolean,
  recipiant: string,
  caller: string,
  receivedOffer: string,
  currentCallId: string | null,
  callStartTime: number | null
}

const initialState: CallsState = {
    isInboundCall: false,
    isOutboundCall: false,
    answered: false,
    recipiant: '',
    caller: '',
    receivedOffer: '',
    currentCallId: null,
    callStartTime: null
}

export const callsSlice = createSlice({
  name: 'calls',
  initialState,
  reducers: {
    setInBoundCall: (state, action) => {
      state.isInboundCall = action.payload
    },
    setOutBoundCall: (state, action) => {
      state.isOutboundCall = action.payload
      console.log(state.isOutboundCall, '<<<<state.isOutboundCall')
    },
    setAnswered: (state) => {
      state.answered = !state.answered
    },
    setRecipiant: (state, action) => {
      state.recipiant = action.payload
    },
    setCaller: (state, action) => {
      state.caller = action.payload
    },
    setReceivedOffer: (state, action) =>{
      state.receivedOffer = action.payload
    },
    setCurrentCallId: (state, action) => {
      state.currentCallId = action.payload
    },
    setCallStartTime: (state, action) => {
      state.callStartTime = action.payload
    },
    resetCallState: (state) => {
      state.isInboundCall = false
      state.isOutboundCall = false
      state.answered = false
      state.recipiant = ''
      state.caller = ''
      state.receivedOffer = ''
      state.currentCallId = null
      state.callStartTime = null
    }

  },
})

export const { setInBoundCall, setOutBoundCall, setAnswered, setRecipiant, setCaller, setReceivedOffer, setCurrentCallId, setCallStartTime, resetCallState } = callsSlice.actions

export const selectInBoundCall = (state: RootState) => state.callsSlice.isInboundCall
export const selectOutBoundCall = (state: RootState) => state.callsSlice.isOutboundCall
export const selectAnswered = (state: RootState) => state.callsSlice.answered
export const selectRecipiant = (state: RootState) => state.callsSlice.recipiant
export const selectCaller = (state:RootState) => state.callsSlice.caller
export const selectReceivedOffer = (state:RootState) => state.callsSlice.receivedOffer
export const selectCurrentCallId = (state: RootState) => state.callsSlice.currentCallId
export const selectCallStartTime = (state: RootState) => state.callsSlice.callStartTime

export default callsSlice.reducer