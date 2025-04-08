import axiosIns from "../providers/axiosIns";

// const API_URL = import.meta.env.API_URL;

// Define a TypeScript interface for related persons
interface RelatedPerson {
  Firstname: string;
  Lastname: string;
  Phone: string;
  Email: string;
}

// ✅ Function to convert to FHIR format
const createFhirRelatedPersons = (patientId: string, relatedPersons: RelatedPerson[]) => {
  return relatedPersons.map((person) => ({
    id: window.crypto.randomUUID(), // Unique ID for each related person
    resourceType: "RelatedPerson",
    name: [
      {
        family: person.Lastname,
        given: [person.Firstname],
      },
    ],
    telecom: [
      {
        system: "phone",
        value: person.Phone,
        use: "mobile",
      },
      {
        system: "email",
        value: person.Email,
        use: "home",
      },
    ],
    relationship: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
            code: "FAMMEMB",
            display: "Family Member",
          },
        ],
      },
    ],
    patient: {
      reference: `Patient/${patientId}`, // ✅ Associate related person with patient
    },
  }));
};

// ✅ Function to send RelatedPersons to the backend API
export const createRelatedPersons = async (patientId: string, relatedPersons: RelatedPerson[]) => {
  try {
    // Convert input data to FHIR format
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
  } catch (error) {
    console.error("🚨 Error creating related persons:", error);
    throw error;
  }
};

// ✅ Fetch RelatedPersons by patient ID
export const getRelatedPersonsByPatientId = async (patientId: string) => {
  try {
    const response = await axiosIns.get(`${process.env.API_URL}/relatedPerson/patient/${patientId}`);
    return response.data;
  } catch (error) {
    console.error("🚨 Error fetching related persons:", error);
    throw error;
  }
};