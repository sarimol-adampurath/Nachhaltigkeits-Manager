import { z } from "zod";

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

export const EmissionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  category: z.number().int().positive("Please select a valid category"),
  quantity: z.number().positive("Quantity must be greater than zero"),
  note: z.string().optional(),
});
export type EmissionFormValues = z.infer<typeof EmissionSchema>;