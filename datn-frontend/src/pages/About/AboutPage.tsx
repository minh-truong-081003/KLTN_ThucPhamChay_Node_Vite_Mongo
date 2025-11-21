import { FaCheckCircle, FaLeaf, FaShoppingBag, FaStar } from 'react-icons/fa'
import HeaderHomePage from '../../components/Header-HomePage'
import FooterHomePage from '../../components/Footer-HomePage'
import ButtonDelivery from '../../components/Button-Delivery'
import Loader from '../../components/Loader'

const AboutPage = () => {
  return (
    <>
      <Loader />
      <HeaderHomePage />

      {/* Hero Section với background thực phẩm chay */}
      <section className='relative h-[400px] md:h-[500px] overflow-hidden mt-[80px]'>
        {/* Background image với overlay */}
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat'
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=600&fit=crop&crop=center')`
          }}
        >
          <div className='absolute inset-0 bg-gradient-to-r from-green-900/80 via-green-800/70 to-emerald-900/80'></div>
          <div className='absolute inset-0 bg-black/30'></div>
        </div>

        {/* Floating elements */}
        <div className='absolute inset-0 overflow-hidden'>
          <div
            className='absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-bounce'
            style={{ animationDelay: '0s' }}
          ></div>
          <div
            className='absolute top-32 right-20 w-12 h-12 bg-[#d3b673]/20 rounded-full animate-bounce'
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className='absolute bottom-32 left-20 w-20 h-20 bg-green-400/20 rounded-full animate-bounce'
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        <div className='relative z-10 h-full flex items-center justify-center px-4'>
          <div className='text-center text-white max-w-4xl mx-auto'>
            <div className='flex items-center justify-center mb-6'>
              <FaLeaf className='text-[#d3b673] text-4xl mr-3 animate-pulse' />
              <h1 className='text-4xl md:text-6xl font-bold animate-fade-in'>VIFOOD - Siêu Thị Chay Sạch</h1>
              <FaLeaf className='text-[#d3b673] text-4xl ml-3 animate-pulse' />
            </div>
            <p className='text-xl md:text-2xl mb-8 text-gray-100 animate-fade-in' style={{ animationDelay: '0.3s' }}>
              Thương hiệu tiên phong sử dụng nguồn sản phẩm chay sạch
            </p>
            <div
              className='flex items-center justify-center space-x-4 animate-fade-in'
              style={{ animationDelay: '0.6s' }}
            >
              <div className='w-32 h-1 bg-[#d3b673] mx-auto'></div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className='absolute bottom-0 left-0 right-0'>
          <svg viewBox='0 0 1200 120' preserveAspectRatio='none' className='w-full h-16 fill-white'>
            <path d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z'></path>
          </svg>
        </div>
      </section>

      <main className='py-16 px-5'>
        <div className='max-w-[1140px] mx-auto'>
          {/* Giới thiệu chung */}
          <section className='mb-16'>
            <div className='grid md:grid-cols-2 gap-12 items-center'>
              <div>
                <h2 className='text-3xl font-bold text-[#282828] mb-6'>Về Chúng Tôi</h2>
                <div className='w-24 h-1 bg-[#d3b673] mb-6'></div>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  <strong className='text-[#d3b673]'>VIFOOD</strong> là cửa hàng chuyên cung cấp các sản phẩm thực phẩm
                  chay đóng gói, hàng đông lạnh chất lượng cao với công nghệ{' '}
                  <strong>IQF (Individual Quick Frozen)</strong> - bảo quản ở nhiệt độ -18°C để giữ trọn dinh dưỡng và
                  hương vị tự nhiên.
                </p>
                <p className='text-gray-700 leading-relaxed mb-4'>
                  Với sứ mệnh mang đến cho người tiêu dùng những sản phẩm chay{' '}
                  <strong>sạch - an toàn - dinh dưỡng</strong>, chúng tôi cam kết 100% nguồn gốc rõ ràng, không chất bảo
                  quản độc hại.
                </p>
                <p className='text-gray-700 leading-relaxed'>
                  Thời hạn sử dụng từ <strong>3-6 tháng</strong>, giúp bạn luôn có sẵn thực phẩm chất lượng cho bữa ăn
                  gia đình mọi lúc mọi nơi.
                </p>
              </div>
              <div className='rounded-xl overflow-hidden shadow-2xl'>
                <img
                  src='https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'
                  alt='Thực phẩm chay'
                  className='w-full h-full object-cover hover:scale-110 transition-transform duration-500'
                />
              </div>
            </div>
          </section>

          {/* Giá trị cốt lõi */}
          <section className='mb-16 bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl p-8 md:p-12'>
            <h2 className='text-3xl font-bold text-center text-[#282828] mb-3'>Giá Trị Cốt Lõi</h2>
            <div className='w-24 h-1 bg-[#d3b673] mx-auto mb-12'></div>

            <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-[#d3b673] rounded-full flex items-center justify-center mx-auto mb-4'>
                  <FaLeaf className='text-3xl text-white' />
                </div>
                <h3 className='font-bold text-lg mb-2'>100% Chay Sạch</h3>
                <p className='text-gray-600 text-sm'>Không chất bảo quản độc hại, nguồn gốc rõ ràng</p>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 bg-[#d3b673] rounded-full flex items-center justify-center mx-auto mb-4'>
                  <FaCheckCircle className='text-3xl text-white' />
                </div>
                <h3 className='font-bold text-lg mb-2'>Chất Lượng Cao</h3>
                <p className='text-gray-600 text-sm'>Công nghệ IQF giữ trọn dinh dưỡng</p>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 bg-[#d3b673] rounded-full flex items-center justify-center mx-auto mb-4'>
                  <FaShoppingBag className='text-3xl text-white' />
                </div>
                <h3 className='font-bold text-lg mb-2'>Đa Dạng Sản Phẩm</h3>
                <p className='text-gray-600 text-sm'>Hơn 100+ sản phẩm chay đóng gói, đông lạnh</p>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 bg-[#d3b673] rounded-full flex items-center justify-center mx-auto mb-4'>
                  <FaStar className='text-3xl text-white' />
                </div>
                <h3 className='font-bold text-lg mb-2'>Uy Tín Hàng Đầu</h3>
                <p className='text-gray-600 text-sm'>Được hàng nghìn khách hàng tin tưởng</p>
              </div>
            </div>
          </section>

          {/* Sứ mệnh & Tầm nhìn */}
          <section className='mb-16'>
            <div className='grid md:grid-cols-2 gap-8'>
              <div className='bg-white rounded-xl shadow-lg p-8 border-t-4 border-[#d3b673]'>
                <h3 className='text-2xl font-bold text-[#282828] mb-4'>Sứ Mệnh</h3>
                <p className='text-gray-700 leading-relaxed'>
                  Cung cấp thực phẩm chay chất lượng cao, an toàn và tiện lợi cho mọi gia đình Việt Nam. Góp phần thúc
                  đẩy lối sống lành mạnh, bảo vệ môi trường và phát triển bền vững.
                </p>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-8 border-t-4 border-[#d3b673]'>
                <h3 className='text-2xl font-bold text-[#282828] mb-4'>Tầm Nhìn</h3>
                <p className='text-gray-700 leading-relaxed'>
                  Trở thành thương hiệu thực phẩm chay hàng đầu Việt Nam, mở rộng mạng lưới phân phối toàn quốc và xuất
                  khẩu quốc tế, mang văn hóa ẩm thực chay Việt ra thế giới.
                </p>
              </div>
            </div>
          </section>

          {/* Cam kết */}
          <section className='bg-[#282828] text-white rounded-2xl p-8 md:p-12 text-center'>
            <h2 className='text-3xl font-bold mb-6'>Cam Kết Của VIFOOD</h2>
            <div className='grid md:grid-cols-3 gap-6 mt-8'>
              <div>
                <div className='text-5xl font-bold text-[#d3b673] mb-2'>100%</div>
                <p>Sản phẩm chay thuần túy</p>
              </div>
              <div>
                <div className='text-5xl font-bold text-[#d3b673] mb-2'>24/7</div>
                <p>Hỗ trợ khách hàng</p>
              </div>
              <div>
                <div className='text-5xl font-bold text-[#d3b673] mb-2'>3-6</div>
                <p>Tháng thời hạn sử dụng</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <FooterHomePage />
      <ButtonDelivery />
    </>
  )
}

export default AboutPage
