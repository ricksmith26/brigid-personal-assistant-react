import { useNavigate } from 'react-router';
import './dashboardIcon.css'
interface DashBoardIconProps {
    icon: any;
    title: string;
    link: string;
    colour: string;
}
const DashBoardIcon = ({ icon, title, link, colour }: DashBoardIconProps) => {
    const navigate = useNavigate();
    return (
        <div className='textAndIconContainer' onClick={() => navigate(link)}>
            <div className="dashboardIconContainer" style={{ border: `12px solid ${colour}` }}>
                <img src={icon} />
            </div>
            <div className='textContainer'>{title}</div>
        </div>
    )
}

export default DashBoardIcon;