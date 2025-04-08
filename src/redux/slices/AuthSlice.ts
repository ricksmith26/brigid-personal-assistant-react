import { createSlice,createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import axiosIns from '../../providers/axiosIns';
import { User } from '../../types/User';

interface AuthState {
  isAuth: boolean,
  user: User | null
}

const initialState: AuthState = {
    isAuth: false,
    user: null
}

export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async () => {
      try {
        const response = await axiosIns.get(`${process.env.API_URL}/auth/me`);
        return response.data as User;
      } catch (error) {
        console.log(error)
        throw error
      }

    },
  )

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    isAuth: (state, action) => {
      state.isAuth = action.payload
    },    
  },
  extraReducers: (builder) => {
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.isAuth = true
      state.user = action.payload
    })
  },
})

export const { isAuth } = authSlice.actions

export const selectInBoundCall = (state: RootState) => state.authSlice.isAuth

export const selectUser = (state: RootState) => state.authSlice.user

export default authSlice.reducer