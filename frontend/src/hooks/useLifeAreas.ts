import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLifeAreas, createLifeArea, updateLifeArea, deleteLifeArea } from '../api/lifeAreas'
import type { LifeArea } from '../types/routine'

export function useLifeAreas() {
  return useQuery({
    queryKey: ['life-areas'],
    queryFn: getLifeAreas,
  })
}

export function useCreateLifeArea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<LifeArea, 'id' | 'routineCount'>) => createLifeArea(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['life-areas'] })
    },
  })
}

export function useUpdateLifeArea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<LifeArea, 'id' | 'routineCount'>> }) =>
      updateLifeArea(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['life-areas'] })
    },
  })
}

export function useDeleteLifeArea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLifeArea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['life-areas'] })
    },
  })
}
