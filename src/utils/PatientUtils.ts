export const convertToFhirPatient = (formData: any) => ({
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