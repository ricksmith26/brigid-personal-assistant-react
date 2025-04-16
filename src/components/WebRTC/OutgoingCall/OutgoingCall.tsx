import "./outgoingCall.css"
import declineIcon from "../IncomingCall/decline.svg"
import { Tile } from "../../Tile/Tile";
import { useOutGoingCallSound } from "../../../hooks/outgoingCall";


interface OutgoingCallProps {
    isOutgoing: boolean;
    hangupCall: Function;
}

export const OutgoingCall = ({ isOutgoing, hangupCall }: OutgoingCallProps) => {
    useOutGoingCallSound()
    return (
        <>
            {isOutgoing
                &&
                <div className="outgoingCallBackground">
                    <Tile title="Outgoing Call" colour="white" backgroundColor="#93C572">
                        <div style={{ width: 'calc(100vw - 128px)', height: 'calc(100vh - 128px)', alignContent: 'center' }}>
                            <h2 className="outgoingTitle">Calling Kevin</h2>
                            <div className="outgoingButtonContainer">
                                <img src={declineIcon} style={{ height: '75px', cursor: 'pointer' }} onClick={() => hangupCall()} />
                            </div>

                        </div>
                    </Tile>
                </div>

            }
        </>

    )
}