import { useEffect, useState } from "react";
import SpotifyLogin from "./SpotifyLogin";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { refreshSpotifyToken, selectAccessToken, selectExpiresIn, selectRefreshToken, setAccessToken, setExpiresIn, setRefreshToken } from "../../redux/slices/SpotifySlice";
import SpotifyWebPlayer from "./SpotifyWebPlayer";
import { Tile } from "../Tile/Tile";
import { selectMode } from "../../redux/slices/ModeSlice";

const Spotify = () => {
    const accessToken = useAppSelector(selectAccessToken)
    const refreshToken = useAppSelector(selectRefreshToken)
    const expiresIn = useAppSelector(selectExpiresIn)
    const mode = useAppSelector(selectMode)
    const dispatch = useAppDispatch()
    const [ready, setReady] = useState(false)
    
    useEffect(() => {
        console.log(expiresIn, '<<<expires_in')
        const token = localStorage.getItem('access_token');
        const refresh = localStorage.getItem('refresh_token');
        const expiry = localStorage.getItem('expires_in');
        const expiredBy = localStorage.getItem('expired_by');
        if ((Number(expiredBy) < Date.now()) && refresh) {
            console.log(!!refresh, refresh, "<<<refreshing token", token)
            dispatch(refreshSpotifyToken(refresh))
        } else {
            if (token) dispatch(setAccessToken(token))
            if (refresh) dispatch(setRefreshToken(refresh))
            if (expiry) dispatch(setExpiresIn(expiry))
        }
    }, [])

    useEffect(() => {
        console.log({accessToken , refreshToken , expiresIn})
            setTimeout(() => {
                setReady(true)
            }, 500)
    }, [accessToken, refreshToken, expiresIn])

    return (
        <div  style={{width: 'calc(100% - 48px)', height: 'calc(100% - 48px)'}}>
            <Tile title="Spotify" style={{width: '100%', height: '100%'}}>
                    {/* {console.log(accessToken , refreshToken, '<<<<<')} */}
                    {/* <SpotifyLogin/> */}
                    {!accessToken && !refreshToken && <SpotifyLogin/>}
                    {ready && mode === "spotify" && <SpotifyWebPlayer token={accessToken as string} refreshToken={refreshToken as string}/>}
            </Tile>
        </div>
    )
}

export default Spotify;