import { CartItem, CartLists } from './types/cart.type'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { CartDBAPI } from '../../api/cartDB'
import _ from 'lodash'

interface CartState {
  items: CartLists[]
}

const initialState: CartState = {
  items: []
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const product = action.payload

      // Nếu payload không hợp lệ thì dừng (tránh lỗi đọc thuộc tính của undefined)
      if (!product || !product.product) return

      const products = [...state.items]

      // Tìm nhóm sản phẩm theo product id (cùng loại sản phẩm)
      const groupIndex = products.findIndex((grp) => grp.items.some((it) => it.product === product.product))

      // Nếu chưa có nhóm, tạo mới
      if (groupIndex < 0) {
        state.items.push({
          name: product.name,
          items: [
            {
              image: product.image,
              price: product.price,
              quantity: product.quantity,
              size: product.size,
              toppings: product.toppings,
              total: product.total,
              product: product.product,
              sale: product?.sale ? product.sale : 0
            }
          ]
        })
        return
      }

      // Nếu đã có nhóm, tìm item cùng product id, nếu có thì tăng quantity + total, nếu không thì push mới
      const group = products[groupIndex]

      const matchIndex = group.items.findIndex((it) => it.product === product.product)

      if (matchIndex >= 0) {
        // merge quantities/totals
        group.items[matchIndex].quantity += product.quantity
        group.items[matchIndex].total += product.total
      } else {
        // push item mới vào nhóm
        group.items.push({
          image: product.image,
          price: product.price,
          quantity: product.quantity,
          size: product.size,
          toppings: product.toppings,
          total: product.total,
          product: product.product,
          sale: product?.sale ? product.sale : 0
        })
      }

      state.items = products
    },
    increamentQuantity: (
      state,
      action: PayloadAction<{
        index: number
        name: string
        quantity: number
        size?: { _id: string; name: string; price: number }
        toppings: { name: string; price: number }[]
        product?: string
        sale: number
      }>
    ) => {
      const payload = action.payload
      const products = [...state.items]
      /* tìm ra sản phẩm muốn tăng số lượng */
      const productIndex = products.findIndex((item) => item.name === payload.name)
      if (productIndex >= 0) {
        if (payload.toppings.length === 0) {
          /* tìm ra size của sản phẩm muốn tăng số lượng */
          state.items[productIndex].items[payload.index].quantity++
          const priceData = (payload.size?.price || payload.quantity) - payload?.sale
          state.items[productIndex].items[payload.index].total += priceData
        } else {
          /* tính tổng tiền của topping đó */
          const totalTopping = payload.toppings.reduce((total, item) => {
            return (total += item.price)
          }, 0)
          state.items[productIndex].items[payload.index].quantity++
          state.items[productIndex].items[payload.index].total += totalTopping + (payload.size?.price || payload.quantity) - payload.sale
        }
      }
    },
    decreamentQuantity: (
      state,
      action: PayloadAction<{
        index: number
        name: string
        quantity: number
        size?: { _id: string; name: string; price: number }
        toppings: { name: string; price: number }[]
        product?: string
        sale: number
      }>
    ) => {
      const result = action.payload
      const products = [...state.items]
      /* tìm ra sản phẩm muốn tăng số lượng */
      const productIndex = products.findIndex((item) => item.name === result.name)
      if (productIndex >= 0) {
        if (result.toppings.length === 0) {
          /* tìm ra size của sản phẩm muốn tăng số lượng */
          state.items[productIndex].items[result.index].quantity--
          const priceSize = (result.size?.price || result.quantity) - result.sale
          state.items[productIndex].items[result.index].total -= priceSize
          if (state.items[productIndex].items[result.index].quantity === 0) {
            state.items[productIndex].items.splice(result.index, 1)
            if (state.items[productIndex].items.length === 0) {
              state.items.splice(productIndex, 1)
            }
          }
        } else {
          /* tính tổng tiền của topping đó */
          const totalTopping = result.toppings.reduce((total, item) => {
            return (total += item.price)
          }, 0)
          state.items[productIndex].items[result.index].quantity--
          state.items[productIndex].items[result.index].total -= totalTopping + (result.size?.price || result.quantity) - result.sale
          if (state.items[productIndex].items[result.index].quantity === 0) {
            state.items[productIndex].items.splice(result.index, 1)
            if (state.items[productIndex].items.length === 0) {
              state.items.splice(productIndex, 1)
            }
          }
        }
      }
    },
    updateCart: (
      state,
      action: PayloadAction<{
        index: number
        name: string
        quantity: number
        size?: { _id: string; name: string; price: number }
        toppings: { name: string; price: number }[]
        product?: string
        sale: number
      }>
    ) => {
      const product = action.payload
      const products = [...state.items]
      const productIndex = products.findIndex((item) => item.name === product.name)
      if (product.size) {
        state.items[productIndex].items[product.index].size = product.size
        state.items[productIndex].items[product.index].price = product.size.price - product.sale
      }
      const totalTopping = product.toppings.reduce((total, item) => {
        return (total += item.price)
      }, 0)

      state.items[productIndex].items[product.index].total =
        totalTopping * product.quantity + ((product.size?.price || product.quantity) - product.sale) * product.quantity
    },
    resetAllCart: (state) => {
      state.items = []
    }
  },

  extraReducers: (builder) => {
    builder.addMatcher(CartDBAPI.endpoints.getAllCartDB.matchFulfilled, (state, { payload }) => {
      state.items = payload.data
    })
  }
})

export const { addToCart, updateCart, resetAllCart, increamentQuantity, decreamentQuantity } = cartSlice.actions

export default cartSlice.reducer
