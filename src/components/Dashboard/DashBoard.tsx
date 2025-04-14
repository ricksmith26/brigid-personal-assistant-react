import DashBoardIcon from '../DashboardIcon/DashboardIcon';
import './dashboard.css'
import videoCall from '../../assets/video-call.svg'
import emergencyCallIcon from '../../assets/emergency-call.svg'
import contacts from '../../assets/contacts.svg'
import spotify from '../../assets/spotify-tile.svg'
import settings from '../../assets/settings.svg'
import callIcon from '../../assets/phone.svg'
import { ModesEnum } from '../../types/Modes';

const DashBoard = () => {
    return (
        <div className='dashboardContainer'>
            <DashBoardIcon icon={contacts} title='Contacts' link={`/${ModesEnum.CONTACTS}`} colour="#2980B9"/>
            <DashBoardIcon icon={callIcon} title='Phone Call' link={`/${ModesEnum.PHONE_CALL}`} colour="#8E44AD"/>
            <DashBoardIcon icon={videoCall} title='Video Call' link={`/${ModesEnum.VIDEO_CALL}`} colour="#E67E22"/>
            <DashBoardIcon icon={emergencyCallIcon} title='Emergency Call' link={`/${ModesEnum.EMERGENCY_CALL}`} colour="#C0392B"/>
            <DashBoardIcon icon={spotify} title='Spotify' link={`/${ModesEnum.SPOTIFY}`} colour="#33bd5f"/>
            <DashBoardIcon icon={settings} title='Settings' link={`/${ModesEnum.SETTINGS}`} colour="#666666"/>
        </div>
    )
}

export default DashBoard;