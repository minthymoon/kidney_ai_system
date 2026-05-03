export interface StatsI {
  stats: {
    total_patients: number;
    total_scans: number;
    pending_scans: number;
  };
  recent_activity: any[];
}
