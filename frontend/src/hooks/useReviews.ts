import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getReviews, createReview, type DailyReviewData } from '../api/reviews'

export function useReviews(limit?: number) {
  return useQuery({
    queryKey: ['reviews', limit],
    queryFn: () => getReviews(limit),
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: DailyReviewData) => createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}
