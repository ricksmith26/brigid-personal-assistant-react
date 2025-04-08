import Button from "../../Button/Button";
import { TextInput } from "../../formComponents/TextInput/TextInput"
import { Tile } from "../../Tile/Tile";

interface PersonalDetailsProps {
    onChange: any;
    onClick: Function;
}

export const PersonalDetails = ({ onChange, onClick }: PersonalDetailsProps) => {

    return (
        <>
            <Tile title="Personal Details">
                <div className="inputsContainer">
                    <div className="namesContainer">
                        <TextInput label='Firstname' name='Firstname' placeholder="Firstname" onChange={onChange} />
                        <TextInput label='Lastname' name='Lastname' placeholder="Lastname" onChange={onChange} />
                        <div className="dateOfbirth">
                            <TextInput label='Date of birth' name='day' placeholder="DD" style={{ width: '52px', marginLeft: '0px' }} onChange={onChange} />
                            <TextInput name='month' placeholder="MM" style={{ width: '52px', marginLeft: '0px' }} onChange={onChange} />
                            <TextInput name='year' placeholder="YYYY" style={{ width: '78px', marginLeft: '0px' }} onChange={onChange} />
                        </div>

                    </div>

                    <div className="addressContainer">
                        <TextInput label='Street' name='Street' placeholder="Street" style={{ marginLeft: '24px' }} onChange={onChange} />
                        <TextInput label='Town' name='Town' placeholder="Town" style={{ marginLeft: '30px' }} />
                        <TextInput label='County' name='County' placeholder="County" style={{ marginLeft: '16px' }} onChange={onChange} />
                        <TextInput label='Postcode' name='Postcode' placeholder="Postcode" style={{ width: '100px', marginLeft: '0px' }} onChange={onChange} />
                    </div>
                </div>
                <div className="buttonContainer">
                    <Button onClick={onClick}>Next</Button>
                </div>
            </Tile>
        </>

    )
}