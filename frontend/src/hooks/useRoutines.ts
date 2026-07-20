import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRoutines, createRoutine, updateRoutine, deleteRoutine } from '../api/routines'
import type { Routine } from '../types/routine'

export function useRoutines() {
  return useQuery({
    queryKey: ['routines'],
    queryFn: getRoutines,
  })
}

export function useCreateRoutine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Routine, 'id'>) => createRoutine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] })
    },
  })
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Routine, 'id'>> }) =>
      updateRoutine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] })
    },
  })
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRoutine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] })
    },
  })
}
