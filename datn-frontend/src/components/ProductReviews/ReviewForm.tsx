import { useState } from 'react'
import { IImage } from '../../interfaces/image.type'
import { useUploadImagesProductMutation } from '../../api/Product'
import { toast } from 'react-toastify'

interface ReviewFormProps {
  onSubmit: (data: { rating: number; comment: string; order: string; images?: IImage[] }) => void
  isLoading: boolean
  orderId?: string
}

const ReviewForm = ({ onSubmit, isLoading, orderId }: ReviewFormProps) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)
  const [images, setImages] = useState<IImage[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadImagesMutation] = useUploadImagesProductMutation()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 5) {
      toast.error('Tối đa 5 ảnh cho mỗi đánh giá')
      return
    }

    setUploadingImages(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('images', file)
      })

      const result = await uploadImagesMutation(formData).unwrap()
      if (result.urls) {
        setImages((prev) => [...prev, ...result.urls])
        toast.success(`Đã upload ${result.urls.length} ảnh`)
      }
    } catch (error: any) {
      toast.error(error?.data?.error || 'Có lỗi xảy ra khi upload ảnh')
    } finally {
      setUploadingImages(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleRemoveImage = (publicId: string) => {
    setImages((prev) => prev.filter((img) => img.publicId !== publicId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId) {
      toast.error('Không tìm thấy thông tin đơn hàng')
      return
    }
    onSubmit({ rating, comment, order: orderId, images: images.length > 0 ? images : undefined })
    setComment('')
    setRating(5)
    setImages([])
  }

  return (
    <div className='review-form mb-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
      <div className='flex items-center gap-2 mb-6'>
        <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center'>
          <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
            />
          </svg>
        </div>
        <h4 className='text-xl font-bold text-gray-900'>Viết đánh giá của bạn</h4>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='rating-input'>
          <label className='block mb-3 text-sm font-semibold text-gray-700'>Đánh giá của bạn *</label>
          <div className='flex gap-2 items-center' onMouseLeave={() => setHoveredRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type='button'
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                className='focus:outline-none transform transition-transform hover:scale-110'
              >
                <svg
                  className={`w-10 h-10 cursor-pointer transition-all duration-200 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400 drop-shadow-sm'
                      : 'text-gray-300 hover:text-yellow-200'
                  }`}
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
              </button>
            ))}
            {rating > 0 && (
              <span className='ml-3 text-sm font-medium text-gray-600'>
                {rating === 5 && 'Tuyệt vời!'}
                {rating === 4 && 'Rất tốt!'}
                {rating === 3 && 'Tốt'}
                {rating === 2 && 'Tạm được'}
                {rating === 1 && 'Không hài lòng'}
              </span>
            )}
          </div>
        </div>

        <div className='comment-input'>
          <label htmlFor='comment' className='block mb-2 text-sm font-semibold text-gray-700'>
            Bình luận (tùy chọn)
          </label>
          <textarea
            id='comment'
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none'
            placeholder='Chia sẻ trải nghiệm của bạn về sản phẩm này... Ví dụ: Chất lượng tốt, đóng gói cẩn thận, giao hàng nhanh...'
          />
          <p className='mt-1 text-xs text-gray-500'>Tối đa 500 ký tự</p>
        </div>

        {/* Upload Images */}
        <div className='images-input'>
          <label htmlFor='review-images' className='block mb-2 text-sm font-semibold text-gray-700'>
            Thêm ảnh (tùy chọn)
          </label>
          <div className='space-y-3'>
            {/* Input upload */}
            <label
              htmlFor='review-images'
              className='flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors'
            >
              <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                {uploadingImages ? (
                  <div className='flex flex-col items-center gap-2'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
                    <p className='text-sm text-gray-500'>Đang upload...</p>
                  </div>
                ) : (
                  <>
                    <svg className='w-10 h-10 mb-2 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                    <p className='mb-2 text-sm text-gray-500'>
                      <span className='font-semibold'>Click để upload</span> hoặc kéo thả
                    </p>
                    <p className='text-xs text-gray-500'>PNG, JPG, GIF (Tối đa 5 ảnh)</p>
                  </>
                )}
              </div>
              <input
                id='review-images'
                type='file'
                className='hidden'
                multiple
                accept='image/*'
                onChange={handleImageUpload}
                disabled={uploadingImages || images.length >= 5}
              />
            </label>

            {/* Preview images */}
            {images.length > 0 && (
              <div className='grid grid-cols-4 gap-3'>
                {images.map((image, index) => (
                  <div key={image.publicId || index} className='relative group'>
                    <img
                      src={image.url}
                      alt={`Review ${index + 1}`}
                      className='w-full h-24 object-cover rounded-lg border border-gray-200'
                    />
                    <button
                      type='button'
                      onClick={() => handleRemoveImage(image.publicId)}
                      className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {images.length > 0 && (
              <p className='text-xs text-gray-500'>Đã chọn {images.length}/5 ảnh. Click vào ảnh để xóa.</p>
            )}
          </div>
        </div>

        <div className='flex items-center gap-3 pt-4 border-t border-gray-200'>
          <button
            type='submit'
            disabled={isLoading || !orderId}
            className='flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
          >
            {isLoading ? (
              <span className='flex items-center justify-center gap-2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                Đang gửi...
              </span>
            ) : (
              'Gửi đánh giá'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReviewForm
