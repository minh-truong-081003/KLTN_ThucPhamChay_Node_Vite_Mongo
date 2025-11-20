import {
  FaEnvelope,
  FaFacebookSquare,
  FaGooglePlus,
  FaInstagram,
  FaMapMarker,
  FaPhone,
  FaTwitter,
  FaYoutube
} from 'react-icons/fa'

import { Link } from 'react-router-dom'

import styles from './Footer-HomePage.module.scss'

const FooterHomePage = () => {
  return (
    <footer className={`${styles.bg_footer} `}>
      <div className='max-w-[1140px] w-full mx-auto pt-[55px] relative z-10'>
        <div className='main sm:p-0 flex flex-wrap px-5'>
          <div className='w-1/2 pr-5pnpm sm:p-0 sm:w-[24%]'>
            <img className='max-h-max object-contain' src='/lgc.png' alt='' />
          </div>

          <div className='col-1 p-0 sm:pl-[30px] w-1/2 sm:w-[40%]'>
            <div className='title text-[#d3b673] mb-[30px] uppercase'>
              <h2 className='text-lg font-bold'>VIFOOD - Siêu thị chay sạch nhất Việt Nam</h2>
            </div>
            <div className='row flex sm:items-center mb-[10px]'>
              <FaMapMarker className='text-[#d3b673] text-4xl sm:text-sm mr-[10px]' />
              <span className='text-sm text-white'>01 Đ. Võ Văn Ngân, Linh Chiểu, Thủ Đức, Hồ Chí Minh</span>
            </div>
            <div className='row flex items-center mb-[10px]'>
              <FaPhone className='text-[#d3b673] text-sm mr-[10px]' />
              <span className='text-sm text-white'>1900.111.111</span>
            </div>
            <div className='row flex items-center mb-[10px]'>
              <FaEnvelope className='text-[#d3b673]  sm:text-sm mr-[10px]' />
              <span className='text-sm text-white'>vifood.contact@gmail.com</span>
            </div>
            <div className='row gap-y-3  flex flex-wrap items-center mb-5'>
              <Link to='/'>
                <FaFacebookSquare className='text-[#d3b673] text-lg mr-5' />
              </Link>
              <Link to='/'>
                <FaInstagram className='text-[#d3b673] text-lg mr-5' />
              </Link>
              <Link to='/'>
                <FaYoutube className='text-[#d3b673] text-lg mr-5' />
              </Link>
              <Link to='/'>
                <FaTwitter className='text-[#d3b673] text-lg mr-5' />
              </Link>
              <Link to='/'>
                <FaGooglePlus className='text-[#d3b673] text-lg mr-5' />
              </Link>
            </div>
            <div className='row flex flex-wrap justify-between w-[65%]'>
              <Link to='/' className='w-[48%] inline-block mb-2'>
                <img className='w-full' src='/gg-play.png' alt='' />
              </Link>
              <Link to='/' className='w-[48%] inline-block mb-2'>
                <img className='w-full' src='/app-store.png' alt='' />
              </Link>
              <Link to='/' className='w-[48%] inline-block mb-2'>
                <img className='w-full' src='/bo-cong-thuong.png' alt='' />
              </Link>
            </div>
          </div>
          <div className='col-2 p-0 sm:px-[30px] w-1/2 sm:w-auto'>
            <div className='title title text-[#d3b673] mb-[30px] text-lg uppercase'>
              <h2 className='font-bold'>Về chúng tôi</h2>
            </div>
            <div className='content'>
              <ul>
                <li className='mb-2 text-sm'>
                  <Link to='/about' className='hover:text-[#d3b673] transition-colors'>
                    Giới thiệu
                  </Link>
                </li>
                <li className='mb-2 text-sm'>
                  <Link to='/products' className='hover:text-[#d3b673] transition-colors'>
                    Sản phẩm
                  </Link>
                </li>
                <li className='mb-2 text-sm'>
                  <Link to='/blogs' className='hover:text-[#d3b673] transition-colors'>
                    Tin tức
                  </Link>
                </li>
                <li className='mb-2 text-sm'>
                  <Link to='/account-layout/my-voucher' className='hover:text-[#d3b673] transition-colors'>
                    Khuyến mãi
                  </Link>
                </li>
                <li className='mb-2 text-sm'>
                  <Link to='/account-layout/my-order' className='hover:text-[#d3b673] transition-colors'>
                    Đơn hàng
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className='col-3 pl-[30px] w-1/2 sm:w-auto'>
            <div className='title title text-[#d3b673] mb-[30px] text-lg uppercase'>
              <h2 className='font-bold'>Chính sách</h2>
            </div>
            <div className='content'>
              <ul>
                <li className='mb-2 text-sm'>
                  <Link to='/account-layout' className='hover:text-[#d3b673] transition-colors'>
                    Chính sách thành viên
                  </Link>
                </li>
                <li className='mb-2 text-sm'>
                  <Link to='/payment-methods' className='hover:text-[#d3b673] transition-colors'>
                    Hình thức thanh toán
                  </Link>
                </li>
                <li className='mb-2 text-sm'>
                  <Link to='/shipping-policy' className='hover:text-[#d3b673] transition-colors'>
                    Vận chuyển giao nhận
                  </Link>
                </li>
                <li className='mb-2 text-sm'>
                  <Link to='/warranty-policy' className='hover:text-[#d3b673] transition-colors'>
                    Đổi trả và bảo hành
                  </Link>
                </li>
                <li className='mb-2 text-sm'>
                  <Link to='/account-layout' className='hover:text-[#d3b673] transition-colors'>
                    Bảo vệ thông tin cá nhân
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className='footer-bottom border-t-white sm:flex-row flex flex-col justify-between border border-transparent'>
          <div className='font-[700] text-center my-5 mx-1'>
            Thương hiệu tiên phong sử dụng nguồn nông sản sạch và chất lượng Việt Nam
          </div>
          <div className='mx-1 my-5 text-sm text-center'>Copyrights © 2024 by TD. All rights reserved.</div>
        </div>
      </div>
      <div className={`${styles.footer_cover}`}></div>
    </footer>
  )
}

export default FooterHomePage
