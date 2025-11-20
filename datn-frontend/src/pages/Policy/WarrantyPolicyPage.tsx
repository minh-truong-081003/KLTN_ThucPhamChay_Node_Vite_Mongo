import { FaCheckCircle, FaExchangeAlt, FaPhoneAlt, FaShieldAlt } from 'react-icons/fa'
import HeaderHomePage from '../../components/Header-HomePage'
import FooterHomePage from '../../components/Footer-HomePage'
import ButtonDelivery from '../../components/Button-Delivery'
import Loader from '../../components/Loader'

const WarrantyPolicyPage = () => {
  return (
    <>
      <Loader />
      <HeaderHomePage />

      <main className='mt-[80px] py-16 px-5 bg-gray-50'>
        <div className='max-w-[1140px] mx-auto'>
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold text-[#282828] mb-4'>Chính Sách Đổi Trả & Bảo Hành</h1>
            <div className='w-24 h-1 bg-[#d3b673] mx-auto mb-4'></div>
            <p className='text-gray-600 max-w-2xl mx-auto'>
              VIFOOD cam kết đổi trả 100% sản phẩm lỗi, đảm bảo quyền lợi khách hàng
            </p>
          </div>

          {/* Điều kiện đổi trả */}
          <div className='bg-white rounded-xl shadow-lg p-8 mb-8'>
            <div className='flex items-center mb-6'>
              <div className='w-16 h-16 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mr-4'>
                <FaExchangeAlt className='text-3xl text-white' />
              </div>
              <h2 className='text-2xl font-bold text-[#282828]'>Điều Kiện Đổi Trả</h2>
            </div>

            <div className='grid md:grid-cols-2 gap-8'>
              <div>
                <h3 className='font-bold text-lg mb-4 text-green-600'>✓ Được chấp nhận đổi trả:</h3>
                <ul className='space-y-3 text-gray-700'>
                  <li className='flex items-start'>
                    <span className='text-[#d3b673] mr-2'>•</span>
                    <span>Sản phẩm bị lỗi do nhà sản xuất (hư hỏng, mốc, biến chất)</span>
                  </li>
                  <li className='flex items-start'>
                    <span className='text-[#d3b673] mr-2'>•</span>
                    <span>Sản phẩm không đúng mô tả, sai quy cách</span>
                  </li>
                  <li className='flex items-start'>
                    <span className='text-[#d3b673] mr-2'>•</span>
                    <span>Giao sai sản phẩm, thiếu số lượng</span>
                  </li>
                  <li className='flex items-start'>
                    <span className='text-[#d3b673] mr-2'>•</span>
                    <span>Bao bì bị rách, tan rã trong quá trình vận chuyển</span>
                  </li>
                  <li className='flex items-start'>
                    <span className='text-[#d3b673] mr-2'>•</span>
                    <span>Còn nguyên seal, chưa mở hoặc sử dụng</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className='font-bold text-lg mb-4 text-red-600'>✗ Không chấp nhận đổi trả:</h3>
                <ul className='space-y-3 text-gray-700'>
                  <li className='flex items-start'>
                    <span className='text-red-500 mr-2'>•</span>
                    <span>Sản phẩm đã qua sử dụng, bao bì bị hư hỏng</span>
                  </li>
                  <li className='flex items-start'>
                    <span className='text-red-500 mr-2'>•</span>
                    <span>Lý do chủ quan: không thích, đổi ý</span>
                  </li>
                  <li className='flex items-start'>
                    <span className='text-red-500 mr-2'>•</span>
                    <span>Quá thời hạn đổi trả (7 ngày)</span>
                  </li>
                  <li className='flex items-start'>
                    <span className='text-red-500 mr-2'>•</span>
                    <span>Bảo quản sai cách dẫn đến hư hỏng</span>
                  </li>
                  <li className='flex items-start'>
                    <span className='text-red-500 mr-2'>•</span>
                    <span>Không có hóa đơn, chứng từ mua hàng</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quy trình đổi trả */}
          <div className='bg-white rounded-xl shadow-lg p-8 mb-8'>
            <div className='flex items-center mb-6'>
              <div className='w-16 h-16 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mr-4'>
                <FaCheckCircle className='text-3xl text-white' />
              </div>
              <h2 className='text-2xl font-bold text-[#282828]'>Quy Trình Đổi Trả</h2>
            </div>

            <div className='space-y-6'>
              <div className='flex items-start'>
                <div className='w-12 h-12 bg-[#d3b673] text-white rounded-full flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0'>
                  1
                </div>
                <div className='flex-1'>
                  <h3 className='font-bold text-lg mb-2'>Liên hệ bộ phận CSKH</h3>
                  <p className='text-gray-700 mb-2'>
                    Gọi hotline <strong className='text-[#d3b673]'>1900.111.111</strong> hoặc nhắn tin qua Facebook/Zalo
                    trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng
                  </p>
                  <p className='text-sm text-gray-500'>Thời gian hỗ trợ: 8:00 - 21:00 hàng ngày</p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='w-12 h-12 bg-[#d3b673] text-white rounded-full flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0'>
                  2
                </div>
                <div className='flex-1'>
                  <h3 className='font-bold text-lg mb-2'>Cung cấp thông tin</h3>
                  <ul className='text-gray-700 space-y-1'>
                    <li>• Mã đơn hàng</li>
                    <li>• Hình ảnh sản phẩm lỗi (rõ nét, đầy đủ)</li>
                    <li>• Mô tả chi tiết lỗi sản phẩm</li>
                    <li>• Hóa đơn/chứng từ mua hàng</li>
                  </ul>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='w-12 h-12 bg-[#d3b673] text-white rounded-full flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0'>
                  3
                </div>
                <div className='flex-1'>
                  <h3 className='font-bold text-lg mb-2'>Xác nhận và xử lý</h3>
                  <p className='text-gray-700'>
                    VIFOOD kiểm tra và phản hồi trong <strong>2 giờ</strong>. Nếu đủ điều kiện, chúng tôi sẽ thu hồi sản
                    phẩm lỗi và giao sản phẩm mới trong <strong>24 giờ</strong>
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <div className='w-12 h-12 bg-[#d3b673] text-white rounded-full flex items-center justify-center font-bold text-lg mr-4 flex-shrink-0'>
                  4
                </div>
                <div className='flex-1'>
                  <h3 className='font-bold text-lg mb-2'>Hoàn tất đổi trả</h3>
                  <p className='text-gray-700'>
                    Nhận sản phẩm mới hoặc hoàn tiền 100% (nếu không còn hàng). Chi phí vận chuyển đổi trả do VIFOOD
                    chịu.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cam kết chất lượng */}
          <div className='bg-white rounded-xl shadow-lg p-8 mb-8'>
            <div className='flex items-center mb-6'>
              <div className='w-16 h-16 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mr-4'>
                <FaShieldAlt className='text-3xl text-white' />
              </div>
              <h2 className='text-2xl font-bold text-[#282828]'>Cam Kết Chất Lượng</h2>
            </div>

            <div className='grid md:grid-cols-3 gap-6'>
              <div className='text-center p-6 bg-green-50 rounded-lg'>
                <div className='text-5xl font-bold text-[#d3b673] mb-2'>100%</div>
                <p className='font-semibold'>Đổi trả nếu lỗi</p>
                <p className='text-sm text-gray-600 mt-2'>Hoàn tiền hoặc đổi sản phẩm mới</p>
              </div>

              <div className='text-center p-6 bg-green-50 rounded-lg'>
                <div className='text-5xl font-bold text-[#d3b673] mb-2'>24h</div>
                <p className='font-semibold'>Xử lý nhanh chóng</p>
                <p className='text-sm text-gray-600 mt-2'>Phản hồi và giải quyết trong 1 ngày</p>
              </div>

              <div className='text-center p-6 bg-green-50 rounded-lg'>
                <div className='text-5xl font-bold text-[#d3b673] mb-2'>0đ</div>
                <p className='font-semibold'>Miễn phí vận chuyển</p>
                <p className='text-sm text-gray-600 mt-2'>Chi phí đổi trả do shop chịu</p>
              </div>
            </div>
          </div>

          {/* Hướng dẫn bảo quản */}
          <div className='bg-white rounded-xl shadow-lg p-8 mb-8'>
            <h2 className='text-2xl font-bold text-[#282828] mb-6'>Hướng Dẫn Bảo Quản Sản Phẩm Đông Lạnh</h2>

            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <h3 className='font-bold mb-3 text-[#d3b673]'>Bảo quản đúng cách:</h3>
                <ul className='space-y-2 text-gray-700'>
                  <li>✓ Bảo quản ngay trong tủ đông ở nhiệt độ -18°C</li>
                  <li>✓ Không để sản phẩm tan rã rồi đông lại</li>
                  <li>✓ Giữ nguyên bao bì kín để tránh hư hỏng</li>
                  <li>✓ Sử dụng trong thời hạn ghi trên bao bì (3-6 tháng)</li>
                </ul>
              </div>

              <div>
                <h3 className='font-bold mb-3 text-[#d3b673]'>Khi sử dụng:</h3>
                <ul className='space-y-2 text-gray-700'>
                  <li>✓ Rã đông tự nhiên trong ngăn mát tủ lạnh</li>
                  <li>✓ Hoặc rã đông bằng lò vi sóng chế độ defrost</li>
                  <li>✓ Không ngâm nước nóng để rã đông nhanh</li>
                  <li>✓ Chế biến ngay sau khi rã đông, không để lại</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Liên hệ hỗ trợ */}
          <div className='bg-gradient-to-r from-[#d3b673] to-[#b8945d] rounded-xl shadow-lg p-8 text-white text-center'>
            <FaPhoneAlt className='text-5xl mx-auto mb-4' />
            <h2 className='text-2xl font-bold mb-4'>Cần Hỗ Trợ Đổi Trả?</h2>
            <p className='text-lg mb-6'>Liên hệ ngay với chúng tôi để được giải quyết nhanh chóng</p>
            <div className='flex flex-col md:flex-row gap-4 justify-center items-center'>
              <div className='bg-white text-[#282828] px-8 py-3 rounded-lg font-bold'>Hotline: 1900.111.111</div>
              <div className='bg-white text-[#282828] px-8 py-3 rounded-lg font-bold'>Email: support@vifood.vn</div>
            </div>
          </div>
        </div>
      </main>

      <FooterHomePage />
      <ButtonDelivery />
    </>
  )
}

export default WarrantyPolicyPage
