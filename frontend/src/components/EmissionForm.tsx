import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmissionSchema, type EmissionFormValues } from '../types/emission';
import apiClient from '../api/client';
import { useEffect, useState,} from 'react';

export const EmissionForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EmissionFormValues>({
    resolver: zodResolver(EmissionSchema),
  });

  const [categories, setCategories] = useState<{id: number, category: string, unit: string}[]>([]);
  
  useEffect(() => {
  // Fetching the "Carbon Library" we seeded earlier
  apiClient.get('factors/')
    .then(res => setCategories(res.data))
    .catch(err => console.error("Could not load categories", err));
}, []);

  const onSubmit = async (data: EmissionFormValues) => {
    try {
      await apiClient.post('logs/', data);
      reset(); // Clear form
      onSuccess(); // Refresh the dashboard data
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Log New Activity</h3>
      
      <div>
        <label className="block text-sm font-medium text-slate-700">Category</label>
        <select
          {...register('category', {
            setValueAs: (value) => (value === '' ? undefined : Number(value)),
          })}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.category}</option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Date</label>
          <input type="date" {...register('date')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Quantity</label>
          <input type="number" step="0.01" {...register('quantity', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" />
          {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-xl transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Add Log'}
      </button>
    </form>
  );
};
