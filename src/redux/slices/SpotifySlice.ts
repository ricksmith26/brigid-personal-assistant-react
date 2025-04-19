import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../store'

interface SpotifyState {
    access_token: string | null,
    refresh_token: string | null,
    expires_in: string | null,
    expired_by: string | null
}

const initialState: SpotifyState = {
    access_token: null,
    refresh_token: null,
    expires_in: null,
    expired_by: null
}

// authThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const clientId = 'bc445b54c9a94b649f73f923c675320b'; // Replace with your actual client ID

export const refreshSpotifyToken = createAsyncThunk(
    'auth/refreshSpotifyToken',
    async (_, thunkAPI) => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            const url = 'https://accounts.spotify.com/api/token';
            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('refresh_token', refreshToken || '');
            params.append('client_id', clientId);
            console.log(refreshToken, ';<<<<<<<<refreshTokenrefreshTokenrefreshToken')
            const response = await axios.post(url, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const { access_token, refresh_token } = response.data;

            localStorage.setItem('access_token', access_token);
            if (refresh_token) {
                localStorage.setItem('refresh_token', refresh_token);
            }

            return response.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data || 'Token refresh failed');
        }
    }
);


export const spotifySlice = createSlice({
    name: 'spotify',
    initialState,
    reducers: {
        setAccessToken: (state, action) => {
            state.access_token = action.payload
        },
        setRefreshToken: (state, action) => {
            state.refresh_token = action.payload
        },
        setExpiresIn: (state, action) => {
            state.expires_in = action.payload
        },
        setExpiredBy: (state, action) => {
            state.expired_by = action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(refreshSpotifyToken.fulfilled, (state, action) => {
            state.access_token = action.payload.access_token
            state.refresh_token = action.payload.refresh_token
        })
    }
})

export const { setAccessToken, setRefreshToken, setExpiresIn, setExpiredBy } = spotifySlice.actions

export const selectAccessToken = (state: RootState) => state.spotifySlice.access_token
export const selectRefreshToken = (state: RootState) => state.spotifySlice.refresh_token
export const selectExpiresIn = (state: RootState) => state.spotifySlice.expires_in
export const selectExpiredBy = (state: RootState) => state.spotifySlice.expired_by

export default spotifySlice.reducer