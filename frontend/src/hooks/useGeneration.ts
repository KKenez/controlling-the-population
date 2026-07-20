import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generateWeek, getGeneratedWeek, confirmWeek } from '../api/generation'

export function useGenerateWeek() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { routineIds: string[]; weekStart: string }) => generateWeek(data),
    onSuccess: (week) => {
      queryClient.setQueryData(['generation', week.id], week)
    },
  })
}

export function useGeneratedWeek(weekId: string | null) {
  return useQuery({
    queryKey: ['generation', weekId],
    queryFn: () => getGeneratedWeek(weekId!),
    enabled: !!weekId,
  })
}

export function useConfirmWeek() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (weekId: string) => confirmWeek(weekId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
