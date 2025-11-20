import React, { useState, useEffect } from 'react'
import CustomerChat from './CustomerChat'
import { messageService } from '../../../api/message.service'
import { useAppSelector } from '../../../store/hooks'

interface ChatWidgetProps {
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen: controlledIsOpen, onToggle }) => {
  const { user } = useAppSelector((state) => state.persistedReducer.auth)
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Sử dụng controlled hoặc uncontrolled state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const setIsOpen = (value: boolean) => {
    if (onToggle) {
      onToggle(value)
    } else {
      setInternalIsOpen(value)
    }
  }

  // Đồng bộ controlled state
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setInternalIsOpen(controlledIsOpen)
    }
  }, [controlledIsOpen])

  useEffect(() => {
    if (user) {
      // Load unread count
      const loadUnreadCount = async () => {
        try {
          const response = await messageService.getUnreadCount()
          // message.service.getUnreadCount() trả về Axios response
          if (response && response.status === 200 && response.data) {
            // cố gắng đọc các vị trí phổ biến cho unreadCount
            const count = response.data.unreadCount ?? response.data.data?.unreadCount ?? 0
            setUnreadCount(typeof count === 'number' ? count : 0)
          }
        } catch (error: any) {
          // Không log quá nhiều thông tin cho lỗi 4xx thông thường
          if (error?.response && error.response.status >= 400 && error.response.status < 500) {
            console.debug('Unread count request returned client error:', error.response.status)
          } else {
            console.error('Error loading unread count:', error)
          }
        }
      }

      loadUnreadCount()
      // Refresh every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000)

      return () => clearInterval(interval)
    }
  }, [user])

  if (!user) {
    return null
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#D7B978] text-white shadow-lg transition-all hover:bg-[#C5A868] hover:scale-110'
      >
        {isOpen ? (
          <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        ) : (
          <>
            <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              />
            </svg>
            {unreadCount > 0 && (
              <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white'>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className='fixed bottom-20 right-4 z-50 h-[500px] w-[380px] overflow-hidden rounded-lg shadow-2xl'>
          <CustomerChat onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  )
}

export default ChatWidget
