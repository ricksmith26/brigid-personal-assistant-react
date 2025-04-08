export type Telecom = {
  system: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
  value: string;
  use?: "home" | "work" | "temp" | "old" | "mobile";
};

export type Address = {
  line: string[];
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type Name = {
  use: "usual" | "official" | "temp" | "nickname" | "anonymous" | "old" | "maiden";
  family: string;
  given: string[];
};

export type FhirPatient = {
  resourceType: "Patient";
  id: string;
  name: Name[];
  gender: "male" | "female" | "other" | "unknown";
  birthDate: string;
  address: Address[];
  telecom: Telecom[];
  active: boolean;
};