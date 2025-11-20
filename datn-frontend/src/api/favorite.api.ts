import { baseQueryWithReauth } from './Auth'
import { createApi } from '@reduxjs/toolkit/query/react'
import { IProduct } from '../interfaces/products.type'

interface IFavorite {
  _id: string
  user: string
  product: IProduct
  createdAt: string
  updatedAt: string
}

interface IFavoriteResponse {
  docs: IFavorite[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

export const ApiFavorites = createApi({
  reducerPath: 'ApiFavorite',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['favorite'],
  endpoints: (builder) => ({
    // Thêm vào yêu thích
    addToFavorites: builder.mutation<{ message: string; favorite: IFavorite }, { productId: string }>({
      query: ({ productId }) => ({
        url: '/api/favorites',
        method: 'POST',
        body: { productId }
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: 'favorite', id: productId },
        { type: 'favorite', id: 'List' }
      ]
    }),

    // Xóa khỏi yêu thích
    removeFromFavorites: builder.mutation<{ message: string }, string>({
      query: (productId) => ({
        url: `/api/favorites/${productId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (_result, _error, productId) => [
        { type: 'favorite', id: productId },
        { type: 'favorite', id: 'List' }
      ]
    }),

    // Lấy danh sách yêu thích
    getUserFavorites: builder.query<IFavoriteResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => `/api/favorites?_page=${page}&_limit=${limit}`,
      providesTags: [{ type: 'favorite', id: 'List' }]
    }),

    // Kiểm tra sản phẩm có được yêu thích không
    checkFavorite: builder.query<{ isFavorite: boolean }, string>({
      query: (productId) => `/api/favorites/check/${productId}`,
      providesTags: (_result, _error, productId) => [{ type: 'favorite', id: productId }]
    })
  })
})

export const {
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
  useGetUserFavoritesQuery,
  useCheckFavoriteQuery
} = ApiFavorites