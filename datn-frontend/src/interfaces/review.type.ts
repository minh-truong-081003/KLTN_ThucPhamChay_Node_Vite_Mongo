import { IProduct } from './products.type'
import { IUser } from './user.type'

export interface IReview {
  _id: string
  user: IUser
  product: IProduct | string
  order?: {
    _id: string
    status: string
    createdAt: string
  }
  rating?: number
  comment: string
  images: Array<{
    url: string
    publicId: string
    filename: string
  }>
  parent_review?: string | null
  replies?: IReview[]
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

export interface ICreateReview {
  product: string
  order: string
  rating: number
  comment?: string
  images?: Array<{
    url: string
    publicId: string
    filename: string
  }>
}

export interface IUpdateReview {
  rating?: number
  comment?: string
  images?: Array<{
    url: string
    publicId: string
    filename: string
  }>
}

export interface ICheckPurchase {
  canReview: boolean
  orderId?: string
}

