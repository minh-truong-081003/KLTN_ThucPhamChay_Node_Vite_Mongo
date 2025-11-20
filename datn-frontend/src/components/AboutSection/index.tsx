import { FaCheckCircle, FaLeaf, FaShoppingBag, FaStar } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const AboutSection = () => {
  return (
    <section className='py-16 px-5 bg-gradient-to-b from-white to-gray-50'>
      <div className='max-w-[1140px] mx-auto'>
        {/* Giới thiệu chung */}
        <div className='grid md:grid-cols-2 gap-12 items-center mb-16'>
          <div>
            <h2 className='text-3xl md:text-4xl font-bold text-[#282828] mb-6'>Về VIFOOD</h2>
            <div className='w-24 h-1 bg-[#d3b673] mb-6'></div>
            <p className='text-gray-700 leading-relaxed mb-4'>
              <strong className='text-[#d3b673]'>VIFOOD</strong> là cửa hàng chuyên cung cấp các sản phẩm thực phẩm chay
              đóng gói, hàng đông lạnh chất lượng cao với công nghệ <strong>IQF (Individual Quick Frozen)</strong> - bảo
              quản ở nhiệt độ -18°C để giữ trọn dinh dưỡng và hương vị tự nhiên.
            </p>
            <p className='text-gray-700 leading-relaxed mb-4'>
              Với sứ mệnh mang đến cho người tiêu dùng những sản phẩm chay <strong>sạch - an toàn - dinh dưỡng</strong>,
              chúng tôi cam kết 100% nguồn gốc rõ ràng, không chất bảo quản độc hại.
            </p>
            <p className='text-gray-700 leading-relaxed mb-6'>
              Thời hạn sử dụng từ <strong>3-6 tháng</strong>, giúp bạn luôn có sẵn thực phẩm chất lượng cho bữa ăn gia
              đình mọi lúc mọi nơi.
            </p>
            <Link
              to='/about'
              className='inline-block bg-[#d3b673] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#b8945d] transition-all transform hover:scale-105 shadow-lg'
            >
              Tìm Hiểu Thêm →
            </Link>
          </div>
          <div className='rounded-xl overflow-hidden shadow-2xl'>
            <img
              src='https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'
              alt='Thực phẩm chay'
              className='w-full h-full object-cover hover:scale-110 transition-transform duration-500'
            />
          </div>
        </div>

        {/* Giá trị cốt lõi */}
        <div className='bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl p-8 md:p-12'>
          <h2 className='text-3xl font-bold text-center text-[#282828] mb-3'>Tại Sao Chọn VIFOOD?</h2>
          <div className='w-24 h-1 bg-[#d3b673] mx-auto mb-12'></div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
            <div className='text-center transform hover:scale-105 transition-transform'>
              <div className='w-16 h-16 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
                <FaLeaf className='text-3xl text-white' />
              </div>
              <h3 className='font-bold text-lg mb-2'>100% Chay Sạch</h3>
              <p className='text-gray-600 text-sm'>Không chất bảo quản độc hại, nguồn gốc rõ ràng</p>
            </div>

            <div className='text-center transform hover:scale-105 transition-transform'>
              <div className='w-16 h-16 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
                <FaCheckCircle className='text-3xl text-white' />
              </div>
              <h3 className='font-bold text-lg mb-2'>Chất Lượng Cao</h3>
              <p className='text-gray-600 text-sm'>Công nghệ IQF giữ trọn dinh dưỡng</p>
            </div>

            <div className='text-center transform hover:scale-105 transition-transform'>
              <div className='w-16 h-16 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
                <FaShoppingBag className='text-3xl text-white' />
              </div>
              <h3 className='font-bold text-lg mb-2'>Đa Dạng Sản Phẩm</h3>
              <p className='text-gray-600 text-sm'>Hơn 100+ sản phẩm chay đóng gói, đông lạnh</p>
            </div>

            <div className='text-center transform hover:scale-105 transition-transform'>
              <div className='w-16 h-16 bg-gradient-to-br from-[#d3b673] to-[#b8945d] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg'>
                <FaStar className='text-3xl text-white' />
              </div>
              <h3 className='font-bold text-lg mb-2'>Uy Tín Hàng Đầu</h3>
              <p className='text-gray-600 text-sm'>Được hàng nghìn khách hàng tin tưởng</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
