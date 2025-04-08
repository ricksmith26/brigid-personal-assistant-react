import axiosIns from "../providers/axiosIns";

const VITE_API_URL  = import.meta.env.API_URL; // Ensure your API URL is set in env variables
console.log(VITE_API_URL, "<<VITE_API_URL<")

const convertToFhirPatient = (formData: any) => ({
    resourceType: "Patient",
    id: window.crypto.randomUUID(), // Generate unique ID
    name: [
      {
        use: "official",
        family: formData.Lastname,
        given: [formData.Firstname],
      },
    ],
    gender: "unknown", // Optional: Add gender if needed
    birthDate: `${formData.year}-${formData.month.padStart(2, "0")}-${formData.day.padStart(2, "0")}`,
    address: [
      {
        line: [formData.Street],
        city: formData.County,
        postalCode: formData.Postcode,
        country: "UK", // Change if needed
      },
    ],
    telecom: [
      {
        system: "email",
        value: formData.Email,
        use: "home",
      },
      {
        system: "phone",
        value: formData.Phone,
        use: "mobile",
      },
    ],
    active: true,
  })

export const createPatient = async (formData: {
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
};

export const getPatient = async() => {
  const response = await axiosIns.get(`${process.env.API_URL}/patients/email`)
  return response.data
}