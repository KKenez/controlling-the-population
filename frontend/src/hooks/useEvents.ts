import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEvents, syncCalendars, createEvent, updateEvent, deleteEvent, type CreateEventPayload } from '../api/calendar'

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

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEventPayload) => createEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateEventPayload }) => updateEvent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
