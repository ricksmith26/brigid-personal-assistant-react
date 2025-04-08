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

function App() {
  const mode = useAppSelector(selectMode)
  const dispatch = useAppDispatch()
  const photos = useAppSelector(selectPhotos)
  const user = useAppSelector(selectUser)
  const { socket } = useSocket();

  // console.log(isPlaying, '<<<<<<isPlaying')
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
      }
    }),
    socket.on(SocketEvent.EmergencyCall, () => {
      dispatch(setMode('EMERGENCY'))
    })
  }, [])
 


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

      {mode === ModesEnum.LOGIN && <Login />}

      {mode === ModesEnum.PATIENT_FORM && <PatientForm email={user?.email || ''} setMode={setMode} />}

      {mode === ModesEnum.WINSTON &&
        <div className='assistant-constainer'>
          <Winston email={user?.email} mode={mode}></Winston>
        </div>}

      {mode === 'idle' && user && <Carousel images={photos} />}

      {mode === 'WEBRTC' && user &&
        <WebRTC
          // patientEmail={user.email}
        />
      }
      {mode === 'EMERGENCY' && <EmergencyCall2/>}
    {/* <EmergencyCall2/> */}
     {/* <EmergencyCall username='User3' password='1234' domain='asterisk.brigid-personal-assistant.com' targetUser='100'/> */}
    </div>
  )
}

export default App