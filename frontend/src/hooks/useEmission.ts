/**
 * @hook useEmission
 * @description Manages emission data using TanStack Query (React Query).
 * * WHY TANSTACK QUERY INSTEAD OF USEEFFECT?
 * 1. Declarative Data Fetching: We describe 'what' data we need (queryKey: ['emissions']), 
 * and TanStack handles the 'how' (fetching, retrying, and caching).
 * 2. Server State Management: Unlike useState, this manages a 'cache' that stays 
 * in sync with the Django backend without manual refresh logic.
 * 3. Invalidation Pattern: When a mutation (Add/Delete) succeeds, we 'invalidate' 
 * the cache, triggering an automatic, background re-fetch to keep the UI truthful.
 * 4. UX: Provides built-in 'isLoading' and 'isFetching' states for skeleton loaders.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emissionService } from '../api/emissionServices';

export const useEmission = (startDate?: string, endDate?: string, page: number = 1) => {
  const queryClient = useQueryClient();

  // 1. Fetching Data (The "Read" part of CRUD) - Now with pagination
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['emissions', startDate, endDate, page],
    queryFn: () => emissionService.getLogs(startDate, endDate, page),
    retry: 2,
  });

  const logs = data?.results || [];
  const totalCount = data?.count || 0;
  const hasNext = data?.next !== null;
  const hasPrevious = data?.previous !== null;

  // 2. Deleting Data (The "Delete" part of CRUD)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => emissionService.deleteLog(id),
    onSuccess: () => {
      // This is the magic: It tells the 'emissions' query to refresh itself
      queryClient.invalidateQueries({ queryKey: ['emissions'] });
    },
  });
  
  // 3. Adding Data (The "Create" part of CRUD) - Optional, but shows how to extend
  const addMutation = useMutation({
    mutationFn: (newLog: { date: string; category: number; quantity: number; note?: string }) => 
                  emissionService.createLog(newLog),
    onSuccess: () => {
      // This is the trigger that makes the list and charts update instantly
      queryClient.invalidateQueries({ queryKey: ['emissions'] });
    },
  });

  return { 
    logs, 
    totalCount,
    hasNext,
    hasPrevious,
    loading: isLoading, 
    error: isError ? "Failed to sync with server" : null,
    refetch,
    deleteLog: deleteMutation.mutate, // This replaces your old deleteLog
    addLog: addMutation.mutate, // This replaces your old addLog
    isAdding: addMutation.isPending, // Optional: can be used to disable form while adding
  };
};