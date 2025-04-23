import { useNavigate } from 'react-router';
import './dashboardIcon.css'
import { useDispatch } from 'react-redux';
import { setMode } from '../../redux/slices/ModeSlice';
interface DashBoardIconProps {
    icon: any;
    title: string;
    link: string;
    colour: string;
}
const DashBoardIcon = ({ icon, title, link, colour }: DashBoardIconProps) => {
    // const navigate = useNavigate();
    const dispatch = useDispatch()
    return (
        <div className='textAndIconContainer' onClick={() => dispatch(setMode(link.replace('/', '')))}>
            <div className="dashboardIconContainer" style={{ border: `12px solid ${colour}` }}>
                <img src={icon} />
            </div>
            <div className='textContainer'>{title}</div>
        </div>
    )
}

export default DashBoardIcon;