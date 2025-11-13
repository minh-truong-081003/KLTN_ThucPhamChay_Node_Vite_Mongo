import { IProduct } from '../Products/product.type'
import { IUser } from '../Users/user.type'

export interface IReview {
  _id: string
  user: IUser
  product: IProduct | string
  order: {
    _id: string
    status: string
    createdAt: string
    total?: number
  }
  rating: number
  comment?: string
  images?: Array<{
    url: string
    publicId: string
    filename: string
  }>
  is_active: boolean
  is_deleted: boolean
  createdAt: string
  updatedAt: string
}

export interface IReviewDocs {
  docs: IReview[]
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

export interface IReviewDataType {
  key: string
  index: number
  user: string
  product: string
  rating: number
  comment: string
  createdAt: string
  is_active: boolean
}

