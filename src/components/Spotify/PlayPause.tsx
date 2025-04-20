import playIcon from '../../assets/play.svg';
import pauseIcon from '../../assets/pause.svg';

interface PlayPauseProps {
    isPlaying: boolean;
    onClick: () => void
}

const PlayPause = ({isPlaying, onClick}: PlayPauseProps) => {
    return (
        <button id="playPause" className='playPause' onClick={onClick}>{
            isPlaying
            ? <img src={playIcon} style={{height: '24px'}}/>
            : <img src={pauseIcon} style={{height: '24px'}}/>            
            }</button>
    )
}

export default PlayPause