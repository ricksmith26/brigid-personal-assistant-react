import fastfoward from '../../assets/fast-forward.svg'

interface FastForwardOrRewindProps {
    isFastforward: boolean;
    onClick: () => void;
}

const FastForwardOrRewind = ({isFastforward, onClick}: FastForwardOrRewindProps) => {
    return (
        <button className='fastForwardOrRewind' onClick={onClick}>
            <img className='fastForwardOrRewindicon'  src={fastfoward} style={{transform: isFastforward ? 'rotate(0)' : 'rotate(180deg)'}}/>
       </button>
    )
}

export default FastForwardOrRewind