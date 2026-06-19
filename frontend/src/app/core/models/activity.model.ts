export interface Activity {
  id: number;
  session_id: string;
  type: ActivityType;
  sub_type: string;
  value: number;
  unit: string;
  co2e: number;
  date: string;
  notes: string;
  created_at: string;
}

export type ActivityType = 'transport' | 'electricity' | 'food' | 'waste';

export interface CreateActivityDto {
  type: ActivityType;
  sub_type: string;
  value: number;
  unit: string;
  date: string;
  notes?: string;
}

export interface ActivitySubType {
  key: string;
  label: string;
  factor: number;
  unit: string;
  icon: string;
}

export interface ActivityListResponse {
  data: Activity[];
  total: number;
  limit: number;
  offset: number;
}
