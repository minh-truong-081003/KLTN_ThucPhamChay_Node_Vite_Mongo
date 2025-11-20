import { FaCreditCard, FaShippingFast, FaTools } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const ServiceInfo = () => {
  return (
    <section className='py-16 bg-gradient-to-b from-white to-gray-50'>
      <div className='max-w-[1140px] mx-auto px-5'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold text-[#282828] mb-4'>Dịch Vụ Của Chúng Tôi</h2>
          <div className='w-24 h-1 bg-[#d3b673] mx-auto'></div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Hình thức thanh toán */}
          <Link to='/payment-methods' className='group'>
            <div className='bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center h-full flex flex-col items-center justify-center transform hover:-translate-y-2'>
              <div className='w-20 h-20 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300'>
                <FaCreditCard className='text-4xl text-white' />
              </div>
              <h3 className='text-xl font-bold text-[#282828] mb-3 group-hover:text-[#d3b673] transition-colors'>
                Hình Thức Thanh Toán
              </h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Chuyển khoản ngân hàng, thanh toán khi nhận hàng (COD), ví điện tử MoMo, ZaloPay
              </p>
              <div className='mt-4 text-[#d3b673] font-semibold group-hover:underline'>Xem chi tiết →</div>
            </div>
          </Link>

          {/* Vận chuyển giao hàng */}
          <Link to='/shipping-policy' className='group'>
            <div className='bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center h-full flex flex-col items-center justify-center transform hover:-translate-y-2'>
              <div className='w-20 h-20 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300'>
                <FaShippingFast className='text-4xl text-white' />
              </div>
              <h3 className='text-xl font-bold text-[#282828] mb-3 group-hover:text-[#d3b673] transition-colors'>
                Vận Chuyển Giao Hàng
              </h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Giao hàng nhanh trong 2-4 giờ khu vực nội thành, miễn phí ship đơn từ 300.000đ
              </p>
              <div className='mt-4 text-[#d3b673] font-semibold group-hover:underline'>Xem chi tiết →</div>
            </div>
          </Link>

          {/* Bảo trì bảo hành */}
          <Link to='/warranty-policy' className='group'>
            <div className='bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center h-full flex flex-col items-center justify-center transform hover:-translate-y-2'>
              <div className='w-20 h-20 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300'>
                <FaTools className='text-4xl text-white' />
              </div>
              <h3 className='text-xl font-bold text-[#282828] mb-3 group-hover:text-[#d3b673] transition-colors'>
                Chính Sách Đổi Trả
              </h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Đổi trả trong 7 ngày nếu sản phẩm lỗi, bảo quản đúng cách, cam kết chất lượng 100%
              </p>
              <div className='mt-4 text-[#d3b673] font-semibold group-hover:underline'>Xem chi tiết →</div>
            </div>
          </Link>
        </div>

        {/* Thông tin bổ sung */}
        <div className='mt-12 text-center'>
          <p className='text-gray-600 max-w-3xl mx-auto'>
            Chúng tôi cam kết mang đến cho bạn trải nghiệm mua sắm thuận tiện và an tâm nhất. Mọi thắc mắc xin liên hệ{' '}
            <span className='text-[#d3b673] font-semibold'>1900.111.111</span> để được hỗ trợ 24/7.
          </p>
        </div>
      </div>
    </section>
  )
}

export default ServiceInfo
