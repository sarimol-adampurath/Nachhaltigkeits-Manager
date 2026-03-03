import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmissionSchema, type EmissionFactor, type EmissionFormValues } from '../types/emission';
import { useQuery } from '@tanstack/react-query';
import { useEmission } from '../hooks/useEmission';
import { emissionService } from '../api/emissionServices';

export const EmissionForm = () => {
  const{addLog, isAdding} = useEmission();
   // Using the new addLog mutation from our hook
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmissionFormValues>({
    resolver: zodResolver(EmissionSchema),
  });  
  const { data: categories = [] } = useQuery({
    queryKey: ['factors'],
    queryFn: () => emissionService.getFactors()
  });
  
  const onSubmit = (data: EmissionFormValues) => {
    // 3. Use the mutation from our hook. 
    // It automatically calls invalidateQueries on success.
    addLog(data, {
      onSuccess: () => {
        reset(); // Clear form only if backend accepts it
      },
    });
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
          className="mt-1 px-3 py-2 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:ring-2 focus:outline-none appearance-none bg-white"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem'
          }}
        >
          <option value="">Select Category</option>
          {categories.map((cat: EmissionFactor) => (
            <option key={cat.id} value={cat.id}>{cat.category}</option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Date</label>
          <input type="date" {...register('date')} className="mt-1 p-1 block w-full rounded-md border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 focus:ring-2 focus:outline-none shadow-sm" />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Quantity</label>
          <input type="number" step="0.01" {...register('quantity', { valueAsNumber: true })} className="mt-1 p-1 block w-full rounded-md border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 focus:ring-2 focus:outline-none shadow-sm" />
          {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isAdding}
        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold 
             rounded-xl shadow-md shadow-emerald-100 transition-all transform active:scale-[0.98] mt-4"
      >
        {isAdding ? 'Saving...' : 'Add Log'}
      </button>
    </form>
  );
};
