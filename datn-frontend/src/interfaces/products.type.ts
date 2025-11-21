import { ICategory } from './category.type'
import { IImage } from './image.type'
import { ISize } from './size.type'

export interface IProduct {
  _id: string
  name: string
  images: IImage[]
  description: string
  price: number
  sale: number
  category: ICategory
  sizes: { _id: string; name: string; price: number }[]
  customsizes: { name: string; price: number }[]
  is_deleted?: boolean
  is_active?: boolean
  averageRating?: number
  totalReviews?: number
  createdAt?: string
  updatedAt?: string
}

export interface IProductDocs {
  docs: IProduct[]
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

export interface IAddProduct {
  name: string
  images: IImage[]
  description: string
  price: number
  sale: number
  category: ICategory
  sizes: ISize[]
}

export interface IRecommendationsResponse {
  message: string
  data: IProduct[]
}
