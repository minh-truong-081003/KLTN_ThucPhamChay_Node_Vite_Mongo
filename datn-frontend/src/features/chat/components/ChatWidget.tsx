import React, { useState, useEffect } from 'react'
import CustomerChat from './CustomerChat'
import { messageService } from '../../../api/message.service'
import { useAppSelector } from '../../../store/hooks'

const ChatWidget: React.FC = () => {
  const { user } = useAppSelector((state) => state.persistedReducer.auth)
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      // Load unread count
      const loadUnreadCount = async () => {
        try {
          const response = await messageService.getUnreadCount()
          if (response.success) {
            setUnreadCount(response.data.unreadCount)
          }
        } catch (error) {
          console.error('Error loading unread count:', error)
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
        className='fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#D7B978] text-white shadow-lg transition-all hover:bg-[#C5A868] hover:scale-110'
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
        <div className='fixed bottom-24 right-6 z-50 h-[600px] w-[400px] overflow-hidden rounded-lg shadow-2xl'>
          <CustomerChat onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  )
}

export default ChatWidget
