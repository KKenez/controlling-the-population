import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGoals, createGoal, updateGoal, deleteGoal } from '../api/goals'
import type { Goal } from '../types/goals'

export function useGoals(status?: string) {
  return useQuery({
    queryKey: ['goals', status],
    queryFn: () => getGoals(status),
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Goal, 'id' | 'createdAt' | 'routineCount'>) => createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Goal, 'id' | 'createdAt' | 'routineCount'>> }) =>
      updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
