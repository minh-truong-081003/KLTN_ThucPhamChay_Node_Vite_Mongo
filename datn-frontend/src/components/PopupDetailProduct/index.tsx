import { FaAngleDown, FaTimes } from 'react-icons/fa'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { useEffect, useState } from 'react'

import { CartItem } from '../../store/slices/types/cart.type'
import { IProduct } from '../../interfaces/products.type'
import { addToCart } from '../../store/slices/cart.slice'
import { formatCurrency } from '../../utils/formatCurrency'
import styles from './PopupDetailProduct.module.scss'
import { useCreateCartDBMutation } from '../../api/cartDB'
import { v4 as uuidv4 } from 'uuid'
import ProductReviews from '../ProductReviews'
import { useGetReviewsByProductQuery } from '../../api/Review'

type PopupDetailProductProps = {
  showPopup: boolean
  togglePopup: () => void
  product: IProduct
}

const PopupDetailProduct = ({ showPopup, togglePopup, product }: PopupDetailProductProps) => {
  const dispatch = useAppDispatch()
  /* set state trạng thái */
  const [price, setPrice] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(1)
  const [totalToppingPrice, setTotalToppingPrice] = useState<number>(0)
  const [addCartDbFn] = useCreateCartDBMutation()
  const [sizes, setSizes] = useState<{ name: string; price: number }[]>([])

  // const [nameRadioInput, setNameRadioInput] = useState<string>(product.sizes[0].name);
  const [nameRadioInput, setNameRadioInput] = useState<{
    name: string
    price: number
    _id?: string
  }>()
  const [checkedToppings, setCheckedToppings] = useState<{ name: string; price: number; _id: string }[]>([])
  const [showReviews, setShowReviews] = useState(false)

  const { user } = useAppSelector((state) => state.persistedReducer.auth)

  // Lấy tất cả reviews để tính rating chính xác
  const { data: allReviewsData } = useGetReviewsByProductQuery({
    productId: product._id,
    page: 1,
    limit: 1000,
    rating: undefined,
  })

  // Tính lại averageRating từ reviews thực tế
  const calculateRating = () => {
    const allReviews = allReviewsData?.docs || []
    if (allReviews.length === 0) {
      return {
        averageRating: product.averageRating || 0,
        totalReviews: product.totalReviews || 0,
      }
    }
    const totalRating = allReviews.reduce((sum, review) => sum + (review.rating || 0), 0)
    const averageRating = parseFloat((totalRating / allReviews.length).toFixed(1))
    return {
      averageRating,
      totalReviews: allReviews.length,
    }
  }

  const { averageRating, totalReviews } = calculateRating()
  /* xử lý sự kiện check box phân topping */
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const toppingPrice = Number(event.target.value)
    const toppingName = event.target.name
    const _idTopping = event.target.getAttribute('data-items') as string

    const data = { name: toppingName, price: toppingPrice, _id: _idTopping }
    if (event.target.checked) {
      setTotalToppingPrice((prev) => prev + toppingPrice)
      setPrice((prev) => prev + toppingPrice)
      setCheckedToppings((prev) => [...prev, data])
    } else {
      setTotalToppingPrice((prev) => prev - toppingPrice)
      setPrice((prev) => prev - toppingPrice)
      setCheckedToppings((prev) => {
        return prev.filter((topping) => topping.name !== toppingName)
      })
    }
  }
  // const handleGetInfoPrd = (data: any) => {

  // }
  console.log(product,'productproductproduct')
  useEffect(() => {
    if (product.sizes) {
      console.log(product?.sale,'product?.sale')
      setPrice(product?.sale ?? 0)
      setNameRadioInput(product?.sizes[0] ?? { name: '', price: 0 })
      setSizes([...product.sizes])
    }
    setQuantity(1)
    setTotalToppingPrice(0)
    setCheckedToppings([])
    // setNameRadioInput(product.sizes[0].name);

    //reset checkbox when popup close
    // const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    // checkboxes.forEach((item: any) => (item.checked = false));
  }, [product])

  const handleAddToCart = () => {
    togglePopup()
    const data = {
      name: product.name,
      size: nameRadioInput,
      toppings: checkedToppings,
      quantity,
      image: product.images[0]?.url ?? '',
      price: (product.sale) as number,
      total: product.sale * quantity,
      product: product._id,
      sale:  0
    }

    if (user._id !== '' && user.accessToken !== '') {
      const { sale, name, ...rest } = data
      addCartDbFn({
        name: name,
        items: [
          {
            ...rest,

            image: rest.image,
            size: data.size?._id as string,
            toppings: data.toppings.map((item) => item?._id as string)
          }
        ]
      })
    } else {
      dispatch(addToCart(data as CartItem))
    }
  }
  if (!product) return null

  return (
    <div
      className={`transition-opacity ease-in-out duration-[400ms] z-[11] ${
        showPopup ? 'opacity-1 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className='popup w-[90vw] h-[100vw] md:w-[650px] md:h-[500px] fixed top-[20%] left-[5vw] md:top-[calc(50%-500px)] lg:top-[calc(50%-250px)] md:left-[calc(50%-325px)] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.06)] rounded-[3px] pt-[10px] pb-[10px] flex justify-center z-[5] bg-[#fbfbfb]'>
        <div onClick={togglePopup} className='close-btn absolute top-2 right-2 cursor-pointer z-[6]'>
          <FaTimes className='text-2xl font-[900] transition-all hover:scale-[1.2]' />
        </div>

        <div className='content w-full overflow-hidden'>
          <div className='flex flex-col h-full rounded-md'>
            <div className='info flex px-5 pb-3'>
              <div className='left flex-1 md:flex-none w-[150px] h-[150px] md:w-[180px] md:h-[180px]'>
                <img
                  className='w-full h-full rounded-md max-w-[150px] max-h-[150px] md:max-w-[180px] md:max-h-[180px]'
                  src={product?.images[0]?.url}
                  alt='product image'
                />
              </div>
              <div className='right md:flex-none flex-1 ml-4'>
                <div className='title mr-4'>
                  <h4 className='line-clamp-2 text-lg font-semibold'>{product.name?.length > 35 ? product.name?.slice(0,35) +'...' :product.name }</h4>
                </div>
                {/* Rating display */}
                <div className='rating flex items-center gap-2 mt-2'>
                  <div className='flex items-center'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                      </svg>
                    ))}
                  </div>
                  <span className='text-sm text-gray-600'>
                    {averageRating.toFixed(1)} ({totalReviews} đánh giá)
                  </span>
                  <button
                    onClick={() => setShowReviews(true)}
                    className='text-sm text-blue-500 hover:text-blue-700 underline ml-2'
                  >
                    Xem đánh giá
                  </button>
                </div>
                <div className='price flex items-end mt-4'>
                  {/*  <span className='new-price pr-[10px] text-[#8a733f] font-semibold text-sm'>
                    {product.sale > 0
                      ? formatCurrency(
                          product.sale &&
                            // ? price * ((100 - product.sale) / 100) * quantity
                            (price - product.sale) * quantity
                        )
                      : formatCurrency(price * quantity)}
                  </span>
                  {product.sale ? (
                    <span className='old-price text-xs line-through'>{formatCurrency(price * quantity)}</span>
                  ) : (
                    ''
                  )}
                 {product.sale ? <span className='old-price text-xs line-through'>{formatCurrency(price)}</span> : ''} */}
                </div>
                <div className='quantity md:items-center gap-y-2 md:flex-row flex flex-col items-start mt-5'>
                  <div className='change-quantity flex items-center'>
                    <div
                      onClick={() => (quantity === 1 ? setQuantity(1) : setQuantity((prev) => prev - 1))}
                      className='decrease text-white bg-[#799dd9] w-5 h-5 rounded-[50%] leading-[19px] text-[26px] font-semibold  text-center cursor-pointer select-none '
                    >
                      -
                    </div>
                    <input
                      type='number'
                      min='1'
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1
                        setQuantity(value < 1 ? 1 : value)
                      }}
                      className='amount w-[60px] text-center px-[10px] text-sm border-0 focus:outline-none mx-1'
                    />
                    <div
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className='increase text-white bg-[#799dd9] w-5 h-5 rounded-[50%] leading-[20px] text-[26px] font-semibold  text-center cursor-pointer select-none'
                    >
                      +
                    </div>
                  </div>
                  <button
                    // onClick={() => {
                    //   handleAddToCart()
                    // }}
                    className='cursor-auto btn-price bg-[#d8b979] text-white px-5 h-8 rounded-[32px] leading-[32px] md:ml-[30px] text-sm'
                  >
                    +
                    {product.sale > 0
                      ? formatCurrency(
                          product.sale &&
                            // ? price * ((100 - product.sale) / 100) * quantity
                            (price ) * quantity
                        )
                      : formatCurrency(price * quantity)}
                  </button>
                  <button
                    onClick={() => {
                      handleAddToCart()
                    }}
                    className='btn-price bg-[#028336] hover:bg-[#80bb35] text-white px-5 h-8 rounded-[32px] leading-[32px] md:ml-[10px] text-sm'
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
            <div className={`customize h-1/2 overflow-y-scroll p-5 grow mb-5 ${styles.popup_body}`}>
              <div className='custom-size mb-2'>
                <div className='title flex items-center justify-between px-5 mb-2'>
                  <div className='left text-base font-semibold'>Mô tả sản phẩm</div>
                  <div className='right'>
                    <FaAngleDown />
                  </div>
                </div>
                <div className='custom-content flex px-5 bg-white flex-wrap shadow-[0px_0px_12px_0px_rgba(0,0,0,.05)] rounded'>
                  {product.description}
                  {/* {product &&
                    product.sizes &&
                    sizes.map((item) => {
                      return (
                        <label
                          onChange={() => {
                            setPrice(item.price + totalToppingPrice)
                            setNameRadioInput(item)
                          }}
                          key={uuidv4()}
                          className={`${styles.container_radio} block w-full group`}
                        >
                          <span className='block'>Size {item.name}</span>
                          <input
                            className='absolute opacity-0'
                            defaultChecked={nameRadioInput?.price === item.price ? true : false}
                            type='radio'
                            name='size'
                            value={item.price}
                          />
                          <span className={`${styles.checkmark_radio} group-hover:bg-[#ccc]`}></span>
                        </label>
                      )
                    })} */}
                </div>
              </div>

              {/* <div className='custom-topping'>
                <div className='title flex items-center justify-between px-5 mb-2'>
                  <div className='left text-base font-semibold'>Chọn topping</div>
                  <div className='right'>
                    <FaAngleDown />
                  </div>
                </div>
                <div className='custom-content flex px-5 bg-white flex-wrap shadow-[0px_0px_12px_0_rgba(0,0,0,.05)] rounded'>
                  {product &&
                    product.toppings.map((item) => {
                      return (
                        <div key={item._id} className='topping-wrap flex items-center justify-between w-full'>
                          <label className={`${styles.container_checkbox} group block w-full`}>
                            <span className='text-sm capitalize'>{item.name}</span>
                            <input
                              onChange={(e) => handleCheckboxChange(e)}
                              className='absolute w-0 h-0 opacity-0'
                              type='checkbox'
                              name={item.name}
                              value={item.price}
                              data-items={item._id}
                              checked={checkedToppings.find((topping) => topping.name === item.name) ? true : false}
                            />
                            <span className={`${styles.checkmark_checkbox} group-hover:bg-[#ccc]`}></span>
                          </label>

                          <span className='topping-price text-sm'>{formatCurrency(item.price)}</span>
                        </div>
                      )
                    })}
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
      <div onClick={togglePopup} className={`${styles.overlay}`}></div>

      {/* Reviews Modal */}
      {showReviews && (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center pt-20 pb-6'>
          <div className='absolute inset-0 bg-black bg-opacity-50' onClick={() => setShowReviews(false)}></div>
          <div className='relative bg-white rounded-lg shadow-xl w-[85vw] max-w-3xl max-h-[calc(100vh-120px)] overflow-hidden my-auto'>
            <div className='flex items-center justify-between p-3 border-b bg-gray-50'>
              <h3 className='text-lg font-semibold truncate pr-4'>Đánh giá: {product.name}</h3>
              <button
                onClick={() => setShowReviews(false)}
                className='text-gray-500 hover:text-gray-700 text-xl flex-shrink-0'
              >
                <FaTimes />
              </button>
            </div>
            <div className='overflow-y-auto max-h-[calc(100vh-180px)] p-4'>
              <ProductReviews product={product} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PopupDetailProduct
