import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../store'

interface CallsState {
  isInboundCall: boolean,
  isOutboundCall: boolean,
  answered: boolean,
  recipiant: string,
  caller: string,
  receivedOffer: string
}

const initialState: CallsState = {
    isInboundCall: false,
    isOutboundCall: false,
    answered: false,
    recipiant: '',
    caller: '',
    receivedOffer: ''
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
    }
    
  },
})

export const { setInBoundCall, setOutBoundCall, setAnswered, setRecipiant, setCaller } = callsSlice.actions

export const selectInBoundCall = (state: RootState) => state.callsSlice.isInboundCall
export const selectOutBoundCall = (state: RootState) => state.callsSlice.isOutboundCall
export const selectAnswered = (state: RootState) => state.callsSlice.answered
export const selectRecipiant = (state: RootState) => state.callsSlice.recipiant
export const selectCaller = (state:RootState) => state.callsSlice.caller
export const selectReceivedOffer = (state:RootState) => state.callsSlice.receivedOffer

export default callsSlice.reducer