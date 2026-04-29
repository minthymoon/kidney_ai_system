export interface PatientI {
  full_name: string;
  gender: string;
  age?: number;
  id: number;
  phone_number: string;
  email?: string;
  address?: string;
  doctor_id?: string;
}
