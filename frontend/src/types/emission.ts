export interface EmissionFactor {
  id: number;
  category: string;
  unit: string;
  factor: number;
}

export interface ActivityLog {
  id: number;
  date: string;
  category: number;
  category_name: string;
  quantity: number;
  note: string;
  co2_total: number;
}