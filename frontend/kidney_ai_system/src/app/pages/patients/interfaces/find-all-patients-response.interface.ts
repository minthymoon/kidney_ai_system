export interface FindAllPatientsResponseI {
  first_name: string;
  last_name: string;
  gender: string;
  id: number;
  phone_number: string;
  date_of_birth: string;
  referring_physician: string;
  email?: string;
  address?: string;
  doctor_id?: string;
}
