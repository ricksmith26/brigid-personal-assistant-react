import { RelatedPerson } from "../types/FhirRelatedPerson";

export const createFhirRelatedPersons = (patientId: string, relatedPersons: RelatedPerson[]) => {
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