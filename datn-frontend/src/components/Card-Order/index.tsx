import { AiOutlineLine, AiOutlinePlus } from 'react-icons/ai'
import { useDeleteCartDBMutation, useUpdateCartDBMutation } from '../../api/cartDB'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { decreamentQuantity, increamentQuantity, updateCart } from '../../store/slices/cart.slice'
import { CartItemState, CartLists } from '../../store/slices/types/cart.type'

import { Select } from 'antd'
import { v4 as uuidv4 } from 'uuid'
import { formatCurrency } from '../../utils/formatCurrency'
import { useState, useEffect, useRef } from 'react'

type CardOrderProps = {
  product: CartLists
}

const CardOrder = ({ product }: CardOrderProps) => {
  const dispatch = useAppDispatch()
  const [updateCartDbFn, updateCartDbRes] = useUpdateCartDBMutation()
  const { user } = useAppSelector((state) => state.persistedReducer.auth)
  const { products } = useAppSelector((state) => state.persistedReducer.products)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, deleteCartDBRes] = useDeleteCartDBMutation()
  const [localQuantities, setLocalQuantities] = useState<{[key: string]: number}>({})
  const timeoutRefs = useRef<{[key: string]: NodeJS.Timeout}>({})
  
  // Initialize local quantities from product items
  useEffect(() => {
    const initialQuantities: {[key: string]: number} = {}
    product?.items?.forEach(item => {
      if (item._id) {
        initialQuantities[item._id] = item.quantity
      }
    })
    setLocalQuantities(initialQuantities)
  }, [product?.items?.map(i => i._id + ':' + i.quantity).join(',')])

  const handleUpdateQuantity = async (action: string, item: CartItemState, index: number) => {
    if (!user._id && !user.accessToken) {
      if (action === 'decreamentQuantity') {
        return dispatch(
          decreamentQuantity({
            index: index,
            name: product.name,
            quantity: item.quantity,
            size: item.size,
            toppings: item.toppings,
            product: item.product,
            sale: item.sale || 0
          })
        )
      } else if (action === 'increamentQuantity') {
        return dispatch(
          increamentQuantity({
            index,
            name: product.name,
            quantity: item.quantity,
            size: item.size,
            toppings: item.toppings,
            product: item.product,
            sale: item.sale || 0
          })
        )
      }
    } else {
      // item.quantity--
      let quantity: number = item.quantity
      action === 'decreamentQuantity' && quantity--
      action === 'increamentQuantity' && quantity++
      const topping = item.toppings
      const priceTopping = topping && topping.length && topping.reduce((acc, item) => item.price + acc, 0)
      quantity = +item.quantity === 1 && action === 'decreamentQuantity' ? 0 : quantity
      return updateCartDbFn({
        quantity,
        _id: product._id as string,
        id: item._id as string,
        total: quantity * item.price + quantity * priceTopping
      })
    }
  }

  const dataSize = products.docs && products.docs.find((item) => item.name === product.name)?.sizes

  const handleChange = (value: string, item: CartItemState, index: number) => {
    const a = dataSize?.find((item) => item._id === value)

    dispatch(
      updateCart({
        index: index,
        name: product.name,
        quantity: item.quantity,
        size: a!,
        toppings: item.toppings,
        product: item.product,
        sale: item.sale || 0
      })
    )
  }

  return (
    <div className='card border border-transparent border-b-[#f1f1f1] tracking-tight py-3'>
      <div className='name font-semibold mb-2'>{product.name?.length > 35 ? product.name?.slice(0,35) +'...' :product.name }</div>
      {product?.items?.length > 0 &&
        product?.items?.map((item, index) => (
            <div className='space-y-2' key={item._id || index}>
            <div className='flex items-center gap-3'>
              <img src={item.image} alt={product.name} className='w-[60px] h-[60px] object-cover rounded' />
              <div className='flex-1'>
                <div className='customize text-[#adaeae] text-xs truncate'>
                  <span className='overflow-hidden truncate'>
                    {item.toppings?.map((topping) => topping?.name).join(', ')}
                  </span>
                </div>
                <div className='flex items-center justify-between mt-1'>
                  <div className='total text-[#8a733f] text-sm'>
                    {formatCurrency(item.price)} x {item.quantity}
                  </div>
                  <div className='flex select-none items-center gap-1'>
                <div
                  className={`quantity w-[24px] cursor-pointer h-[24px] bg-[#799dd9] rounded-full text-white flex justify-center items-center flex-shrink-0 ${
                    (updateCartDbRes.isLoading || deleteCartDBRes.isLoading) && 'cursor-no-drop'
                  }`}
                  onClick={() => handleUpdateQuantity('decreamentQuantity', item, index)}
                >
                  <AiOutlineLine className='text-sm' />
                </div>
                <input
                  type='number'
                  min='1'
                  value={localQuantities[item._id as string] || item.quantity}
                  onChange={(e) => {
                    const inputValue = e.target.value
                    const itemId = item._id as string
                    
                    // Allow empty string for deleting
                    if (inputValue === '') {
                      setLocalQuantities(prev => ({ ...prev, [itemId]: 0 }))
                      return
                    }
                    
                    const newQuantity = parseInt(inputValue)
                    if (isNaN(newQuantity)) return
                    
                    const validQuantity = newQuantity < 1 ? 1 : newQuantity
                    
                    // Update local state immediately for smooth typing
                    setLocalQuantities(prev => ({ ...prev, [itemId]: validQuantity }))
                    
                    // Clear existing timeout
                    if (timeoutRefs.current[itemId]) {
                      clearTimeout(timeoutRefs.current[itemId])
                    }
                    
                    // Set new timeout to update cart after user stops typing
                    timeoutRefs.current[itemId] = setTimeout(() => {
                      if (!user._id && !user.accessToken) {
                        // Update local cart
                        const diff = validQuantity - item.quantity
                        if (diff > 0) {
                          for (let i = 0; i < diff; i++) {
                            dispatch(increamentQuantity({
                              index,
                              name: product.name,
                              quantity: item.quantity,
                              size: item.size,
                              toppings: item.toppings,
                              product: item.product,
                              sale: item.sale || 0
                            }))
                          }
                        } else if (diff < 0) {
                          for (let i = 0; i < Math.abs(diff); i++) {
                            dispatch(decreamentQuantity({
                              index,
                              name: product.name,
                              quantity: item.quantity,
                              size: item.size,
                              toppings: item.toppings,
                              product: item.product,
                              sale: item.sale || 0
                            }))
                          }
                        }
                      } else {
                        // Update DB cart
                        const topping = item.toppings
                        const priceTopping = topping && topping.length && topping.reduce((acc, item) => item.price + acc, 0)
                        updateCartDbFn({
                          quantity: validQuantity,
                          _id: product._id as string,
                          id: item._id as string,
                          total: validQuantity * item.price + validQuantity * priceTopping
                        })
                      }
                    }, 600)
                  }}
                  onBlur={() => {
                    const itemId = item._id as string
                    const currentLocalQty = localQuantities[itemId]
                    
                    // If empty or invalid, reset to 1
                    if (!currentLocalQty || currentLocalQty < 1) {
                      setLocalQuantities(prev => ({ ...prev, [itemId]: 1 }))
                      
                      if (timeoutRefs.current[itemId]) {
                        clearTimeout(timeoutRefs.current[itemId])
                      }
                      
                      if (!user._id && !user.accessToken) {
                        const diff = 1 - item.quantity
                        if (diff < 0) {
                          for (let i = 0; i < Math.abs(diff); i++) {
                            dispatch(decreamentQuantity({
                              index,
                              name: product.name,
                              quantity: item.quantity,
                              size: item.size,
                              toppings: item.toppings,
                              product: item.product,
                              sale: item.sale || 0
                            }))
                          }
                        }
                      } else {
                        const topping = item.toppings
                        const priceTopping = topping && topping.length && topping.reduce((acc, item) => item.price + acc, 0)
                        updateCartDbFn({
                          quantity: 1,
                          _id: product._id as string,
                          id: item._id as string,
                          total: 1 * item.price + 1 * priceTopping
                        })
                      }
                    }
                  }}
                  className='amount w-[65px] text-center text-sm border-0 focus:outline-none py-1'
                  disabled={updateCartDbRes.isLoading || deleteCartDBRes.isLoading}
                />
                <div
                  className={`quantity w-[24px] cursor-pointer h-[24px] bg-[#799dd9] rounded-full text-white flex justify-center items-center flex-shrink-0 ${
                    (updateCartDbRes.isLoading || deleteCartDBRes.isLoading) && 'cursor-no-drop'
                  }`}
                  onClick={() => handleUpdateQuantity('increamentQuantity', item, index)}
                >
                  <AiOutlinePlus className='text-sm' />
                </div>
                </div>
            </div>
          </div>
        </div>
      </div>
        ))}
    </div>
  )
}

export default CardOrder
