import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { } from 'react-dom'
import Winston from './winston/page.js'
import Carousel from './components/Carousel/Carousel.js';
import Login from './login/Login.js';
import { PatientForm } from './components/patientForm/PatientForm.js';
import { WebRTC } from './components/WebRTC/WebRTC.js';

import { ModesEnum } from './types/Modes.js';

import useLocalTTS from './hooks/useLocalTTS.js';
import { useAppDispatch, useAppSelector } from './redux/hooks.js';
import { selectCaller, selectRecipiant, setCaller, setInBoundCall, setOutBoundCall, setRecipiant, } from './redux/slices/CallsSlice.js';
import { selectMode, setMode } from './redux/slices/ModeSlice.js';
import { checkAuth, selectUser } from './redux/slices/AuthSlice.js';

import {
  getImages,
  selectPhotos
} from './redux/slices/ImagesSlice.js';
import { getPatient } from './redux/slices/PatientSlice.ts';
import { getContacts } from './redux/slices/ContactsSlice.ts';
import { useSocket } from './providers/socketProvider.tsx';
import { SocketEvent } from './socket/socketMiddleware.ts';
import EmergencyCall from './components/EmergencyCall/EmergencyCall.tsx';
import { setNewMessage } from './redux/slices/LivekitMessages.ts';
import DashBoard from './components/Dashboard/DashBoard.tsx';
// import { Link, Navigate, Route, Router, Routes, useNavigate } from 'react-router';
import {
  // BrowserRouter,
  Routes,
  Route,
  useNavigate,
  // useParams,
  // useLocation,
  // Navigate,
  // Link
} from 'react-router-dom';


import Contacts from './components/Contacts/Contacts.js';
import Spotify from './components/Spotify/Spotify.tsx';
import Callback from './components/Spotify/Callback.tsx';
import { setTracks } from './redux/slices/SpotifySlice.ts';
import { getEmergencyCredentials } from './api/EmergencyContactApi.ts';
import { EmergencyCallCredentialsType } from './types/EmergencyCallCredentials.ts';


function App() {
  const navigate = useNavigate();
  const mode = useAppSelector(selectMode)
  const dispatch = useAppDispatch()
  const photos = useAppSelector(selectPhotos)
  const user = useAppSelector(selectUser)
  const { socket } = useSocket();
  const recipiant = useAppSelector(selectRecipiant)
  const caller = useAppSelector(selectCaller)
  const [emergencyCallCredentials, setEmergencyCallCredentials] = useState<EmergencyCallCredentialsType|null>(null)
  const [agentEmergencyCallCredentials, setAgentEmergencyCallCredentials] = useState<EmergencyCallCredentialsType|null>(null)

  useLocalTTS()

  const setUpSocket = useCallback(async(socket: any) => {
    console.log('[App] Setting up socket event listeners');

    socket.on(SocketEvent.Connect, () => {
      console.log('[App] Socket connected');
    });

    socket.on(SocketEvent.Disconnect, () => {
      console.log('[App] Socket disconnected');
    });

    socket.on(SocketEvent.Message, async(message: any) => {
      console.log('[App] Received message:', message);
      if (message.type === ModesEnum.WEBRTC) {
        console.log('[App] WEBRTC message received');
        if (message.toEmail) {
          console.log('[App] Outbound call to:', message.toEmail);
          dispatch(setRecipiant(message.toEmail))
          dispatch(setOutBoundCall(true));
        } else if (message.fromEmail) {
          console.log('[App] Inbound call from:', message.fromEmail);
          await dispatch(setCaller(message.fromEmail))
          await dispatch(setInBoundCall(true));
        }
        dispatch(setMode(ModesEnum.WEBRTC));
      }
    }),
      socket.on(SocketEvent.EmergencyCall, () => {
        getEmergencyCredentials().then((credentials: EmergencyCallCredentialsType) => {
          // console.log(credentials, "<<<<<credentialscredentialscredentials")
          setEmergencyCallCredentials(credentials)
          setTimeout(() => {
            dispatch(setMode('EMERGENCY'))
          }, 1000)
        })
      })
    socket.on(SocketEvent.EventNotifcation, (event: any) => {
      dispatch(setNewMessage(`Please read out this reminder: This a reminder, ${event.title} at ${event.time}, and the time is ${event.time}.`))
      dispatch(setMode(ModesEnum.WINSTON))
    })
    socket.on(SocketEvent.ModeChange, ({ mode }: any) => {
      console.log(mode)
      dispatch(setMode(mode))
    })
    socket.on(SocketEvent.Spotify, ({ mode, tracks }: any) => {
      console.log({ mode, tracks }, '<<<{ mode, tracks }')
      dispatch(setTracks(tracks))
      dispatch(setMode(mode))
    })
    socket.on('emergencyCallConnection', (pairing: {agent: EmergencyCallCredentialsType, customer: EmergencyCallCredentialsType}) => {
      console.log(pairing, '<<<{ mode, tracks }')
      setAgentEmergencyCallCredentials(pairing.agent)

    })
  }, [])
  useEffect(() => {
    setUpSocket(socket)
  }, [])

  useEffect(() => {
    if (true){
      const targetPath = `/${mode}`;
    
        navigate(targetPath);

    }
  }, [mode, navigate]);


  useEffect(() => {
    // togglePlayPause()
    dispatch(checkAuth())
  }, []);

  useEffect(() => {
    if (user) {
      // Register with device type for multi-device support
      socket.emit('register', {
        email: user.email,
        deviceType: 'web'
      })
      console.log('Registered with backend as web device:', user.email)
      dispatch(getPatient())
      dispatch(getContacts())
      dispatch(getImages())
    }
  }, [user])

  return (
    <div className='app'>
      <Routes>
        <Route path={`/?:token`} element={<Carousel images={photos} />} />
        <Route path={`/${ModesEnum.LOGIN}`} element={<Login />} />
        <Route path={`/${ModesEnum.PATIENT_FORM}`} element={<PatientForm email={user?.email || ''} setMode={setMode} />} />
        <Route path={`/${ModesEnum.WINSTON}`} element={<Winston email={user?.email} mode={mode} />} />
        <Route path={`/${ModesEnum.IDLE}`} element={<Carousel images={photos} />} />
        <Route path={`/${ModesEnum.WEBRTC}`} element={<WebRTC />} />
        <Route
          path={`/${ModesEnum.EMERGENCY_CALL}`}
          element={emergencyCallCredentials 
            ? <EmergencyCall emergencyCallCredentials={emergencyCallCredentials} agentEmergencyCallCredentials={agentEmergencyCallCredentials}/>
            : <></>} />
        <Route path={`/${ModesEnum.CONTACTS}`} element={<Contacts/>} />
        <Route path={`/${ModesEnum.PHONE_CALL}`} element={<div>PHONE_CALL</div>} />
        <Route path={`/${ModesEnum.VIDEO_CALL}`} element={<div>VIDEO_CALL</div>} />
        <Route path={`/${ModesEnum.SETTINGS}`} element={<div>SETTINGS</div>} />
        <Route path={`/${ModesEnum.DASHBOARD}`} element={<DashBoard />} />
        <Route path={`/${ModesEnum.SPOTIFY}`} element={<Spotify />} />
        <Route path="/callback" element={<Callback/>} />
      </Routes>
      {/* <Spotify/> */}
    </div>
  )
}

export default App