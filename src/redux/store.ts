import {configureStore} from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer';
import socketMiddleware from '../socket/socketMiddleware';


export const store = configureStore({
    reducer: rootReducer,
    middleware(getDefaultMiddleware) {
        return getDefaultMiddleware().concat([socketMiddleware]);
      },
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch