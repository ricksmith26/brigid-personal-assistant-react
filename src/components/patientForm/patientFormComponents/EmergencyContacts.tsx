import { useState } from "react"
import Button from "../../Button/Button"
import { TextInput } from "../../formComponents/TextInput/TextInput"
import { Tile } from "../../Tile/Tile";
import { ListedContacts } from "./ListedContacts";
// import { createRelatedPersons } from "../../../api/EmergencyContactApi";

type Contact = {
    Firstname: string;
    Lastname: string;
    Phone: string;
    Email: string;

}

export const EmergencyContacts = ({
        contacts,
        setContacts,
        submitContacts
    }: { contacts: any[], setContacts: any, submitContacts: Function }) => {
    const [contact, setContact] = useState<Contact>({
        Firstname: '',
        Lastname: '',
        Phone: '',
        Email: ''

    })

    const onContactChange = (event: any) => {
        const c = { ...contact, [event.target.name]: event.target.value }
        setContact(c)
    }

    const addContact = () => {
        const addedContactsArray = [...contacts]
        addedContactsArray.push(contact)
        setContacts(addedContactsArray);
        const blankContact = {
            ...{
                Firstname: '',
                Lastname: '',
                Phone: '',
                Email: ''

            }
        }
        setContact(blankContact)
    }


    return (
        <>
            <ListedContacts contacts={contacts} />
            <Tile title="Contact Details">
                <div className="inputsContainer">
                    <div className="namesContainer">
                        <TextInput label='Firstname' name='Firstname' placeholder="Firstname" onChange={onContactChange} value={contact['Firstname']} />
                        <TextInput label='Lastname' name='Lastname' placeholder="Lastname" onChange={onContactChange} value={contact['Lastname']} />
                    </div>
                    <div className="namesContainer">
                        <TextInput label='Phone' name='Phone' placeholder="Phone" onChange={onContactChange} value={contact['Phone']} />
                        <TextInput label='Email' name='Email' placeholder="Email" style={{ marginLeft: '8px' }} onChange={onContactChange} value={contact['Email']} />
                    </div>
                </div>
                <div className="buttonContainer">
                    <Button onClick={addContact}>{contacts.length === 0 ? 'Add contact+' : 'Add another contact +'}</Button>
                    {contacts.length > 0 && <Button onClick={submitContacts}>Next</Button>}
                </div>
            </Tile>

        </>
    )
}