import { FaCreditCard, FaMobileAlt, FaUniversity, FaWallet } from 'react-icons/fa'
import HeaderHomePage from '../../components/Header-HomePage'
import FooterHomePage from '../../components/Footer-HomePage'
import ButtonDelivery from '../../components/Button-Delivery'
import Loader from '../../components/Loader'

const PaymentMethodsPage = () => {
  return (
    <>
      <Loader />
      <HeaderHomePage />

      <main className='mt-[80px] py-16 px-5 bg-gray-50'>
        <div className='max-w-[1140px] mx-auto'>
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold text-[#282828] mb-4'>Hình Thức Thanh Toán</h1>
            <div className='w-24 h-1 bg-[#d3b673] mx-auto mb-4'></div>
            <p className='text-gray-600 max-w-2xl mx-auto'>
              VIFOOD hỗ trợ đa dạng phương thức thanh toán để bạn có trải nghiệm mua sắm thuận tiện nhất
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-8 mb-12'>
            {/* COD */}
            <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all'>
              <div className='flex items-center mb-6'>
                <div className='w-16 h-16 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mr-4'>
                  <FaWallet className='text-3xl text-white' />
                </div>
                <h2 className='text-2xl font-bold text-[#282828]'>Thanh Toán Khi Nhận Hàng (COD)</h2>
              </div>
              <ul className='space-y-3 text-gray-700'>
                <li className='flex items-start'>
                  <span className='text-[#d3b673] mr-2'>✓</span>
                  <span>Thanh toán bằng tiền mặt khi nhận hàng</span>
                </li>
                <li className='flex items-start'>
                  <span className='text-[#d3b673] mr-2'>✓</span>
                  <span>Kiểm tra hàng trước khi thanh toán</span>
                </li>
                <li className='flex items-start'>
                  <span className='text-[#d3b673] mr-2'>✓</span>
                  <span>Áp dụng cho đơn hàng dưới 5 triệu đồng</span>
                </li>
                <li className='flex items-start'>
                  <span className='text-[#d3b673] mr-2'>✓</span>
                  <span>Phí COD: 15.000đ (miễn phí cho đơn từ 300.000đ)</span>
                </li>
              </ul>
            </div>

            {/* Chuyển khoản */}
            <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all'>
              <div className='flex items-center mb-6'>
                <div className='w-16 h-16 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mr-4'>
                  <FaUniversity className='text-3xl text-white' />
                </div>
                <h2 className='text-2xl font-bold text-[#282828]'>Chuyển Khoản Ngân Hàng</h2>
              </div>
              <div className='bg-gray-50 rounded-lg p-4 mb-4'>
                <p className='font-semibold mb-2'>Thông tin tài khoản:</p>
                <p className='text-sm'>
                  <strong>Ngân hàng:</strong> Vietcombank
                </p>
                <p className='text-sm'>
                  <strong>Số TK:</strong> 0123456789
                </p>
                <p className='text-sm'>
                  <strong>Chủ TK:</strong> CONG TY VIFOOD
                </p>
                <p className='text-sm'>
                  <strong>Chi nhánh:</strong> Thủ Đức, TP.HCM
                </p>
              </div>
              <ul className='space-y-3 text-gray-700'>
                <li className='flex items-start'>
                  <span className='text-[#d3b673] mr-2'>✓</span>
                  <span>Miễn phí chuyển khoản</span>
                </li>
                <li className='flex items-start'>
                  <span className='text-[#d3b673] mr-2'>✓</span>
                  <span>Xử lý đơn sau khi nhận được tiền (1-2 giờ)</span>
                </li>
              </ul>
            </div>

            {/* Ví điện tử */}
            <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all'>
              <div className='flex items-center mb-6'>
                <div className='w-16 h-16 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mr-4'>
                  <FaMobileAlt className='text-3xl text-white' />
                </div>
                <h2 className='text-2xl font-bold text-[#282828]'>Ví Điện Tử</h2>
              </div>
              <div className='flex gap-4 mb-6'>
                <img src='https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png' alt='MoMo' className='h-12' />
                <img
                  src='https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png'
                  alt='VnPay'
                  className='h-12'
                />
                <img
                  src='https://js.stripe.com/v3/fingerprinted/img/stripe-logo-128x32.png'
                  alt='Stripe'
                  className='h-12'
                />
              </div>
              <ul className='space-y-3 text-gray-700'>
                <li className='flex items-start'>
                  <span className='text-[#d3b673] mr-2'>✓</span>
                  <span>Thanh toán nhanh chóng, bảo mật</span>
                </li>
                <li className='flex items-start'>
                  <span className='text-[#d3b673] mr-2'>✓</span>
                  <span>Hỗ trợ MoMo, VnPay, Stripe</span>
                </li>
                <li className='flex items-start'>
                  <span className='text-[#d3b673] mr-2'>✓</span>
                  <span>Nhận ưu đãi từ ví điện tử và thẻ quốc tế</span>
                </li>
              </ul>
            </div>

            {/* Thẻ ATM/Credit */}
            <div className='bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all'>
              <div className='flex items-center mb-6'>
                <div className='w-16 h-16 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mr-4'>
                  <FaCreditCard className='text-3xl text-white' />
                </div>
                <h2 className='text-2xl font-bold text-[#282828]'>Thẻ ATM / Credit Card</h2>
              </div>
              <ul className='space-y-3 text-gray-700'>
                <li className='flex items-start'>
                  <span className='text-[#d3b673] mr-2'>✓</span>
                  <span>Chấp nhận thẻ nội địa và quốc tế</span>
                </li>
                <li className='flex items-start'>
                  <span className='text-[#d3b673] mr-2'>✓</span>
                  <span>Visa, MasterCard, JCB</span>
                </li>
                <li className='flex items-start'>
                  <span className='text-[#d3b673] mr-2'>✓</span>
                  <span>Bảo mật tuyệt đối với chuẩn PCI DSS</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Lưu ý */}
          <div className='bg-yellow-50 border-l-4 border-[#d3b673] rounded-lg p-6'>
            <h3 className='font-bold text-lg mb-3 text-[#282828]'>Lưu ý quan trọng:</h3>
            <ul className='space-y-2 text-gray-700'>
              <li>• Vui lòng kiểm tra kỹ thông tin đơn hàng trước khi thanh toán</li>
              <li>• Với chuyển khoản, vui lòng ghi rõ nội dung: "Mã đơn hàng + Số điện thoại"</li>
              <li>• Đơn hàng được xử lý sau khi xác nhận thanh toán thành công</li>
              <li>
                • Liên hệ <strong className='text-[#d3b673]'>1900.111.111</strong> nếu cần hỗ trợ
              </li>
            </ul>
          </div>
        </div>
      </main>

      <FooterHomePage />
      <ButtonDelivery />
    </>
  )
}

export default PaymentMethodsPage
