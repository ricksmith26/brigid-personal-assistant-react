import { combineReducers } from "@reduxjs/toolkit";
import { counterSlice } from "./slices/CounterSlice";
import { callsSlice } from "./slices/CallsSlice";
import { modeSlice } from "./slices/ModeSlice";
import { authSlice } from "./slices/AuthSlice";
import socketSlice from "./slices/socketSlice";
import { imagesSlice } from "./slices/ImagesSlice";
import patientSlice from "./slices/PatientSlice";
import { contactsSlice } from "./slices/ContactsSlice";
import { LivekitMessagesSlice } from "./slices/LivekitMessages";
import { spotifySlice } from "./slices/SpotifySlice";

export const rootReducer = combineReducers({
    counterSlice: counterSlice.reducer,
    callsSlice: callsSlice.reducer,
    modeSlice: modeSlice.reducer,
    authSlice: authSlice.reducer,
    socketSlice: socketSlice.reducer,
    imagesSlice: imagesSlice.reducer,
    patientSlice: patientSlice.reducer,
    contactsSlice: contactsSlice.reducer,
    LivekitMessagesSlice: LivekitMessagesSlice.reducer,
    spotifySlice: spotifySlice.reducer
})