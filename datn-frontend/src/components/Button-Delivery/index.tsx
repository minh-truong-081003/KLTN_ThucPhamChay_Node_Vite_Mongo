import { useLocation } from 'react-router-dom'
import { SupportBot } from '../../features'
import styles from './Button-Delivery.module.scss'
import { useState } from 'react'
import { ChatWidget } from '../../features/chat'

const ButtonDelivery = () => {
  const [openAI, setOpenAI] = useState(false)
  const [openChat, setOpenChat] = useState(false)
  const location = useLocation()

  const showDrawer = () => {
    if (!openAI) {
      // Nếu đang mở chat thường thì đóng nó lại
      setOpenChat(false)
    }
    setOpenAI(!openAI)
  }

  const handleChatToggle = (isOpen: boolean) => {
    if (isOpen) {
      // Nếu mở chat thường thì đóng chat AI
      setOpenAI(false)
    }
    setOpenChat(isOpen)
  }

  // Kiểm tra trang hiện tại
  const isProductsPage = location.pathname.startsWith('/products')

  // Hiển thị giỏ hàng: Trang chủ và các trang khác (trừ trang sản phẩm)
  const showCartButton = !isProductsPage

  return (
    <>
      {/* Chat AI Bot và Giỏ hàng */}
      <div className='fixed right-4 bottom-20 flex flex-col items-center gap-3 z-40'>
        {/* Chat AI Bot */}
        <div className=''>
          <button onClick={showDrawer}>
            <img
              src='https://cdn.dribbble.com/users/464600/screenshots/2863054/bot-emotions-principle.gif'
              className={`${styles.btn_delivery_img} object-cover h-full w-full rounded-full`}
              alt='Chat AI'
            />
          </button>
          {openAI && <SupportBot showDrawer={showDrawer} />}
        </div>

        {/* Giỏ hàng - Chỉ hiện khi không phải trang sản phẩm */}
        {showCartButton && (
          <a href='/products'>
            <img src='/button_basket.png' className={`${styles.btn_delivery_img}`} alt='Giỏ hàng' />
          </a>
        )}
      </div>

      {/* Chat thường (CustomerChat) - Component này tự quản lý vị trí */}
      <ChatWidget isOpen={openChat} onToggle={handleChatToggle} />
    </>
  )
}

export default ButtonDelivery
