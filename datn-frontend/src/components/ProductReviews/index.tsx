import { useState } from 'react'
import { useAppSelector } from '../../store/hooks'
import {
  useGetReviewsByProductQuery,
  useCheckUserPurchasedProductQuery,
  useGetUserReviewForProductQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useToggleReviewVisibilityMutation
} from '../../api/Review'
import { useReviewSocket } from '../../hook/useReviewSocket'
import { IProduct } from '../../interfaces/products.type'
import { IImage } from '../../interfaces/image.type'
import ReviewList from './ReviewList'
import ReviewForm from './ReviewForm'
import { toast } from 'react-toastify'

interface ProductReviewsProps {
  product: IProduct
}

const ProductReviews = ({ product }: ProductReviewsProps) => {
  const [page, setPage] = useState(1)
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined)
  const { user } = useAppSelector((state) => state.persistedReducer.auth)

  // Lấy danh sách đánh giá (có filter)
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    refetch: refetchReviews
  } = useGetReviewsByProductQuery({
    productId: product._id,
    page,
    limit: 5,
    rating: ratingFilter
  })

  // Lấy tất cả reviews (không filter) để đếm số lượng theo từng rating
  const { data: allReviewsData } = useGetReviewsByProductQuery({
    productId: product._id,
    page: 1,
    limit: 1000, // Lấy nhiều để đếm
    rating: undefined
  })

  // Kiểm tra user đã mua sản phẩm chưa
  const { data: purchaseData, isLoading: isLoadingPurchase } = useCheckUserPurchasedProductQuery(product._id, {
    skip: !user._id
  })

  // Lấy đánh giá của user cho sản phẩm này
  const { data: userReviewData, refetch: refetchUserReview } = useGetUserReviewForProductQuery(product._id, {
    skip: !user._id
  })

  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation()
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation()
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation()
  const [toggleVisibility, { isLoading: isTogglingVisibility }] = useToggleReviewVisibilityMutation()

  const canReview = purchaseData?.data?.canReview || false
  const userReview = userReviewData?.data || null

  // Kiểm tra quyền của user
  const isAdmin = user?.role === 'admin'
  const isStaff = user?.role === 'staff'
  const canModerateReviews = isAdmin || isStaff

  // Socket realtime updates
  useReviewSocket(product._id, {
    onReviewCreated: () => {
      refetchReviews()
      refetchUserReview()
    },
    onReviewUpdated: () => {
      refetchReviews()
      refetchUserReview()
    },
    onReviewDeleted: () => {
      refetchReviews()
      refetchUserReview()
    },
    onReviewToggled: () => {
      refetchReviews()
      refetchUserReview()
    },
    onReviewRestored: () => {
      refetchReviews()
      refetchUserReview()
    }
  })

  const handleCreateReview = async (data: { rating: number; comment: string; order: string; images?: IImage[] }) => {
    try {
      await createReview({
        product: product._id,
        order: data.order,
        rating: data.rating,
        comment: data.comment,
        images: (data.images || [])
          .filter((img) => img.url)
          .map((img) => ({
            url: img.url!,
            publicId: img.publicId || '',
            filename: img.filename || ''
          }))
      }).unwrap()
      toast.success('Đánh giá của bạn đã được gửi thành công!')
      refetchReviews()
      refetchUserReview()
    } catch (error: any) {
      toast.error(error?.data?.err || 'Có lỗi xảy ra khi gửi đánh giá')
    }
  }

  const handleUpdateReview = async (reviewId: string, data: { rating: number; comment: string }) => {
    try {
      await updateReview({
        reviewId,
        data: {
          rating: data.rating,
          comment: data.comment
        }
      }).unwrap()
      toast.success('Đánh giá đã được cập nhật!')
      refetchReviews()
      refetchUserReview()
    } catch (error: any) {
      toast.error(error?.data?.err || 'Có lỗi xảy ra khi cập nhật đánh giá')
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này? Đánh giá sẽ được gửi cho admin duyệt xóa.')) {
      try {
        await deleteReview(reviewId).unwrap()
        toast.success('Đá gửi yêu cầu xóa đánh giá!')
        refetchReviews()
        refetchUserReview()
      } catch (error: any) {
        toast.error(error?.data?.err || 'Có lỗi xảy ra khi xóa đánh giá')
      }
    }
  }

  const handleToggleVisibility = async (reviewId: string) => {
    try {
      const result = await toggleVisibility(reviewId).unwrap()
      toast.success(result.status || 'Đã cập nhật trạng thái đánh giá!')
      refetchReviews()
      refetchUserReview()
    } catch (error: any) {
      toast.error(error?.data?.err || 'Có lỗi xảy ra khi thay đổi trạng thái đánh giá')
    }
  }

  // Lấy danh sách reviews (backend đã tự động thêm đánh giá ẩn của user)
  const reviews = reviewsData?.docs || []

  const totalReviews = allReviewsData?.totalDocs || 0

  // Tính lại averageRating từ tất cả reviews (không filter) để đảm bảo chính xác
  const calculateAverageRating = () => {
    const allReviews = allReviewsData?.docs || []
    if (allReviews.length === 0) return 0
    const totalRating = allReviews.reduce((sum, review) => sum + (review.rating || 0), 0)
    return parseFloat((totalRating / allReviews.length).toFixed(1))
  }

  // Sử dụng rating từ reviews thực tế, nếu không có thì dùng từ product
  const averageRating =
    allReviewsData?.docs && allReviewsData.docs.length > 0 ? calculateAverageRating() : product.averageRating || 0

  return (
    <div className='product-reviews'>
      <div className='reviews-header mb-6'>
        <h3 className='text-2xl font-bold text-gray-900 mb-6'>Đánh giá sản phẩm</h3>

        {/* Rating Summary - Đẹp hơn */}
        <div className='bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 mb-6 border border-yellow-100'>
          <div className='flex items-center gap-6 flex-wrap'>
            <div className='flex items-center gap-3'>
              <div className='text-center'>
                <div className='text-5xl font-bold text-gray-900'>
                  {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                </div>
                <div className='flex items-center justify-center mt-2'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-6 h-6 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                </div>
              </div>
              <div className='h-16 w-px bg-gray-300'></div>
              <div>
                <p className='text-lg font-semibold text-gray-700'>{totalReviews}</p>
                <p className='text-sm text-gray-500'>đánh giá</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter by rating - UI đẹp hơn và rõ ràng hơn */}
        <div className='rating-filters mb-6'>
          <div className='flex items-center justify-between mb-3'>
            <h4 className='text-sm font-semibold text-gray-700'>Lọc theo đánh giá:</h4>
            {ratingFilter && (
              <button
                onClick={() => {
                  setRatingFilter(undefined)
                  setPage(1) // Reset về trang 1 khi đổi filter
                }}
                className='text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
                Xóa bộ lọc
              </button>
            )}
          </div>
          <div className='flex gap-2 flex-wrap'>
            <button
              onClick={() => {
                setRatingFilter(undefined)
                setPage(1)
              }}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                ratingFilter === undefined
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-200'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <svg
                className={`w-4 h-4 ${ratingFilter === undefined ? 'text-white' : 'text-gray-500'}`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
              <span>Tất cả</span>
              {ratingFilter === undefined && (
                <span className='ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs'>{totalReviews}</span>
              )}
            </button>
            {[5, 4, 3, 2, 1].map((rating) => {
              // Đếm số reviews theo từng rating từ tất cả reviews (không filter)
              const ratingCount = allReviewsData?.docs?.filter((r) => r.rating === rating).length || 0
              return (
                <button
                  key={rating}
                  onClick={() => {
                    setRatingFilter(rating)
                    setPage(1) // Reset về trang 1 khi đổi filter
                  }}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    ratingFilter === rating
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-200'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <span className='font-semibold'>{rating}</span>
                  <svg
                    className={`w-5 h-5 ${ratingFilter === rating ? 'text-yellow-300' : 'text-yellow-400'}`}
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                  {ratingCount > 0 && (
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                        ratingFilter === rating ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ratingCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {ratingFilter && (
            <div className='mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
              <p className='text-sm text-blue-800 flex items-center gap-2'>
                <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  />
                </svg>
                Đang hiển thị đánh giá <strong>{ratingFilter} sao</strong>.
                <button
                  onClick={() => {
                    setRatingFilter(undefined)
                    setPage(1)
                  }}
                  className='underline font-semibold hover:text-blue-900 ml-1'
                >
                  Xem tất cả
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Form đánh giá - chỉ hiện cho user đã mua */}
      {user._id && canReview && !userReview && (
        <ReviewForm onSubmit={handleCreateReview} isLoading={isCreating} orderId={purchaseData?.data?.orderId} />
      )}

      {/* Thông báo nhẹ nhàng khi chưa mua hàng - chỉ hiện khi đã đăng nhập */}
      {user._id && !canReview && !userReview && !isLoadingPurchase && (
        <div className='mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 mt-0.5'>
              <svg className='w-5 h-5 text-blue-500' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='flex-1'>
              <p className='text-sm text-gray-700 leading-relaxed'>
                Bạn đã mua sản phẩm này? Hãy chia sẻ trải nghiệm của bạn để giúp người khác đưa ra quyết định tốt hơn.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoadingPurchase && (
        <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
          <div className='flex items-center gap-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
            <p className='text-xs text-gray-500'>Đang kiểm tra...</p>
          </div>
        </div>
      )}
      {/* Danh sách đánh giá */}
      <ReviewList
        reviews={reviews}
        isLoading={isLoadingReviews}
        currentPage={page}
        totalPages={reviewsData?.totalPages || 1}
        onPageChange={setPage}
        userReview={userReview}
        onUpdateReview={handleUpdateReview}
        onDeleteReview={handleDeleteReview}
        onToggleVisibility={handleToggleVisibility}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        isTogglingVisibility={isTogglingVisibility}
        ratingFilter={ratingFilter}
        canModerateReviews={canModerateReviews}
        currentUserId={user?._id}
      />
    </div>
  )
}

export default ProductReviews
