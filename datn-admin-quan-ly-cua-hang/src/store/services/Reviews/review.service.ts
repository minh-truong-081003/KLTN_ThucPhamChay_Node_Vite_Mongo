import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '~/store/store'
import { IReviewDocs } from '~/types'

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const accessToken = (getState() as RootState).persistedReducer.auth.user?.accessToken

      if (accessToken) {
        headers.set('authorization', `Bearer ${accessToken}`)
      }
      return headers
    }
  }),
  tagTypes: ['Review'],
  endpoints: (builder) => ({
    // Lấy tất cả reviews (admin)
    getAllReviews: builder.query<
      IReviewDocs,
      { page?: number; limit?: number; productId?: string; userId?: string; rating?: number; is_active?: boolean; is_deleted?: boolean }
    >({
      query: ({ page = 1, limit = 10, productId, userId, rating, is_active, is_deleted }) => {
        const params = new URLSearchParams({
          _page: page.toString(),
          _limit: limit.toString()
        })
        if (productId) params.append('productId', productId)
        if (userId) params.append('userId', userId)
        if (rating) params.append('rating', rating.toString())
        if (is_active !== undefined) params.append('is_active', is_active.toString())
        if (is_deleted !== undefined) params.append('is_deleted', is_deleted.toString())

        return `/reviews/all?${params.toString()}`
      },
      providesTags: (result) => {
        if (result) {
          const final = [
            ...result.docs.map(({ _id }) => ({ type: 'Review' as const, id: _id })),
            { type: 'Review' as const, id: 'LIST' }
          ]
          return final
        }
        return [{ type: 'Review', id: 'LIST' }]
      }
    }),

    // Xóa review (soft delete)
    deleteReview: builder.mutation<{ message: string; data: any }, { id: string }>({
      query: ({ id }) => ({
        url: `/review/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Review', id: 'LIST' }]
    }),

    // Khôi phục review
    restoreReview: builder.mutation<{ message: string; data: any }, { id: string }>({
      query: ({ id }) => ({
        url: `/reviews/restore/${id}`,
        method: 'PUT',
        body: {}
      }),
      invalidatesTags: [{ type: 'Review', id: 'LIST' }]
    }),

    // Toggle visibility (ẩn/hiện)
    toggleReviewVisibility: builder.mutation<{ message: string; data: any; status: string }, { id: string }>({
      query: ({ id }) => ({
        url: `/review/${id}/toggle-visibility`,
        method: 'PATCH'
      }),
      invalidatesTags: [{ type: 'Review', id: 'LIST' }]
    }),

    // Xóa vĩnh viễn
    forceDeleteReview: builder.mutation<{ message: string; data: any }, { id: string }>({
      query: ({ id }) => ({
        url: `/reviews/force-delete/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'Review', id: 'LIST' }]
    })
  })
})

export const {
  useGetAllReviewsQuery,
  useDeleteReviewMutation,
  useRestoreReviewMutation,
  useToggleReviewVisibilityMutation,
  useForceDeleteReviewMutation
} = reviewApi

