import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { ModesEnum } from '../../types/Modes'
import { checkAuth } from './AuthSlice'
import { getPatient } from './PatientSlice'
import { createRelatedPersons, getContacts } from './ContactsSlice'

interface ModeState {
    mode: string,
}

const initialState: ModeState = {
    mode: ModesEnum.LOGIN
}

export const modeSlice = createSlice({
    name: 'mode',
    initialState,
    reducers: {
        setMode: (state, action) => {
            state.mode = action.payload
        },
        setOutBoundCall: (state) =>{
            console.log('setOutBoundCall,<<<<<<<<<<<')
            state.mode = ModesEnum.WEBRTC
        }
    },
    extraReducers: (builder) => {
        
        builder.addCase(checkAuth.rejected, (state) => {
            state.mode = ModesEnum.LOGIN
        }),
        builder.addCase(getPatient.rejected, (state) => {
            state.mode = ModesEnum.PATIENT_FORM
        }),
        builder.addCase(getContacts.fulfilled, (state, action) => {
            if (action.payload.length === 0) {
                state.mode = ModesEnum.PATIENT_FORM
            } else {
                state.mode = ModesEnum.IDLE
            }
        }),
        builder.addCase(createRelatedPersons.fulfilled, (state) => {
            state.mode = ModesEnum.IDLE
        })
    }
})

export const { setMode } = modeSlice.actions

export const selectMode = (state: RootState) => state.modeSlice.mode
export default modeSlice.reducer