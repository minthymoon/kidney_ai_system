export interface DoctorOverviewI {
  doctor_id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  is_active: boolean;
  number_of_patients: number;
  number_of_scans: number;
  scans: ScanI[];
}

export interface ScanI {
  scan_id: number;
  patient_id: number;
  confidence_score: number;
  image_url: string;
  ai_prediction: string;
  doctor_notes: string | null;
  scan_date: string;
  status: string;
}
