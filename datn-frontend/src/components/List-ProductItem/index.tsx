import { AiOutlinePlus } from 'react-icons/ai'
import { IProduct } from '../../interfaces/products.type'
import { formatCurrency } from '../../utils/formatCurrency'
import { useCreateCartDBMutation } from '../../api/cartDB'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addToCart } from '../../store/slices/cart.slice'
import { CartItem } from '../../store/slices/types/cart.type'
import { message } from 'antd'

interface ListProductItemProps {
  product: IProduct
  fetchProductById: (id: number | string) => void
}

const ListProductItem = ({ product, fetchProductById }: ListProductItemProps) => {
  const [addCartDbFn] = useCreateCartDBMutation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.persistedReducer.auth)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation() // Ngăn không cho click vào popup detail
    
    const data = {
      name: product.name,
      size: product.sizes?.[0],
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
      addCartDbFn({
        name: name,
        items: [
          {
            ...rest,
            image: rest.image,
            size: data.size?._id as string,
            toppings: []
          }
        ]
      })
      message.success('Đã thêm vào giỏ hàng!')
    } else {
      dispatch(addToCart(data as CartItem))
      message.success('Đã thêm vào giỏ hàng!')
    }
  }

  return (
    <div
      onClick={() => fetchProductById(product._id)}
      className='select-none w-full  inline-block cursor-pointer hover:bg-[d3b673] product relative sidebar bg-[#fff] p-[15px] tracking-tight text-[14px] mb-3'
    >
      <img
        className='align-middle w-[100%] h-[141px] object-cover rounded-sm'
        src={product?.images[0]?.url}
        alt={product?.name}
      />
      <div className='flex flex-col'>
        <div className='product-name  mt-[20px] mb-[10px] min-h-[42px] flex-1 line-clamp-2'>{product?.name}</div>
        <div className='product-price flex  flex-shrink-0 gap-3 mt-auto'>
          <p className='product-origin-price text-[#8a733f] mb-[20px]'>
            {product?.sale !== 0 && product.sizes
              ? formatCurrency(
                  product.sale
                )
              : formatCurrency(product.sale)}
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
