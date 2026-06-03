export interface StatsI {
  total_doctors: number;
  total_patients: number;
  total_scans: number;
  chart_data: ChartDateI[];
  trend_chart_data: TrendChartItem[];
}

export interface ChartDateI {
  label: string;
  value: number;
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

export interface TrendChartItem {
  month: string;
  value: number;
}
