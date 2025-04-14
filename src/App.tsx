import { useEffect } from 'react'
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
import { setCaller, setInBoundCall, setOutBoundCall, setRecipiant, } from './redux/slices/CallsSlice.js';
import { selectMode, setMode } from './redux/slices/ModeSlice.js';
import { checkAuth, selectUser } from './redux/slices/AuthSlice.js';

import {
  getImages,
  selectPhotos
} from './redux/slices/ImagesSlice.js';
import { getPatient } from './redux/slices/PatientSlice.js';
import { getContacts } from './redux/slices/ContactsSlice.js';
import { useSocket } from './providers/socketProvider.js';
import { SocketEvent } from './socket/socketMiddleware.js';
import EmergencyCall from './components/EmergencyCall/EmergencyCall.js';
import EmergencyCall2 from './components/EmergencyCall/EmergencyCall2.js';
import { setNewMessage } from './redux/slices/LivekitMessages.js';
import DashBoard from './components/Dashboard/DashBoard.js';
import { Link, Navigate, Route, Router, Routes, useNavigate } from 'react-router';
import Contacts from './components/Contacts/Contacts.js';

function App() {
  const navigate = useNavigate();
  const mode = useAppSelector(selectMode)
  const dispatch = useAppDispatch()
  const photos = useAppSelector(selectPhotos)
  const user = useAppSelector(selectUser)
  const { socket } = useSocket();

  useLocalTTS()
  useEffect(() => {
    socket.on(SocketEvent.Message, (message: any) => {
      if (message.type === ModesEnum.WEBRTC) {
        if (message.toEmail) {
          dispatch(setOutBoundCall(true));
          dispatch(setRecipiant(message.toEmail))
        } else {
          dispatch(setInBoundCall(true));
          dispatch(setCaller(message.fromEmail))
        }
        dispatch(setMode(ModesEnum.WEBRTC));
        <Navigate to={`/${ModesEnum.WEBRTC}`} />;
      }
    }),
      socket.on(SocketEvent.EmergencyCall, () => {
        dispatch(setMode('EMERGENCY'))
      })
    socket.on(SocketEvent.EventNotifcation, (event) => {
      dispatch(setNewMessage(`Please read out this reminder: This a reminder, ${event.title} at ${event.time}, and the time is ${event.time}.`))
      dispatch(setMode(ModesEnum.WINSTON))
    })
    socket.on(SocketEvent.ModeChange, ({ mode }) => {
      console.log(mode)
      dispatch(setMode(mode))
    })
  }, [])

  useEffect(() => {
    navigate(`/${mode}`)
    console.log(`/${mode}`, '<<<<<<<')
  }, [mode])



  useEffect(() => {
    // togglePlayPause()
    dispatch(checkAuth())
  }, []);

  useEffect(() => {
    if (user) {
      socket.emit('register', user.email)
      console.log('getting patient data<<<<<')
      dispatch(getPatient())
      dispatch(getContacts())
      dispatch(getImages())
    }
  }, [user])

  return (
    <div className='app'>
      <Routes>
        <Route path={`/${ModesEnum.LOGIN}`} element={<Login />} />
        <Route path={`/${ModesEnum.PATIENT_FORM}`} element={<PatientForm email={user?.email || ''} setMode={setMode} />} />
        <Route path={`/${ModesEnum.WINSTON}`} element={<Winston email={user?.email} mode={mode} />} />
        <Route path={`/${ModesEnum.IDLE}`} element={<Carousel images={photos} />} />
        <Route path={`/${ModesEnum.WEBRTC}`} element={<WebRTC />} />
        <Route path={`/${ModesEnum.EMERGENCY_CALL}`} element={<EmergencyCall2 />} />
        <Route path={`/${ModesEnum.CONTACTS}`} element={<Contacts/>} />
        <Route path={`/${ModesEnum.PHONE_CALL}`} element={<div>PHONE_CALL</div>} />
        <Route path={`/${ModesEnum.VIDEO_CALL}`} element={<div>VIDEO_CALL</div>} />
        <Route path={`/${ModesEnum.SPOTIFY}`} element={<div>SPOTIFY</div>} />
        <Route path={`/${ModesEnum.SETTINGS}`} element={<div>SETTINGS</div>} />
        <Route path={`/${ModesEnum.DASHBOARD}`} element={<DashBoard />} />
      </Routes>
    </div>
  )
}

export default App