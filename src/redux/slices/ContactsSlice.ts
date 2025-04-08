import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import axiosIns from '../../providers/axiosIns'
import { createFhirRelatedPersons } from '../../utils/ContactsUtils'
import { RelatedPerson } from '../../types/FhirRelatedPerson'

interface ContactsState {
    contacts: any[]
}

const initialState: ContactsState = {
    contacts: [],
}
export const getContacts = createAsyncThunk(
    'contacts/getContacts',
    async () => {
        const response = await axiosIns.get(`${process.env.API_URL}/relatedPerson/getByEmail`)
        return response.data as any;
    },
)

export const createRelatedPersons = createAsyncThunk(
    'contacts/createContact',
    async ({ patientId, relatedPersons }: { patientId: string, relatedPersons: RelatedPerson[] }) => {
        const fhirRelatedPersons = createFhirRelatedPersons(patientId, relatedPersons);

        console.log("📤 Sending FHIR RelatedPersons:", fhirRelatedPersons);

        // ✅ Send data to API with correct payload structure
        const response = await axiosIns.post(`${process.env.API_URL}/relatedPerson`,
            fhirRelatedPersons, // 👈 Wrap in an object
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        console.log("✅ RelatedPersons Created:", response.data);
        return response.data;
    },
)

export const contactsSlice = createSlice({
    name: 'contacts',
    initialState,
    reducers: {
        addContacts: (state, action) => {
            state.contacts = action.payload
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getContacts.fulfilled, (state, action) => {
            state.contacts = action.payload
        }),
        builder.addCase(createRelatedPersons.fulfilled, (state,action) => {
            state.contacts = action.payload
        })
  }
})

export const { addContacts } = contactsSlice.actions

export const selectContacts = (state: RootState) => state.contactsSlice.contacts

export default contactsSlice.reducer