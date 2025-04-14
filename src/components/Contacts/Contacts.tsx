import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { addContacts, createRelatedPersons, selectContacts } from "../../redux/slices/ContactsSlice"
import { EmergencyContacts } from "../patientForm/patientFormComponents/EmergencyContacts"
import { selectPatient } from "../../redux/slices/PatientSlice"

const Contacts = () => {
    const contacts = useAppSelector(selectContacts)
    const patientRecord = useAppSelector(selectPatient)
    const dispatch = useAppDispatch()

    const addNewContacts = (addedContacts: any[]) => {
        dispatch(addContacts(addedContacts))}

    const submitContacts = async () => {
        dispatch(await createRelatedPersons(
            {
                patientId: patientRecord._id,
                relatedPersons: contacts.filter((contact) => {
                    if (!contact.id) {
                        return contact
                    }
                })
            }))
    }
    return (
        <div>
            <EmergencyContacts
                contacts={contacts}
                setContacts={addNewContacts}
                submitContacts={submitContacts}
            />
        </div>
    )
}

export default Contacts