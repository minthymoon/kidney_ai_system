export interface StatsI {
  stats: {
    total_patients: number;
    total_scans: number;
    pending_scans: number;
  };
  chart_data: ChartDateI[];
  recent_activity: recentActivityI[];
  trend_chart_data: TrendChartItem[];
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

export interface ChartDateI {
  label: string;
  value: number;
}

export interface TrendChartItem {
  month: string;
  value: number;
}
