import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import axiosIns from '../../providers/axiosIns';
import { convertToFhirPatient } from '../../utils/PatientUtils';

interface PatientState {
    patient: any,
}

const initialState: PatientState = {
    patient: null,
}

export const addPatient = createAsyncThunk(
    'patient/addPatient',
    async (formData: {
        Firstname: string;
        Lastname: string;
        Street: string;
        County: string;
        Postcode: string;
        day: string;
        month: string;
        year: string;
    }) => {
        try {
            const fhirPatient = convertToFhirPatient(formData)

            const response = await axiosIns.post(`${process.env.API_URL}/patients`, fhirPatient);

            console.log("✅ Patient Created:", response.data);
            return response.data;
        } catch (error) {
            console.error("🚨 Error creating patient:", error);
            throw error;
        }
    }
)

export const getPatient = createAsyncThunk(
    'patient/getPatient',
    async () => {
        const response = await axiosIns.get(`${process.env.API_URL}/patients/email`)
        return response.data as any;
    },
)

export const patientSlice = createSlice({
    name: 'patient',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(getPatient.fulfilled, (state, action) => {
            state.patient = action.payload
        }),
        builder.addCase(addPatient.fulfilled, (state, action) => {
            state.patient - action.payload
        })
    },
})

export const selectPatient = (state: RootState) => state.patientSlice.patient


export default patientSlice