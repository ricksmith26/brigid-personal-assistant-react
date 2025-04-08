import './patientForm.css'
import { PersonalDetails } from "./patientFormComponents/PersonalDetails"
import { useEffect, useState } from "react"
import { EmergencyContacts } from "./patientFormComponents/EmergencyContacts"
import { FormTitle } from "./patientFormComponents/FormTitle"
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { addPatient, selectPatient } from '../../redux/slices/PatientSlice'
import { createRelatedPersons } from '../../redux/slices/ContactsSlice'

interface PatientFormProps {
    email: string;
    setMode: Function;
}

export const PatientForm = ({ email }: PatientFormProps) => {
    const dispatch = useAppDispatch()
    const patientRecord = useAppSelector(selectPatient)
    const [currentPage, setCurrentPage] = useState(0);

    const [patient, setPatient] = useState({
        Firstname: "",
        Lastname: "",
        Email: "",
        Phone: "",
        Street: "",
        County: "",
        Postcode: "",
        day: "",
        month: "",
        year: ""
    })
    const [contacts, setContacts] = useState([])

    const pageText = [
        "It looks like you don't have an account yet! Lets get to know you.",
        "Who would you want us to call in an emergency?"
    ]

    const onChangePatient = (event: any) => {
        const p = { ...patient, [event.target.name]: event.target.value }
        setPatient(p)
    }

    const submitPatient = async () => {
        let patientData = patient;
        patientData.Email = email;
        dispatch(addPatient(patientData))
    }

    const submitContacts = async () => {
        dispatch(await createRelatedPersons({patientId: patientRecord._id, relatedPersons: contacts}))
    }

    useEffect(() => {
        if (patientRecord) setCurrentPage(1)
    }, [patientRecord])

    return (
        <div className="patientFormBackground">
            <FormTitle text={pageText[currentPage]} />
            <div className="contentsContainer">
                {currentPage === 0
                    && <PersonalDetails onChange={onChangePatient} onClick={submitPatient} />}
                {currentPage === 1
                    && <EmergencyContacts
                        setContacts={setContacts}
                        contacts={contacts}
                        submitContacts={submitContacts} />}
            </div>
        </div>

    )
}