import { IReview } from '../../interfaces/review.type'
import formatDate from '../../utils/formatDate'

interface ReviewListProps {
  reviews: IReview[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  userReview: IReview | null
  onUpdateReview: (reviewId: string, data: { rating: number; comment: string }) => void
  onDeleteReview: (reviewId: string) => void
  onToggleVisibility: (reviewId: string) => void
  isUpdating: boolean
  isDeleting: boolean
  isTogglingVisibility: boolean
  ratingFilter?: number
  canModerateReviews: boolean
  currentUserId?: string
}

const ReviewList = ({
  reviews,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  userReview,
  onUpdateReview,
  onDeleteReview,
  onToggleVisibility,
  isUpdating,
  isDeleting,
  isTogglingVisibility,
  ratingFilter,
  canModerateReviews,
  currentUserId,
}: ReviewListProps) => {
  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4'>
          <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' />
          </svg>
        </div>
        <p className='text-gray-600 font-medium mb-1'>
          {ratingFilter 
            ? `Không có đánh giá ${ratingFilter} sao nào` 
            : 'Chưa có đánh giá nào cho sản phẩm này'}
        </p>
        <p className='text-sm text-gray-400'>
          {ratingFilter 
            ? 'Hãy thử chọn bộ lọc khác hoặc xem tất cả đánh giá' 
            : 'Hãy là người đầu tiên đánh giá sản phẩm này!'}
        </p>
      </div>
    )
  }

  return (
    <div className='reviews-list space-y-4'>
      {reviews.map((review) => {
        // Kiểm tra xem user hiện tại có phải là chủ sở hữu của review này không
        const isOwner = currentUserId && review.user?._id && currentUserId === review.user._id
        const canManageThisReview = isOwner || canModerateReviews

        return (
          <div
            key={review._id}
            className={`review-item p-5 rounded-xl border transition-all hover:shadow-md ${
              !review.is_active && isOwner
                ? 'bg-gray-50 border-gray-300 opacity-60'
                : 'border-gray-200 bg-white'
            }`}
          >
            {/* Thông báo nếu đánh giá bị ẩn */}
            {!review.is_active && isOwner && (
              <div className='mb-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200'>
                <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                </svg>
                <span className='font-medium'>Đánh giá này đang ở trạng thái ẩn (chỉ bạn nhìn thấy)</span>
              </div>
            )}
            <div className='flex items-start justify-between mb-3'>
              <div className='flex items-start gap-4 flex-1'>
                <div className='avatar w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden shadow-md flex-shrink-0'>
                  {review.user?.avatar ? (
                    <img
                      src={review.user.avatar}
                      alt={review.user.username || 'User'}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <span className='text-white font-bold text-lg'>
                      {(review.user?.username || review.user?.account || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-2'>
                    <p className='font-semibold text-gray-900'>
                      {review.user?.username || review.user?.account || 'Người dùng'}
                    </p>
                    {canModerateReviews && !review.is_active && (
                      <span className='px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded'>
                        Đã ẩn
                      </span>
                    )}
                  </div>
                  <div className='flex items-center gap-2 mb-2'>
                    {review.rating && (
                      <div className='flex items-center gap-0.5'>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${star <= review.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                          </svg>
                        ))}
                      </div>
                    )}
                    <span className='text-xs text-gray-500'>{formatDate(review.createdAt)}</span>
                  </div>
                  {review.comment && (
                    <p className='text-gray-700 mt-3 leading-relaxed whitespace-pre-wrap'>{review.comment}</p>
                  )}
                  {review.images && review.images.length > 0 && (
                    <div className='review-images flex gap-2 mt-4 flex-wrap'>
                      {review.images.map((image, index) => (
                        <div
                          key={index}
                          className='relative group cursor-pointer'
                          onClick={() => {
                            // Mở ảnh trong tab mới hoặc lightbox
                            window.open(image.url, '_blank')
                          }}
                        >
                          <img
                            src={image.url}
                            alt={`Review ${index + 1}`}
                            className='w-24 h-24 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform shadow-sm hover:shadow-md'
                          />
                          <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center'>
                            <svg
                              className='w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7'
                              />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Nút quản lý cho admin/staff hoặc chủ sở hữu */}
              {canManageThisReview && (
                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => onToggleVisibility(review._id)}
                    className='px-3 py-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium rounded-lg transition-all flex items-center gap-1'
                    disabled={isTogglingVisibility}
                    title={review.is_active ? 'Ẩn đánh giá' : 'Hiện đánh giá'}
                  >
                    {isTogglingVisibility ? (
                      'Đang xử lý...'
                    ) : review.is_active ? (
                      <>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' />
                        </svg>
                        Ẩn
                      </>
                    ) : (
                      <>
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                        </svg>
                        Hiện
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteReview(review._id)}
                    className='px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium rounded-lg transition-all'
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              )}
            </div>

            {/* Hiển thị replies như cây thư mục */}
            {review.replies && review.replies.length > 0 && (
              <div className='replies-container mt-4 ml-12 space-y-3 border-l-2 border-blue-200 pl-4'>
                {review.replies.map((reply) => (
                  <div
                    key={reply._id}
                    className='reply-item p-4 rounded-lg bg-blue-50 border border-blue-100'
                  >
                    <div className='flex items-start gap-3'>
                      <div className='avatar w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center overflow-hidden shadow flex-shrink-0'>
                        {reply.user?.avatar ? (
                          <img
                            src={reply.user.avatar}
                            alt={reply.user.username || 'Admin'}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <span className='text-white font-bold text-sm'>
                            {(reply.user?.username || 'A').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <p className='font-semibold text-gray-900 text-sm'>
                            {reply.user?.username || 'Quản trị viên'}
                          </p>
                          <span className='px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded'>
                            {reply.user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                          </span>
                        </div>
                        <span className='text-xs text-gray-500 block mb-2'>{formatDate(reply.createdAt)}</span>
                        {reply.comment && (
                          <p className='text-gray-700 text-sm leading-relaxed whitespace-pre-wrap'>
                            {reply.comment}
                          </p>
                        )}
                        {reply.images && reply.images.length > 0 && (
                          <div className='reply-images flex gap-2 mt-3 flex-wrap'>
                            {reply.images.map((image, index) => (
                              <div
                                key={index}
                                className='relative group cursor-pointer'
                                onClick={() => window.open(image.url, '_blank')}
                              >
                                <img
                                  src={image.url}
                                  alt={`Reply ${index + 1}`}
                                  className='w-20 h-20 object-cover rounded-lg border border-blue-200 hover:scale-105 transition-transform shadow-sm'
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Pagination - Đẹp hơn */}
      {totalPages > 1 && (
        <div className='pagination flex justify-center items-center gap-3 mt-8 pt-6 border-t border-gray-200'>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className='px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all disabled:hover:bg-white'
          >
            ← Trước
          </button>
          <div className='flex items-center gap-2'>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      page === currentPage
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className='px-2 text-gray-400'>...</span>
              }
              return null
            })}
          </div>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className='px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all disabled:hover:bg-white'
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  )
}

export default ReviewList

