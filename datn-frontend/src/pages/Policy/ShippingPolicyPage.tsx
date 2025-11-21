import { FaBox, FaClock, FaMapMarkerAlt, FaShippingFast } from 'react-icons/fa'
import HeaderHomePage from '../../components/Header-HomePage'
import FooterHomePage from '../../components/Footer-HomePage'
import ButtonDelivery from '../../components/Button-Delivery'
import Loader from '../../components/Loader'

const ShippingPolicyPage = () => {
  return (
    <>
      <Loader />
      <HeaderHomePage />

      <main className='mt-[80px] py-16 px-5 bg-gray-50'>
        <div className='max-w-[1140px] mx-auto'>
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold text-[#282828] mb-4'>Chính Sách Vận Chuyển Giao Hàng</h1>
            <div className='w-24 h-1 bg-[#d3b673] mx-auto mb-4'></div>
            <p className='text-gray-600 max-w-2xl mx-auto'>
              VIFOOD cam kết giao hàng nhanh chóng, đúng hẹn và đảm bảo chất lượng sản phẩm đông lạnh
            </p>
          </div>

          {/* Khu vực giao hàng */}
          <div className='bg-white rounded-xl shadow-lg p-8 mb-8'>
            <div className='flex items-center mb-6'>
              <div className='w-16 h-16 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mr-4'>
                <FaMapMarkerAlt className='text-3xl text-white' />
              </div>
              <h2 className='text-2xl font-bold text-[#282828]'>Khu Vực Giao Hàng</h2>
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
              <div className='border-l-4 border-[#d3b673] pl-4'>
                <h3 className='font-bold text-lg mb-2'>Khu vực nội thành TP.HCM</h3>
                <ul className='space-y-2 text-gray-700'>
                  <li>• Thời gian: 2-4 giờ (giao hàng nhanh)</li>
                  <li>• Phí ship: 15.000đ</li>
                  <li>• Miễn phí: Đơn từ 300.000đ</li>
                </ul>
              </div>

              <div className='border-l-4 border-[#d3b673] pl-4'>
                <h3 className='font-bold text-lg mb-2'>Khu vực ngoại thành & tỉnh lân cận</h3>
                <ul className='space-y-2 text-gray-700'>
                  <li>• Thời gian: 1-2 ngày</li>
                  <li>• Phí ship: 30.000đ - 50.000đ</li>
                  <li>• Miễn phí: Đơn từ 500.000đ</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Thời gian giao hàng */}
          <div className='bg-white rounded-xl shadow-lg p-8 mb-8'>
            <div className='flex items-center mb-6'>
              <div className='w-16 h-16 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mr-4'>
                <FaClock className='text-3xl text-white' />
              </div>
              <h2 className='text-2xl font-bold text-[#282828]'>Thời Gian Giao Hàng</h2>
            </div>

            <div className='grid md:grid-cols-3 gap-6'>
              <div className='text-center p-6 bg-green-50 rounded-lg'>
                <div className='text-4xl font-bold text-[#d3b673] mb-2'>Sáng</div>
                <p className='text-gray-700'>8:00 - 12:00</p>
              </div>
              <div className='text-center p-6 bg-green-50 rounded-lg'>
                <div className='text-4xl font-bold text-[#d3b673] mb-2'>Chiều</div>
                <p className='text-gray-700'>13:00 - 17:00</p>
              </div>
              <div className='text-center p-6 bg-green-50 rounded-lg'>
                <div className='text-4xl font-bold text-[#d3b673] mb-2'>Tối</div>
                <p className='text-gray-700'>18:00 - 21:00</p>
              </div>
            </div>

            <p className='text-center text-gray-600 mt-6'>
              * Quý khách có thể chọn khung giờ giao hàng phù hợp khi đặt hàng
            </p>
          </div>

          {/* Quy trình giao hàng */}
          <div className='bg-white rounded-xl shadow-lg p-8 mb-8'>
            <div className='flex items-center mb-6'>
              <div className='w-16 h-16 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mr-4'>
                <FaShippingFast className='text-3xl text-white' />
              </div>
              <h2 className='text-2xl font-bold text-[#282828]'>Quy Trình Giao Hàng</h2>
            </div>

            <div className='space-y-6'>
              <div className='flex items-start'>
                <div className='w-10 h-10 bg-[#d3b673] text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0'>
                  1
                </div>
                <div>
                  <h3 className='font-bold mb-1'>Xác nhận đơn hàng</h3>
                  <p className='text-gray-700'>
                    Nhân viên gọi điện xác nhận đơn hàng và thời gian giao hàng trong vòng 30 phút
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='w-10 h-10 bg-[#d3b673] text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0'>
                  2
                </div>
                <div>
                  <h3 className='font-bold mb-1'>Đóng gói chuyên nghiệp</h3>
                  <p className='text-gray-700'>
                    Sản phẩm đông lạnh được đóng gói trong thùng xốp kèm gel giữ lạnh, đảm bảo nhiệt độ -18°C
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='w-10 h-10 bg-[#d3b673] text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0'>
                  3
                </div>
                <div>
                  <h3 className='font-bold mb-1'>Vận chuyển nhanh chóng</h3>
                  <p className='text-gray-700'>Shipper giao hàng theo đúng khung giờ đã hẹn, gọi điện trước 15 phút</p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='w-10 h-10 bg-[#d3b673] text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0'>
                  4
                </div>
                <div>
                  <h3 className='font-bold mb-1'>Nhận hàng và thanh toán</h3>
                  <p className='text-gray-700'>Kiểm tra sản phẩm, ký nhận và thanh toán (với đơn COD)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Đảm bảo chất lượng */}
          <div className='bg-white rounded-xl shadow-lg p-8 mb-8'>
            <div className='flex items-center mb-6'>
              <div className='w-16 h-16 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mr-4'>
                <FaBox className='text-3xl text-white' />
              </div>
              <h2 className='text-2xl font-bold text-[#282828]'>Cam Kết Về Đóng Gói</h2>
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <h3 className='font-bold mb-3'>Tiêu chuẩn đóng gói:</h3>
                <ul className='space-y-2 text-gray-700'>
                  <li>✓ Thùng xốp dày 3-5cm giữ nhiệt</li>
                  <li>✓ Gel giữ lạnh chuyên dụng</li>
                  <li>✓ Băng keo niêm phong chắc chắn</li>
                  <li>✓ Dán nhãn thông tin rõ ràng</li>
                </ul>
              </div>
              <div>
                <h3 className='font-bold mb-3'>Cam kết chất lượng:</h3>
                <ul className='space-y-2 text-gray-700'>
                  <li>✓ Sản phẩm không tan rã trong quá trình vận chuyển</li>
                  <li>✓ Hoàn tiền 100% nếu hàng không đảm bảo chất lượng</li>
                  <li>✓ Đổi trả miễn phí nếu hàng bị hư hỏng do vận chuyển</li>
                  <li>✓ Hỗ trợ 24/7 mọi thắc mắc về giao hàng</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Lưu ý */}
          <div className='bg-yellow-50 border-l-4 border-[#d3b673] rounded-lg p-6'>
            <h3 className='font-bold text-lg mb-3 text-[#282828]'>Lưu ý quan trọng:</h3>
            <ul className='space-y-2 text-gray-700'>
              <li>• Vui lòng bảo quản sản phẩm ngay trong tủ đông sau khi nhận hàng</li>
              <li>• Kiểm tra kỹ sản phẩm trước khi ký nhận (với đơn COD)</li>
              <li>
                • Liên hệ ngay <strong className='text-[#d3b673]'>1900.111.111</strong> nếu phát hiện sai sót
              </li>
              <li>• Đơn hàng có thể bị delay trong giờ cao điểm hoặc thời tiết xấu</li>
            </ul>
          </div>
        </div>
      </main>

      <FooterHomePage />
      <ButtonDelivery />
    </>
  )
}

export default ShippingPolicyPage
