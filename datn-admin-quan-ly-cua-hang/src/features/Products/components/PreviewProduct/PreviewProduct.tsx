import './style.module.css'

import { Drawer, Table, Tag, Divider, Badge } from 'antd'
import { RootState, useAppDispatch } from '~/store/store'
import { setOpenDrawer, setProductDetail } from '~/store/slices'

import { BiSolidDiscount } from 'react-icons/bi'
import { AiOutlineTag, AiOutlineCalendar } from 'react-icons/ai'
import { formatCurrency } from '~/utils'
import parse from 'html-react-parser'
import { useAppSelector } from '~/store/hooks'
import { v4 as uuidv4 } from 'uuid'

const PreviewProduct = () => {
  const dispatch = useAppDispatch()
  const { openDrawer } = useAppSelector((state: RootState) => state.drawer)
  const { product } = useAppSelector((state: RootState) => state.products)

  if (!product) return null

  const columns = [
    {
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className='max-w-[200px] capitalize'>{name}</span>
    },
    {
      dataIndex: 'price',
      key: 'price',
      width: 200,
      render: (price: number) => <span className='max-w-[200px]'>{formatCurrency(price)}</span>
    }
  ]

  return (
    <Drawer
      title={
        <div className='flex items-center gap-2'>
          <span className='text-xl font-semibold'>Chi tiết sản phẩm</span>
          {product?.is_active ? (
            <Tag color='success'>Đang hoạt động</Tag>
          ) : (
            <Tag color='error'>Ngừng hoạt động</Tag>
          )}
        </div>
      }
      placement='right'
      open={product ? openDrawer : false}
      width={900}
      onClose={() => {
        dispatch(setOpenDrawer(false)), dispatch(setProductDetail(null))
      }}
      className='product-detail-drawer'
    >
      <div className='flex flex-col gap-6'>
        {/* Product Header Section */}
        <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 shadow-sm'>
          <div className='flex gap-6'>
            {/* Product Image */}
            <div className='flex-shrink-0'>
              <img
                src={product?.images[0].url}
                alt={product?.name}
                className='w-[280px] h-[280px] rounded-xl object-cover shadow-lg border-4 border-white hover:scale-105 transition-transform duration-300'
              />
            </div>

            {/* Product Info */}
            <div className='flex-1 flex flex-col gap-4'>
              <div>
                <h1 className='text-3xl font-bold text-gray-800 capitalize leading-tight mb-3'>
                  {product.name}
                </h1>
                
                {/* Category Badge */}
                <div className='flex items-center gap-2 mb-3'>
                  <AiOutlineTag className='text-blue-500' size={18} />
                  <Tag color='blue' className='text-sm px-3 py-1'>
                    {product.category?.name}
                  </Tag>
                </div>

                {/* Created Date */}
                <div className='flex items-center gap-2 text-sm text-gray-500'>
                  <AiOutlineCalendar size={16} />
                  <span>Ngày tạo: {new Date(product.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              <Divider className='my-2' />

              {/* Price Section */}
              <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 shadow-sm border border-green-100'>
                <div className='flex items-center gap-3'>
                  <div className='bg-green-100 p-2 rounded-full'>
                    <svg className='w-7 h-7 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 mb-1'>Giá sản phẩm</p>
                    <p className='text-3xl font-bold text-green-600'>
                      {product?.sale > 0 ? formatCurrency(product.sale) : 'Chưa có giá'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating Section */}
              {product.averageRating > 0 && (
                <div className='bg-yellow-50 rounded-lg p-3 border border-yellow-200'>
                  <div className='flex items-center gap-2'>
                    <span className='text-2xl'>⭐</span>
                    <div>
                      <p className='font-semibold text-gray-800'>
                        {product.averageRating.toFixed(1)} / 5.0
                      </p>
                      <p className='text-xs text-gray-500'>
                        {product.totalReviews} đánh giá
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
            <span className='w-1 h-6 bg-blue-600 rounded'></span>
            Mô tả sản phẩm
          </h2>
          <div className='prose max-w-none text-gray-700 leading-relaxed'>
            {parse(product.description)}
          </div>
        </div>

        {/* Additional Images */}
        {product?.images && product.images.length > 1 && (
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2'>
              <span className='w-1 h-6 bg-purple-600 rounded'></span>
              Hình ảnh khác
            </h2>
            <div className='grid grid-cols-4 gap-4'>
              {product.images.slice(1).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`${product.name} ${index + 2}`}
                  className='w-full h-32 object-cover rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer'
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}

export default PreviewProduct
