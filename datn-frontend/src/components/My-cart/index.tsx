import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { useState } from 'react'

import CardOrder from '../Card-Order'
import { RootState } from '../../store/store'
import Swal from 'sweetalert2'
import { formatCurrency } from '../../utils/formatCurrency'
import { resetAllCart } from '../../store/slices/cart.slice'
import { useCreateCartDBMutation, useDeleteCartDBMutation, useGetAllCartDBQuery } from '../../api/cartDB'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { useGetRecommendationsQuery } from '../../api/Product'
import { Card, Button, Carousel } from 'antd'
import PopupDetailProduct from '../PopupDetailProduct'
import { addToCart } from '../../store/slices/cart.slice'
import { IProduct } from '../../interfaces/products.type'

const MyCart = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items } = useAppSelector((state: RootState) => state.persistedReducer.cart)
  const { user } = useAppSelector((state: RootState) => state.persistedReducer.auth)

  const [deleteCartDBFn, deleteCartDBRes] = useDeleteCartDBMutation()
  const [createCartDbFn] = useCreateCartDBMutation()

  const { refetch: refetchCart } = useGetAllCartDBQuery(undefined, {
    skip: !user?.accessToken
  })

  ;(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const getAllCart = user && user.accessToken ? useGetAllCartDBQuery() : null
    return getAllCart
  })()

  const { data: recommendations, isLoading: isLoadingRecommendations } = useGetRecommendationsQuery(
    { limit: 5 },
    { skip: !user?.accessToken }
  )

  const [isShowPopup, setIsShowPopup] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)

  const openProductPopup = (product: IProduct) => {
    setSelectedProduct(product)
    setIsShowPopup(true)
  }

  const toggleProductPopup = () => {
    setIsShowPopup((prev) => !prev)
    if (isShowPopup) setSelectedProduct(null)
  }

  /* Tính tổng tiền và tổng số lượng quantity */
  const { total, quantity } = items.reduce(
    (accumulator, item) => {
      item.items.forEach((subItem) => {
        accumulator.total += subItem.total
        accumulator.quantity += subItem.quantity
      })
      return accumulator
    },
    { total: 0, quantity: 0 }
  )

  /* xóa tất cả các item có trong cart */
  const handleDeleteAll = (): void => {
    /* confirm lai */
    Swal.fire({
      title: 'Bạn muốn xóa hết tất cả?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đúng!'
    }).then((result) => {
        if (result.isConfirmed) {
        Swal.fire('Xóa!', 'Đã xóa xong.', 'success')
        // Nếu người dùng chưa đăng nhập (không có accessToken) thì reset local cart
        if (!user?.accessToken) {
          dispatch(resetAllCart())
        } else {
          // Người dùng đã đăng nhập => xóa từng bản ghi trên server chỉ khi có _id
          items.forEach((itemcart) => {
            if (itemcart?._id) {
              deleteCartDBFn(itemcart._id as string)
            }
          })
          // Reset local cart để sync
          dispatch(resetAllCart())
        }
      }
    })
  }

  const handleCheckUser = () => {
    if (!user?.accessToken) {
      // Người dùng chưa đăng nhập
      Swal.fire({
        title: 'Yêu cầu đăng nhập',
        text: 'Bạn cần đăng nhập để tiến hành thanh toán',
        icon: 'info',
        confirmButtonText: 'Đăng nhập',
        confirmButtonColor: '#028336'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/signin', { state: { from: '/products/checkout' } })
        }
      })
      return
    }
    
    // Người dùng đã đăng nhập, chuyển đến checkout
    navigate('/products/checkout')
  }

  const handleAddToCart = (product: IProduct) => {
    const cartItem = {
      name: product.name,
      image: product.images?.[0]?.url || '',
      price: product.sale || product.price || 0,
      quantity: 1,
      toppings: [],
      total: product.sale || product.price || 0,
      product: product._id,
      sale: product.sale || 0
    }

    if (user._id !== '' && user.accessToken !== '') {
      const { sale, name, ...rest } = cartItem
      createCartDbFn({
        name: product.name,
        items: [
          {
            ...rest,
            image: rest.image,
            toppings: []
          }
        ]
      }).then(() => {
        // Refetch cart data after adding product
        if (refetchCart) {
          refetchCart()
        }
      })
      // Do not dispatch local add, let refetch update
      Swal.fire('Thành công', 'Đã thêm vào giỏ hàng', 'success')
    } else {
      dispatch(addToCart(cartItem))
      Swal.fire('Thành công', 'Đã thêm vào giỏ hàng', 'success')
    }
  }
  return (
    <div className='sidebar shrink-0 w-[360px] bg-[#fff] text-[14px] rounded-sm mx-[16px] pb-[12px] h-fit hidden lg:block'>
      <div className='border border-transparent border-b-[#f1f1f1]  px-4 py-2 flex justify-between items-center'>
        <div className='uppercase font-semibold'>Giỏ hàng của tôi</div>
        <div
          className={`${items.length > 0 ? 'block' : 'hidden'} text-[11px] cursor-pointer ${
            deleteCartDBRes.isLoading && 'cursor-no-drop'
          }`}
          onClick={() => handleDeleteAll()}
        >
          Xoá tất cả
        </div>
      </div>

      <div className='mx-[16px]'>
        <div className='max-h-[450px] overflow-y-scroll hidden-scroll-bar'>
          {items.length > 0 && items.map((item) => <CardOrder key={uuidv4()} product={item} />)}
        </div>
        <div className='cart '>
          <div className='flex items-center justify-start my-5 cart-ss2'>
            <img
              className='img-toco h-[40px] pr-2'
              src='https://png.pngtree.com/png-clipart/20230801/original/pngtree-vegan-icon-picture-image_7816412.png'
            />
            <span className='pr-2 cart-ss2-one'>x</span>
            <span className='cart-ss2-two pr-2 text-[#028336]'>{quantity}</span>
            <span className='pr-2 cart-ss2-three'>=</span>
            <span className='cart-ss2-four text-[#028336]'>{formatCurrency(total)}</span>
          </div>
          <div className='cart-ss3'>
            {/* <Link to="checkout"> */}
            <button
              disabled={items.length > 0 ? false : true}
              onClick={handleCheckUser}
              className={`bg-[#028336] hover:bg-[#80bb35] text-white text-center rounded-xl py-1 w-full ${
                items.length <= 0 && 'bg-opacity-50'
              }`}
            >
              Thanh toán
            </button>
            {/* </Link> */}
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      {(recommendations?.data && recommendations.data.length > 0) || isLoadingRecommendations ? (
        <div className='mt-4'>
          <div className='border border-transparent border-b-[#f1f1f1] px-4 py-2'>
            <div className='uppercase font-semibold'>Gợi ý cho bạn</div>
          </div>
          <div className='px-4 py-2'>
            {isLoadingRecommendations ? (
              <div className='text-center py-4'>Đang tải gợi ý...</div>
            ) : recommendations?.data && recommendations.data.length > 0 ? (
              <Carousel
                autoplay
                dots={false}
                slidesToShow={Math.min(recommendations.data.length, 3)}
                responsive={[
                  { breakpoint: 768, settings: { slidesToShow: 1 } },
                  { breakpoint: 1024, settings: { slidesToShow: 2 } }
                ]}
              >
                {recommendations.data.map((product) => (
                  <div key={product._id} className='px-1'>
                    <Card
                      className='cursor-pointer hover:shadow-md border-0 shadow-sm'
                      onClick={() => openProductPopup(product)}
                    >
                      <div className='flex flex-col items-center text-center p-2'>
                        <img
                          src={product.images?.[0]?.url || '/default-product.png'}
                          alt={product.name}
                          className='w-16 h-16 object-cover rounded mb-2'
                        />
                        <div className='font-medium text-xs mb-1 line-clamp-2 leading-tight'>{product.name}</div>
                        <div className='text-xs text-yellow-500 mb-1'>⭐ {product.averageRating?.toFixed(1) || 0}</div>
                        <div className='text-sm font-semibold text-green-600 mb-2'>
                          {formatCurrency(product.sale || 0)}
                        </div>
                        <Button
                          type='primary'
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation()
                              handleAddToCart(product)
                          }}
                          onFocus={(e) => {
                            // Prevent focus on hidden slides
                            const slide = e.currentTarget.closest('[aria-hidden="true"]')
                            if (slide) {
                              e.currentTarget.blur()
                            }
                          }}
                          className='w-full text-xs py-1 h-7'
                        >
                          Mua
                        </Button>
                      </div>
                    </Card>
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className='text-center py-4'>Không có gợi ý</div>
            )}
          </div>
        </div>
      ) : null}
      {/* Inline product popup from recommendations */}
      {selectedProduct && (
        <PopupDetailProduct showPopup={isShowPopup} togglePopup={toggleProductPopup} product={selectedProduct} />
      )}
    </div>
  )
}

export default MyCart
