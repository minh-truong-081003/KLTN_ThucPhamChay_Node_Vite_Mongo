import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Steps, Button as AntButton, Modal, Rate, Input, Upload, message } from 'antd'
import { useGetOrderByidQuery } from '../../store/slices/order'
import { useCreateReviewMutation, useGetReviewsByOrderQuery } from '../../api/Review'
import Loader from '../Loader'
import { Divider } from 'antd'
import { AiFillCreditCard, AiOutlineArrowLeft } from 'react-icons/ai'
import { RiMoneyDollarCircleFill } from 'react-icons/ri'
import { PlusOutlined } from '@ant-design/icons'
import { formatCurrency } from '../../utils/formatCurrency'
import './index.scss'
import { ITopping } from '../../interfaces/topping.type'
import formatDate from '../../utils/formatDate'
import { useState, useEffect, useMemo } from 'react'
import type { UploadFile } from 'antd/es/upload/interface'

const MyOrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const shouldShowReview = searchParams.get('review') === 'true'
  const { data: orderData, isError } = useGetOrderByidQuery(id as string)
  const { data: reviewsData } = useGetReviewsByOrderQuery(id as string, {
    skip: !id || orderData?.order?.status !== 'done'
  })
  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation()
  const [showReviewSection, setShowReviewSection] = useState(false)
  
  // Modal đánh giá
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // Tạo map các sản phẩm đã được đánh giá
  const reviewedProductIds = useMemo(() => {
    if (!reviewsData?.data) return new Set<string>()
    return new Set(reviewsData.data.map(review => review.product._id || review.product))
  }, [reviewsData])

  useEffect(() => {
    if (shouldShowReview && orderData?.order?.status === 'done') {
      setShowReviewSection(true)
      // Scroll to review section
      setTimeout(() => {
        const reviewSection = document.getElementById('review-section')
        if (reviewSection) {
          reviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    }
  }, [shouldShowReview, orderData])

  const handleOpenReviewModal = (product: any) => {
    setSelectedProduct(product)
    setIsReviewModalOpen(true)
    setRating(5)
    setComment('')
    setFileList([])
  }

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false)
    setSelectedProduct(null)
    setRating(5)
    setComment('')
    setFileList([])
  }

  const handleSubmitReview = async () => {
    if (!selectedProduct || !rating) {
      message.error('Vui lòng chọn số sao đánh giá!')
      return
    }

    try {
      const reviewData = {
        product: selectedProduct.product._id,
        order: id!,
        rating,
        comment: comment.trim(),
        images: fileList.map(file => ({
          url: file.url || file.thumbUrl || '',
          publicId: file.uid,
          filename: file.name
        }))
      }
      
      await createReview(reviewData).unwrap()
      
      message.success('Cảm ơn bạn đã đánh giá! Đánh giá của bạn rất có ý nghĩa với chúng tôi.')
      handleCloseReviewModal()
      
    } catch (error: any) {
      console.error('Error submitting review:', error)
      const errorMessage = error?.data?.err || error?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá!'
      message.error(errorMessage)
    }
  }

  const handleUploadChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList)
  }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  )

  const totalPrice = orderData?.order?.items.reduce(
    (accumulator, item) =>
      accumulator +
      item.price * item?.quantity +
      item?.toppings.reduce((acc: number, topping: ITopping) => acc + topping.price, 0),
    0
  )

  const items = [
    {
      index: 0,
      name: 'pending',
      title: 'Chờ Xác Nhận'
    },
    {
      index: 1,
      name: 'confirmed',
      title: 'Đã Xác nhận'
    },
    {
      index: 2,
      name: 'done',
      title: 'Hoàn Thành'
    }
  ]
  const currentStatus = items.find((item) => item.name === orderData?.order?.status)
  if (isError) {
    navigate(-1)
  }

  return (
    <>
      <Loader />
      <div className='max-h-screen overflow-y-auto hidden-scroll-bar relative'>
        <div className='py-5 flex items-center justify-between sticky top-0 bg-white z-[8]'>
          <div className='flex items-center gap-x-2 cursor-pointer select-none' onClick={() => navigate(-1)}>
            <AiOutlineArrowLeft className='text-lg' />
            <span className='uppercase' onClick={() => navigate(-1)}>
              Trở lại
            </span>
          </div>
          <div className='uppercase flex items-center gap-x-3 text-sm'>
            <span>Mã đơn hàng: {orderData?.order?._id}</span>
            <span>|</span>

            {orderData?.order?.status === 'canceled' ? (
              <span className='text-[#EE4D2D]'>Đơn hàng đã được hủy</span>
            ) : (
              <span className='text-[#EE4D2D]'>Đơn hàng {currentStatus?.title}</span>
            )}
          </div>
        </div>
        <Divider />
        <div className='order-status-step'>
          <div className='mb-10'>
            <h2 className='mb-5 text-xl text-[#866312]'>Trạng thái đơn hàng</h2>
            {orderData?.order?.status === 'canceled' ? (
              <div className='flex flex-col justify-center items-center bg-[#fffcf5] py-6 '>
                <span className='text-[20px] text-[#ee4d2d]'>Đã hủy đơn hàng</span>
                <span className='text-sm'>Lý do: {orderData?.order?.reasonCancelOrder}</span>
              </div>
            ) : (
              <Steps labelPlacement='vertical' current={currentStatus?.index} items={items} />
            )}
          </div>
        </div>
        <div className='address my-10'>
          <h2 className='text-xl mb-4 text-[#866312]'>Địa chỉ nhận hàng</h2>
          <div className='bg_image'></div>
          <div className='py-5'>
            <div className='info flex flex-col'>
              <span className='mb-2'>Tên người nhận: {orderData?.order?.inforOrderShipping?.name}</span>
              <span className='text-[12px] text-[#0000008a]'>SĐT: {orderData?.order?.inforOrderShipping?.phone}</span>
              <span className='text-[12px] text-[#0000008a]'>
                Địa chỉ: {orderData?.order?.inforOrderShipping?.address}
              </span>
              {orderData?.order?.inforOrderShipping?.noteShipping?.trim() && (
                <span className='text-[12px] text-[#0000008a]'>
                  Ghi chú: {orderData?.order?.inforOrderShipping?.noteShipping}
                </span>
              )}
              <span className='text-[12px] text-[#0000008a]'>
                Thời gian đặt hàng: {orderData?.order?.createdAt && formatDate(orderData?.order?.createdAt)}
              </span>
            </div>
          </div>
          <div className='bg_image'></div>
        </div>
        <div className='content'>
          <h2 className='mb-4 text-xl text-[#866312]'>Sản phẩm đã đặt</h2>
          <div className='list-items'>
            {orderData &&
              orderData?.order?.items.length > 0 &&
              orderData?.order?.items?.map((item, index) => (
                <div key={index} className='item flex items-center gap-x-3 mb-10 shadow-md p-2 rounded'>
                  <div className='left flex gap-x-3 flex-1'>
                    <div className='min-w-max'>
                      <img src={item?.image} alt='' className='w-[100px] h-[100px] object-cover' />
                    </div>
                    <div>
                      <h4 className='title mb-2 text-[#866312] text-sm'>{item?.product.name}</h4>
                      <div className='flex flex-col gap-y-1'>
                        {item && item?.toppings.length > 0 && (
                          <span className='text-sm text-[#866312]'>
                            Toppings:{' '}
                            {item?.toppings?.map((topping: ITopping) =>
                              item.toppings[item.toppings.length - 1].name === topping.name
                                ? `${topping.name}(${formatCurrency(topping.price)}).`
                                : `${topping.name}(${formatCurrency(topping.price)}), `
                            )}
                          </span>
                        )}

                        <span className='quantity text-[12px]'>x{item?.quantity}</span>
                      </div>
                    </div>
                  </div>
                  <div className='right'>
                    <div className='price flex flex-col items-end'>
                      <span className='text-[#866312] ml-2'>
                        {formatCurrency(item?.price)} x {item?.quantity} ={' '}
                        {formatCurrency(item?.price * item?.quantity)}
                      </span>
                      {item.toppings?.map((topping: ITopping) => (
                        <span key={topping._id} className='text-[#866312] ml-2'>
                          {formatCurrency(topping.price)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

            {/* <div className='item flex items-center gap-x-3  shadow-md px-2 rounded'>
              <div className='left flex gap-x-3 flex-1'>
                <div>
                  <img
                    src='https://down-vn.img.susercontent.com/file/fef0347319ef4d5092b026d3ebaf66dd_tn'
                    alt=''
                    className='w-[100px] h-[100px] object-cover'
                  />
                </div>
                <div>
                  <h4 className='title mb-2 text-[#866312] text-sm'>
                    Kinh Cường lực iphone 10D full màn iphone 6s/6plus/6splus/7/7plus/8/8plus/plus/X/Xr/
                    Xsmax/11/11promax/ 12/13/pro/promax
                  </h4>
                  <span className='quantity '>x2</span>
                </div>
              </div>
              <div className='right'>
                <div className='price '>
                  <span className='text-[#866312] ml-2'>2000d</span>
                </div>
              </div>
            </div> */}
          </div>
          <Divider />
          <div className='payment-info'>
            <div className='flex justify-end  items-center py-3 text-right border-b border-b-[#ccc]'>
              <div className='text-[12px] pr-2'>Tổng tiền hàng</div>
              <div className='w-[200px] text-[#866312] border-l border-l-[#ccc]'>
                {totalPrice && formatCurrency(totalPrice)}
              </div>
            </div>
            <div className='flex justify-end  items-center py-3 text-right border-b border-b-[#ccc]'>
              <div className='text-[12px] pr-2'>Phí vận chuyển</div>
              <div className='w-[200px] text-[#866312] border-l border-l-[#ccc]'>
                {orderData?.order?.priceShipping && formatCurrency(orderData?.order?.priceShipping)}
              </div>
            </div>
            {/* <div className='flex justify-end  items-center py-3 text-right border-b border-b-[#ccc]'>
              <div className='text-[12px] pr-2'>Mã giảm giá</div>
              <div className='w-[200px] text-[#866312] border-l border-l-[#ccc]'>20000đ</div>
            </div> */}
            <div className='flex justify-end  items-center py-3 text-right border-b border-b-[#ccc]'>
              <div className='text-[12px] pr-2'>Thành tiền</div>
              <div className='w-[200px] text-2xl text-[#866312] border-l border-l-[#ccc]'>
                {orderData?.order?.total && formatCurrency(orderData?.order?.total)}
              </div>
            </div>
          </div>
          <div className='payment-method flex justify-end  items-center py-3 text-right'>
            <div className='flex items-center pr-2 gap-x-1'>
              {orderData?.order?.paymentMethodId === 'cod' ? (
                <RiMoneyDollarCircleFill className='text-[#866312] text-2xl' />
              ) : (
                <AiFillCreditCard className='text-[#866312]' />
              )}

              <span className='text-[12px]'>Phương thức thanh toán</span>
            </div>
            <div className='w-[200px] border-l border-l-[#ccc] text-sm text-[#EE4D2D]'>
              {orderData?.order?.paymentMethodId === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thanh toán qua VNPay'}
            </div>
          </div>

          {/* Phần đánh giá sản phẩm - chỉ hiển thị khi đơn hàng đã hoàn thành */}
          {orderData?.order?.status === 'done' && (
            <div id='review-section' className='review-section mt-8 p-6 bg-[#fffcf5] rounded-lg border border-[#D8B979]'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl text-[#866312] font-semibold'>🌟 Đánh giá sản phẩm</h2>
                {!showReviewSection && (
                  <AntButton 
                    type='primary' 
                    size='large'
                    style={{ background: '#D8B979' }}
                    onClick={() => setShowReviewSection(!showReviewSection)}
                  >
                    {showReviewSection ? 'Ẩn' : 'Hiển thị sản phẩm cần đánh giá'}
                  </AntButton>
                )}
              </div>
              
              {showReviewSection && (
                <div className='space-y-4'>
                  <p className='text-sm text-gray-600 mb-4'>
                    Cảm ơn bạn đã sử dụng sản phẩm của chúng tôi! Hãy chia sẻ trải nghiệm của bạn để giúp chúng tôi phục vụ bạn tốt hơn.
                  </p>
                  {orderData?.order?.items?.map((item, index) => {
                    const isReviewed = reviewedProductIds.has(item.product._id)
                    
                    return (
                      <div key={index} className='review-item flex items-center justify-between p-4 bg-white rounded shadow-sm hover:shadow-md transition-shadow'>
                        <div className='flex items-center gap-x-3 flex-1'>
                          <img src={item?.image} alt='' className='w-[60px] h-[60px] object-cover rounded' />
                          <div>
                            <h4 className='text-sm font-medium text-[#333] line-clamp-2'>{item?.product.name}</h4>
                            <span className='text-xs text-gray-500'>Số lượng: x{item?.quantity}</span>
                            {isReviewed && (
                              <span className='text-xs text-green-600 flex items-center gap-x-1 mt-1'>
                                <span>✓</span> Đã đánh giá
                              </span>
                            )}
                          </div>
                        </div>
                        {!isReviewed && (
                          <AntButton 
                            type='primary'
                            size='middle'
                            style={{ background: '#D8B979' }}
                            onClick={() => handleOpenReviewModal(item)}
                          >
                            Đánh giá ngay
                          </AntButton>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal đánh giá sản phẩm */}
      <Modal
        title={
          <div className='flex items-center gap-x-2'>
            <span className='text-lg font-semibold'>🌟 Đánh giá sản phẩm</span>
          </div>
        }
        open={isReviewModalOpen}
        onCancel={handleCloseReviewModal}
        onOk={handleSubmitReview}
        okText='Gửi đánh giá'
        cancelText='Hủy'
        width={600}
        confirmLoading={isSubmitting}
        okButtonProps={{ 
          style: { background: '#D8B979', borderColor: '#D8B979' },
          disabled: isSubmitting
        }}
      >
        {selectedProduct && (
          <div className='space-y-4 py-4'>
            {/* Thông tin sản phẩm */}
            <div className='flex items-center gap-x-3 p-3 bg-gray-50 rounded'>
              <img 
                src={selectedProduct?.image} 
                alt='' 
                className='w-[80px] h-[80px] object-cover rounded' 
              />
              <div>
                <h4 className='font-medium text-[#333]'>{selectedProduct?.product.name}</h4>
                <span className='text-sm text-gray-500'>Số lượng: x{selectedProduct?.quantity}</span>
              </div>
            </div>

            {/* Đánh giá sao */}
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Đánh giá của bạn <span className='text-red-500'>*</span>
              </label>
              <Rate 
                value={rating} 
                onChange={setRating}
                style={{ fontSize: 32, color: '#D8B979' }}
              />
              <p className='text-xs text-gray-500'>
                {rating === 1 && 'Rất không hài lòng'}
                {rating === 2 && 'Không hài lòng'}
                {rating === 3 && 'Bình thường'}
                {rating === 4 && 'Hài lòng'}
                {rating === 5 && 'Rất hài lòng'}
              </p>
            </div>

            {/* Nhận xét */}
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Nhận xét của bạn
              </label>
              <Input.TextArea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder='Chia sẻ trải nghiệm của bạn về sản phẩm...'
                rows={4}
                maxLength={500}
                showCount
              />
            </div>

            {/* Upload ảnh */}
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Thêm hình ảnh (tùy chọn)
              </label>
              <Upload
                listType='picture-card'
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={() => false}
                maxCount={5}
              >
                {fileList.length >= 5 ? null : uploadButton}
              </Upload>
              <p className='text-xs text-gray-500'>Tối đa 5 ảnh</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default MyOrderDetail
