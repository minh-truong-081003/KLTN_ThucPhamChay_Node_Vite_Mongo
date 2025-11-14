import React from 'react'

const ChatEmptyState: React.FC = () => {
  return (
    <div className='flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900'>
      <div className='text-center'>
        <svg
          className='mx-auto h-24 w-24 text-gray-300 dark:text-gray-600'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1.5}
            d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
          />
        </svg>
        <h3 className='mt-4 text-lg font-medium text-gray-900 dark:text-white'>Chọn một cuộc hội thoại</h3>
        <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
          Chọn một khách hàng từ danh sách bên trái để bắt đầu chat
        </p>
      </div>
    </div>
  )
}

export default ChatEmptyState
