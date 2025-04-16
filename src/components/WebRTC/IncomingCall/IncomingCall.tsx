import './incomingCall.css'
import answer from "./answer.svg"
import decline from "./decline.svg"
import { Tile } from '../../Tile/Tile';
import { useIncomingCallSound } from '../../../hooks/IncomingCall';

interface IncomingCallProps {
    incomingCall: boolean;
    caller: string;
    acceptCall: Function;
    rejectCall: Function;
}

export const IncomingCall = ({ incomingCall, caller, acceptCall, rejectCall }: IncomingCallProps) => {
    useIncomingCallSound()
    return (
        <>
            {incomingCall && (
                <div className="incomingBackGround">
                    <Tile title='Incoming Call' colour='white' backgroundColor='black'>
                        <div style={{ width: 'calc(100vw - 128px)', height: 'calc(100vh - 128px)', alignContent: 'center' }}>
                            <div className="incomingTitle">
                                <h2>{caller}</h2>
                            </div>
                            <div className="incomingTitle">
                                <h2>Calling</h2>
                            </div>
                            <div className="callButtons">
                                <img src={answer} style={{ height: '75px', cursor: 'pointer' }} onClick={() => acceptCall()} />
                                <img src={decline} style={{ height: '75px', cursor: 'pointer' }} onClick={() => rejectCall()} />
                            </div>
                        </div>
                    </Tile>
                </div>
            )}
        </>
    )
}