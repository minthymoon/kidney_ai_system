export interface StatsI {
  stats: {
    total_patients: number;
    total_scans: number;
    pending_scans: number;
  };
  recent_activity: recentActivityI[];
}

export interface recentActivityI {
  id: number;
  ai_prediction: string;
  doctor_notes?: string;
  confidence_score?: number;
  patient_id?: number;
  image_url: string;
  patient_name: string;
  status: string;
  scan_date: string;
}
