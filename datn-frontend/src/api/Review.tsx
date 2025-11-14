import { IReview, IReviewDocs, ICreateReview, IUpdateReview, ICheckPurchase } from '../interfaces/review.type'
import { baseQueryWithReauth } from './Auth'
import { createApi } from '@reduxjs/toolkit/query/react'

export const ApiReview = createApi({
  reducerPath: 'ApiReview',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['review', 'product'],
  // Refetch on reconnect cho realtime tốt hơn
  refetchOnReconnect: true,
  refetchOnFocus: false, // Tắt vì socket đã xử lý realtime
  endpoints: (builder) => ({
    // Lấy tất cả đánh giá của một sản phẩm
    getReviewsByProduct: builder.query<IReviewDocs, { productId: string; page?: number; limit?: number; rating?: number }>({
      query: ({ productId, page = 1, limit = 10, rating }) => {
        const params = new URLSearchParams({
          _page: page.toString(),
          _limit: limit.toString(),
        })
        if (rating) params.append('rating', rating.toString())
        return `/api/reviews/product/${productId}?${params.toString()}`
      },
      providesTags: (result, error, { productId }) =>
        result?.docs
          ? [
              ...result.docs.map(({ _id }) => ({ type: 'review' as const, id: _id })),
              { type: 'review', id: `product-${productId}` },
            ]
          : [{ type: 'review', id: `product-${productId}` }],
      // Cache ngắn hơn cho dữ liệu realtime
      keepUnusedDataFor: 10, // Cache 10s thay vì 30s
    }),

    // Kiểm tra user đã mua sản phẩm chưa
    checkUserPurchasedProduct: builder.query<{ message: string; data: ICheckPurchase }, string>({
      query: (productId) => `/api/reviews/check-purchase/${productId}`,
    }),

    // Lấy đánh giá của user cho một sản phẩm
    getUserReviewForProduct: builder.query<{ message: string; data: IReview | null }, string>({
      query: (productId) => `/api/reviews/user/product/${productId}`,
      providesTags: (result, error, productId) => [{ type: 'review', id: `user-product-${productId}` }],
    }),

    // Lấy danh sách reviews theo order ID
    getReviewsByOrder: builder.query<{ message: string; data: IReview[] }, string>({
      query: (orderId) => `/api/reviews/order/${orderId}`,
      providesTags: (result, error, orderId) => [
        { type: 'review', id: `order-${orderId}` },
        ...(result?.data?.map(review => ({ type: 'review' as const, id: review._id })) || [])
      ],
    }),

    // Tạo đánh giá mới
    createReview: builder.mutation<{ message: string; data: IReview }, ICreateReview>({
      query: (body) => ({
        url: '/api/review',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { product, order }) => [
        { type: 'review', id: `product-${product}` },
        { type: 'review', id: `user-product-${product}` },
        { type: 'review', id: `check-purchase-${product}` },
        { type: 'review', id: `order-${order}` },
        { type: 'review', id: 'List' },
        { type: 'product', id: product },
        { type: 'product', id: 'List' },
      ],
    }),

    // Cập nhật đánh giá
    updateReview: builder.mutation<{ message: string; data: IReview }, { reviewId: string; data: IUpdateReview }>({
      query: ({ reviewId, data }) => ({
        url: `/api/review/${reviewId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { reviewId }) => {
        if (result?.data) {
          return [
            { type: 'review', id: reviewId },
            { type: 'review', id: 'List' },
            { type: 'review', id: `product-${result.data.product}` },
            { type: 'review', id: `user-product-${result.data.product}` },
          ]
        }
        return [
          { type: 'review', id: reviewId },
          { type: 'review', id: 'List' },
        ]
      },
    }),

    // Xóa đánh giá
    deleteReview: builder.mutation<{ message: string; data: IReview }, string>({
      query: (reviewId) => ({
        url: `/api/review/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, reviewId) => {
        if (result?.data) {
          return [
            { type: 'review', id: reviewId },
            { type: 'review', id: 'List' },
            { type: 'review', id: `product-${result.data.product}` },
            { type: 'review', id: `user-product-${result.data.product}` },
          ]
        }
        return [
          { type: 'review', id: reviewId },
          { type: 'review', id: 'List' },
        ]
      },
    }),

    // Ẩn/Hiện đánh giá (toggle visibility)
    toggleReviewVisibility: builder.mutation<{ message: string; data: IReview; status: string }, string>({
      query: (reviewId) => ({
        url: `/api/review/${reviewId}/toggle-visibility`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, reviewId) => {
        if (result?.data) {
          return [
            { type: 'review', id: reviewId },
            { type: 'review', id: 'List' },
            { type: 'review', id: `product-${result.data.product}` },
            { type: 'review', id: `user-product-${result.data.product}` },
          ]
        }
        return [
          { type: 'review', id: reviewId },
          { type: 'review', id: 'List' },
        ]
      },
    }),
  }),
})

export const {
  useGetReviewsByProductQuery,
  useCheckUserPurchasedProductQuery,
  useGetUserReviewForProductQuery,
  useGetReviewsByOrderQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useToggleReviewVisibilityMutation,
} = ApiReview

