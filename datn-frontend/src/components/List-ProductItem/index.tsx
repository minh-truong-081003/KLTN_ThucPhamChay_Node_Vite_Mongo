import { AiOutlinePlus, AiOutlineHeart, AiFillHeart } from 'react-icons/ai'
import { IProduct } from '../../interfaces/products.type'
import { formatCurrency } from '../../utils/formatCurrency'
import { useCreateCartDBMutation } from '../../api/cartDB'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addToCart } from '../../store/slices/cart.slice'
import { CartItem } from '../../store/slices/types/cart.type'
import { message } from 'antd'
import { useGetAllCartDBQuery } from '../../api/cartDB'
import {
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
  useCheckFavoriteQuery
} from '../../api/favorite.api'

interface ListProductItemProps {
  product: IProduct
  fetchProductById: (id: number | string) => void
}

const ListProductItem = ({ product, fetchProductById }: ListProductItemProps) => {
  const [createCartDbFn] = useCreateCartDBMutation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.persistedReducer.auth)
  const { refetch: refetchCart } = useGetAllCartDBQuery(undefined, {
    skip: !user?.accessToken
  })

  const [addToFavorites, { isLoading: isAdding }] = useAddToFavoritesMutation()
  const [removeFromFavorites, { isLoading: isRemoving }] = useRemoveFromFavoritesMutation()
  const { data: favoriteData } = useCheckFavoriteQuery(product._id, {
    skip: !user?.accessToken
  })
  const isFavorite = favoriteData?.isFavorite || false

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation() // Ngăn không cho click vào popup detail

    if (!user?.accessToken) {
      message.warning('Vui lòng đăng nhập để sử dụng tính năng này')
      return
    }

    try {
      if (isFavorite) {
        await removeFromFavorites(product._id).unwrap()
        message.success('Đã bỏ khỏi danh sách yêu thích')
      } else {
        await addToFavorites({ productId: product._id }).unwrap()
        message.success('Đã thêm vào danh sách yêu thích')
      }
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng thử lại')
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation() // Ngăn không cho click vào popup detail

    const data = {
      name: product.name,
      size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined,
      toppings: [],
      quantity: 1,
      image: product.images[0]?.url ?? '',
      price: product.sale as number,
      total: product.sale * 1,
      product: product._id,
      sale: 0
    }

    if (user._id !== '' && user.accessToken !== '') {
      const { sale, name, ...rest } = data
      createCartDbFn({
        name: product.name,
        items: [
          {
            ...rest,
            image: rest.image,
            toppings: []
          }
        ]
      })
      // Do not dispatch local add, let refetch update
      message.success('Đã thêm vào giỏ hàng!')
    } else {
      dispatch(addToCart(data as CartItem))
      message.success('Đã thêm vào giỏ hàng!')
    }
  }

  return (
    <div
      onClick={() => fetchProductById(product._id)}
      className='select-none w-full block cursor-pointer hover:bg-[#d3b673] product relative sidebar bg-[#fff] p-[15px] tracking-tight text-[14px] mb-3'
    >
      <img
        className='align-middle w-[100%] h-[141px] object-cover rounded-sm'
        src={product?.images?.[0]?.url || '/placeholder-image.png'}
        alt={product?.name}
        onError={(e) => {
          e.currentTarget.src = '/placeholder-image.png'
        }}
      />

      {/* Favorite Icon */}
      <div
        onClick={handleToggleFavorite}
        className={`absolute top-[10px] right-[10px] w-[24px] h-[24px] bg-white bg-opacity-80 rounded-full flex justify-center items-center cursor-pointer hover:bg-opacity-100 transition-all duration-200 ${isAdding || isRemoving ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isFavorite ? (
          <AiFillHeart className='text-red-500 text-[16px]' />
        ) : (
          <AiOutlineHeart className='text-gray-600 text-[16px]' />
        )}
      </div>

      <div className='flex flex-col'>
        <div className='product-name  mt-[20px] mb-[10px] min-h-[42px] flex-1 line-clamp-2'>{product?.name}</div>
        <div className='product-price flex  flex-shrink-0 gap-3 mt-auto'>
          <p className='product-origin-price text-[#8a733f] mb-[20px]'>
            {product?.sale !== 0 && product.sizes ? formatCurrency(product.sale) : formatCurrency(product.sale)}
          </p>
          {/* {product?.sale !== 0 && (
            <span className='text-[#bebebe] text-[13px] line-through'>
              {formatCurrency(product.sale)}
            </span>
          )} */}
        </div>
      </div>
      <div
        onClick={handleAddToCart}
        className='quantity w-[28px] h-[28px] bg-[#799dd9] rounded-full text-white absolute right-[15px] bottom-[15px] flex justify-around items-center cursor-pointer hover:bg-[#4ade80] hover:scale-110 transition-all duration-200 active:scale-95'
      >
        <AiOutlinePlus className='text-[16px]' />
      </div>
    </div>
  )
}

export default ListProductItem
