import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { store } from './store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export type ReduxDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<ReduxDispatch>()

export type ReduxState = ReturnType<typeof store.getState>
export const useAppSelector: TypedUseSelectorHook<ReduxState> = useSelector