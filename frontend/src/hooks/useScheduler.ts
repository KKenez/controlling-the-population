import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSchedulerConfig, updateSchedulerConfig, getGenerationLogs, type SchedulerConfig } from '../api/scheduler'

export function useSchedulerConfig() {
  return useQuery({
    queryKey: ['scheduler-config'],
    queryFn: getSchedulerConfig,
  })
}

export function useUpdateSchedulerConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<SchedulerConfig>) => updateSchedulerConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduler-config'] })
    },
  })
}

export function useGenerationLogs(limit?: number) {
  return useQuery({
    queryKey: ['generation-logs', limit],
    queryFn: () => getGenerationLogs(limit),
  })
}
