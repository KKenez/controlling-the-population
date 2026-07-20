import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEvents, syncCalendars } from '../api/calendar'

export function useEvents(params?: { start?: string; end?: string; source?: string }) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => getEvents(params),
  })
}

export function useSyncCalendars() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: syncCalendars,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
