import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getQuests, createQuest, updateQuest, deleteQuest } from '../api/quests'
import type { Quest } from '../types/goals'

export function useQuests(status?: string) {
  return useQuery({
    queryKey: ['quests', status],
    queryFn: () => getQuests(status),
  })
}

export function useCreateQuest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Quest, 'id' | 'createdAt' | 'completedAt'>) => createQuest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}

export function useUpdateQuest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Quest, 'id' | 'createdAt' | 'completedAt'>> }) =>
      updateQuest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}

export function useDeleteQuest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteQuest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}
