import omitBy from 'lodash/omitBy'
import { ProductListConfig } from '../interfaces/products.type'
import useQueryParam from './useQueryParam'
import isUndefined from 'lodash/isUndefined'

export type IQueryConfig = {
  [key in keyof ProductListConfig]: string
} & {
  priceRange?: string
  rating?: string
  sortBy?: string
}

export default function useQueryConfig() {
  const queryParams: any = useQueryParam()

  const queryConfig: IQueryConfig = omitBy(
    {
      _page: queryParams._page || 1,
      limit: queryParams.limit || 6,
      searchName: queryParams.searchName,
      c: queryParams.c || '',
      priceRange: queryParams.priceRange,
      rating: queryParams.rating,
      sortBy: queryParams.sortBy
    },
    isUndefined
  )
  return queryConfig
}
