import React, { useEffect, useState, useCallback } from 'react'
import { messageService, IConversation } from '../../services/message.service'
import { socket } from '../../socket'
import { Link, Outlet, useParams } from 'react-router-dom'
import { message as antdMessage } from 'antd'

const ChatLayout: React.FC = () => {
  const { conversationId } = useParams()
  const [conversations, setConversations] = useState<IConversation[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  })

  // Load conversations
  const loadConversations = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = {
        page: 1,
        limit: 50
      }

      if (filter !== 'all') {
        params.status = filter
      }

      if (search) {
        params.search = search
      }

      console.log('🔍 Loading conversations with params:', params)
      const response = await messageService.getConversationsForAdmin(params)
      console.log('📦 Conversations response:', response)

      if (response.success) {
        console.log('✅ Found conversations:', response.data.docs?.length || 0)
        const convos = response.data.docs || []
        setConversations(convos)
        
        // Always load all conversations to calculate counts
        const allResponse = await messageService.getConversationsForAdmin({ page: 1, limit: 100 })
        if (allResponse.success) {
          const allConvos = allResponse.data.docs || []
          const counts = {
            all: allConvos.length,
            open: allConvos.filter((c: IConversation) => c.status === 'open').length,
            inProgress: allConvos.filter((c: IConversation) => c.status === 'in-progress').length,
            resolved: allConvos.filter((c: IConversation) => c.status === 'resolved').length
          }
          setStatusCounts(counts)
          console.log('📊 Status counts:', counts)
        }
      }
    } catch (error: any) {
      console.error('❌ Error loading conversations:', error)
      console.error('Error response:', error.response?.data)
      antdMessage.error('Không thể tải danh sách hội thoại')
    } finally {
      setLoading(false)
    }
  }, [filter, search])

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await messageService.getUnreadCount()
      if (response.success) {
        setUnreadCount(response.data.unreadCount)
      }
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }, [])

  useEffect(() => {
    // Join admin room for real-time updates
    console.log('🔌 Attempting to join admin-room...')
    socket.emit('user:join', 'admin-room')
    
    // Đợi 100ms rồi mới log để đảm bảo đã join
    setTimeout(() => {
      console.log('✅ Should be joined to admin-room now')
      console.log('🔌 Socket ID:', socket.id)
      console.log('🔌 Socket connected:', socket.connected)
    }, 100)

    loadConversations()
    loadUnreadCount()

    // Socket events
    socket.on('new-customer-message', (data) => {
      console.log('📨📨📨 NEW CUSTOMER MESSAGE RECEIVED:', data)
      // Delay nhỏ để đảm bảo database đã update
      setTimeout(() => {
        loadConversations()
        loadUnreadCount()
      }, 100)
    })

    socket.on('admin:new-message', (data) => {
      console.log('🔔 ADMIN NEW MESSAGE (broadcast):', data)
      // Cập nhật ngay lập tức
      loadConversations()
      loadUnreadCount()
    })

    socket.on('new-message', (data) => {
      console.log('📨 New message received (generic):', data)
      loadConversations()
      loadUnreadCount()
    })

    socket.on('messages-read', (data) => {
      console.log('✅ Messages marked as read:', data)
      // Reload conversations để cập nhật unreadCount
      loadConversations()
      loadUnreadCount()
    })

    socket.on('conversation:status-changed', (data) => {
      console.log('🔄 Conversation status changed:', data)
      // Reload conversations để cập nhật status
      loadConversations()
    })

    return () => {
      socket.off('new-customer-message')
      socket.off('admin:new-message')
      socket.off('new-message')
      socket.off('messages-read')
      socket.off('conversation:status-changed')
    }
  }, [filter, search, loadConversations, loadUnreadCount])

  const formatTime = (time: string) => {
    const date = new Date(time)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Vừa xong'
    if (minutes < 60) return `${minutes}p`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div className='flex h-[calc(100vh-80px)] overflow-hidden bg-gray-100 dark:bg-slate-900'>
      {/* Left Sidebar - Conversation List */}
      <div className='flex w-full max-w-sm flex-col border-r border-gray-300 bg-white dark:border-slate-700 dark:bg-slate-800 shadow-sm'>
        {/* Header */}
        <div className='border-b border-gray-300 p-4 dark:border-slate-700 bg-white dark:bg-slate-800'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-xl font-bold text-gray-900 dark:text-white'>Tin nhắn</h2>
            {unreadCount > 0 && (
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white'>
                {unreadCount}
              </span>
            )}
          </div>

          {/* Search */}
          <div className='relative'>
            <input
              type='text'
              placeholder='Tìm kiếm...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full rounded-full border border-gray-200 bg-gray-50 text-gray-900 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:border-slate-400 dark:bg-slate-200 dark:text-slate-900 dark:placeholder-slate-600 dark:focus:border-primary'
            />
            <svg
              className='absolute left-3 top-2.5 h-5 w-5 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>

          {/* Filters */}
          <div className='mt-3 flex gap-2 overflow-x-auto'>
            <button
              onClick={() => setFilter('all')}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all flex items-center gap-1.5 ${
                filter === 'all'
                  ? 'bg-primary text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-white'
              }`}
            >
              <span>Tất cả</span>
              {statusCounts.all > 0 && (
                <span className={`ml-1 rounded-full px-2.5 py-1 text-sm font-extrabold shadow-md ${
                  filter === 'all'
                    ? 'bg-red-600 text-white border-2 border-red-400'
                    : 'bg-white text-red-600 border-2 border-red-500 dark:bg-slate-800 dark:text-red-400 dark:border-red-500'
                }`}>
                  {statusCounts.all}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all flex items-center gap-1.5 ${
                filter === 'open'
                  ? 'bg-primary text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-white'
              }`}
            >
              <span>📩 Mới</span>
              {statusCounts.open > 0 && (
                <span className={`ml-1 rounded-full px-2.5 py-1 text-sm font-extrabold shadow-md ${
                  filter === 'open'
                    ? 'bg-red-600 text-white border-2 border-red-400 animate-pulse'
                    : 'bg-white text-red-600 border-2 border-red-500 animate-pulse dark:bg-slate-800 dark:text-red-400 dark:border-red-500'
                }`}>
                  {statusCounts.open}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('in-progress')}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all flex items-center gap-1.5 ${
                filter === 'in-progress'
                  ? 'bg-primary text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-white'
              }`}
            >
              <span>⏳ Đang xử lý</span>
              {statusCounts.inProgress > 0 && (
                <span className={`ml-1 rounded-full px-2.5 py-1 text-sm font-extrabold shadow-md ${
                  filter === 'in-progress'
                    ? 'bg-red-600 text-white border-2 border-red-400'
                    : 'bg-white text-red-600 border-2 border-red-500 dark:bg-slate-800 dark:text-red-400 dark:border-red-500'
                }`}>
                  {statusCounts.inProgress}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all flex items-center gap-1.5 ${
                filter === 'resolved'
                  ? 'bg-primary text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-white'
              }`}
            >
              <span>✅ Đã giải quyết</span>
              {statusCounts.resolved > 0 && (
                <span className={`ml-1 rounded-full px-2.5 py-1 text-sm font-extrabold shadow-md ${
                  filter === 'resolved'
                    ? 'bg-red-600 text-white border-2 border-red-400'
                    : 'bg-white text-red-600 border-2 border-red-500 dark:bg-slate-800 dark:text-red-400 dark:border-red-500'
                }`}>
                  {statusCounts.resolved}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className='flex-1 overflow-y-auto'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary'></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className='p-8 text-center'>
              <svg
                className='mx-auto h-16 w-16 text-gray-300 dark:text-gray-600'
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
              <p className='mt-4 text-sm text-gray-500 dark:text-gray-400'>Chưa có tin nhắn nào</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <Link
                key={conversation._id}
                to={`/chat/${conversation._id}`}
                className={`flex items-center gap-3 border-b border-gray-200 p-4 transition-all duration-200 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-700 ${
                  conversationId === conversation._id 
                    ? 'bg-blue-50 border-l-4 border-l-primary dark:bg-slate-700 dark:border-l-primary' 
                    : 'bg-white dark:bg-slate-800'
                }`}
              >
                <div className='relative flex-shrink-0'>
                  <img
                    src={
                      conversation.customer.avatar ||
                      `https://ui-avatars.com/api/?name=${conversation.customer.username}&background=random`
                    }
                    alt={conversation.customer.username}
                    className='h-14 w-14 rounded-full object-cover'
                  />
                  {conversation.unreadCount.admin > 0 && (
                    <span className='absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-extrabold text-white border-2 border-white shadow-md'>
                      {conversation.unreadCount.admin}
                    </span>
                  )}
                </div>

                <div className='min-w-0 flex-1'>
                  <div className='flex items-baseline justify-between gap-2'>
                    <h3
                      className={`truncate text-sm ${
                        conversation.unreadCount.admin > 0
                          ? 'font-extrabold text-gray-900 dark:text-white'
                          : 'font-medium text-gray-700 dark:text-slate-300'
                      }`}
                    >
                      {conversation.customer.username}
                      {conversation.unreadCount.admin > 0 && (
                        <span className='ml-1 text-xs text-red-600 dark:text-red-400'>●</span>
                      )}
                    </h3>
                    <span className={`flex-shrink-0 text-xs ${
                      conversation.unreadCount.admin > 0
                        ? 'font-semibold text-gray-700 dark:text-gray-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  </div>

                  <p
                    className={`mt-1 truncate text-sm ${
                      conversation.unreadCount.admin > 0
                        ? 'font-bold text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-slate-400'
                    }`}
                  >
                    {conversation.lastMessage?.text || 'Chưa có tin nhắn'}
                  </p>

                  <div className='mt-2 flex items-center gap-2'>
                    {conversation.status === 'open' && (
                      <span className='inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'>
                        📩 Mới
                      </span>
                    )}
                    {conversation.status === 'in-progress' && (
                      <span className='inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'>
                        ⏳ Đang xử lý
                      </span>
                    )}
                    {conversation.status === 'resolved' && (
                      <span className='inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300'>
                        ✅ Đã giải quyết
                      </span>
                    )}
                    {conversation.assignedStaff && (
                      <span className='inline-flex items-center text-xs text-gray-500 dark:text-gray-400'>
                        <svg className='mr-1 h-3 w-3' fill='currentColor' viewBox='0 0 20 20'>
                          <path
                            fillRule='evenodd'
                            d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                            clipRule='evenodd'
                          />
                        </svg>
                        {conversation.assignedStaff.username}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className='flex flex-1 flex-col'>
        <Outlet />
      </div>
    </div>
  )
}

export default ChatLayout
