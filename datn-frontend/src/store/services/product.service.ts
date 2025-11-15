import { createAsyncThunk } from '@reduxjs/toolkit'
import http from '../../api/instance'
import { IProductDocs } from '../../interfaces/products.type'

/* lấy ra tất cả sản phẩm */
export const getAllProducts = createAsyncThunk<
  IProductDocs,
  { 
    page?: number | string
    limit?: number | string
    query?: string
    category?: string
    priceRange?: string
    rating?: number | string
    sortBy?: string
  }
>('product/getAllProducts', async ({ 
  page = 1, 
  limit = 10, 
  query = '', 
  category = '',
  priceRange = '',
  rating = '',
  sortBy = ''
}) => {
  try {
    // Build query params - only add non-empty values
    const params = new URLSearchParams()
    params.append('_page', String(page))
    params.append('_limit', String(limit))
    if (query && query.trim()) params.append('q', query.trim())
    if (category && category.trim()) params.append('c', category.trim())
    if (priceRange && priceRange.trim()) params.append('priceRange', priceRange.trim())
    if (rating && String(rating).trim()) params.append('rating', String(rating))
    if (sortBy && sortBy.trim()) params.append('sortBy', sortBy.trim())

    const url = `/products?${params.toString()}`
    console.log('🟢 API Request URL:', url)
    
    const response = await http.get(url)

    if (response && response.data) {
      return response.data // Assuming your API returns an array of products
    }
  } catch (error) {
    console.error('❌ API Error:', error)
    return error
  }
})
