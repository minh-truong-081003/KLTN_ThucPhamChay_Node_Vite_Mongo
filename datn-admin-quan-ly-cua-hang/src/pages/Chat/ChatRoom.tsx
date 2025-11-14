import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { messageService, IMessage, IConversation } from '../../services/message.service'
import { socket } from '../../socket'
import { message as antdMessage, Select } from 'antd'
import { useAppSelector } from '../../store/hooks'

const ChatRoom: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.persistedReducer.auth)
  const [conversation, setConversation] = useState<IConversation | null>(null)
  const [messages, setMessages] = useState<IMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load conversation details
  const loadConversation = useCallback(async () => {
    if (!conversationId) return

    try {
      const response = await messageService.getConversationById(conversationId)
      if (response.success && response.data) {
        setConversation(response.data)
        setNotFound(false)
      } else {
        setNotFound(true)
        console.warn('Conversation not found:', conversationId)
        // Redirect to empty state after a short delay
        setTimeout(() => {
          navigate('/chat')
        }, 1000)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      setNotFound(true)
      setTimeout(() => {
        navigate('/chat')
      }, 1000)
    }
  }, [conversationId, navigate])

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!conversationId) return

    setLoading(true)
    try {
      const response = await messageService.getMessages(conversationId, {
        page: 1,
        limit: 100
      })
      if (response.success) {
        setMessages(response.data.docs || [])
        // Mark as read
        await messageService.markMessagesAsRead(conversationId)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      antdMessage.error('Không thể tải tin nhắn')
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    if (conversationId) {
      loadConversation()
      loadMessages()

      // Join conversation room
      console.log('🔌 [Admin] Joining conversation room:', conversationId)
      socket.emit('conversation:join', conversationId)

      // Tự động chuyển trạng thái sang "đang xử lí" khi admin join và đã xem tin nhắn
      const autoUpdateStatus = async () => {
        try {
          const response = await messageService.getConversationById(conversationId)
          if (response.success && response.data) {
            // Chỉ tự động chuyển nếu đang ở trạng thái "open" (mới) 
            // VÀ admin đã xem (unreadCount = 0 sau khi mark as read)
            if (response.data.status === 'open') {
              console.log('🔄 Auto-updating conversation status to in-progress')
              // Đợi mark as read xong rồi mới update status
              setTimeout(async () => {
                await messageService.updateConversationStatus(conversationId, { 
                  status: 'in-progress' 
                })
                // Reload để cập nhật UI local
                loadConversation()
                // Emit event để sidebar cập nhật
                socket.emit('conversation:status-changed', {
                  conversationId,
                  status: 'in-progress'
                })
              }, 500)
            }
          }
        } catch (error) {
          console.error('Error auto-updating status:', error)
        }
      }
      autoUpdateStatus()

      // Remove old listeners trước khi đăng ký mới
      socket.off('new-message')
      socket.off('user-typing')
      socket.off('user-stop-typing')

      // Socket events
      const handleNewMessage = (data: any) => {
        console.log('📨 [Admin] Received new message:', data)
        if (data.conversationId === conversationId) {
          setMessages((prev) => {
            // Check xem message đã tồn tại chưa để tránh duplicate
            const exists = prev.some(msg => msg._id === data.message._id)
            if (exists) {
              console.log('⚠️ [Admin] Message already exists, skipping')
              return prev
            }
            return [...prev, data.message]
          })
          scrollToBottom()
          // Mark as read
          messageService.markMessagesAsRead(conversationId)
        }
      }

      const handleTyping = () => setIsTyping(true)
      const handleStopTyping = () => setIsTyping(false)

      socket.on('new-message', handleNewMessage)
      socket.on('user-typing', handleTyping)
      socket.on('user-stop-typing', handleStopTyping)

      return () => {
        socket.emit('conversation:leave', conversationId)
        socket.off('new-message')
        socket.off('user-typing')
        socket.off('user-stop-typing')
      }
    }
  }, [conversationId, loadConversation, loadMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputText.trim() || !conversationId) return

    setSending(true)
    try {
      await messageService.sendMessage({
        conversationId,
        text: inputText.trim()
      })
      setInputText('')
      // Stop typing indicator
      socket.emit('typing:stop', { conversationId })
    } catch (error) {
      console.error('Error sending message:', error)
      antdMessage.error('Không thể gửi tin nhắn')
    } finally {
      setSending(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)

    // Typing indicator
    socket.emit('typing:start', { conversationId })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { conversationId })
    }, 1000)
  }

  const handleUpdateStatus = async (status: string) => {
    if (!conversationId) return

    try {
      await messageService.updateConversationStatus(conversationId, { status: status as any })
      antdMessage.success('Đã cập nhật trạng thái')
      loadConversation()
      
      // Emit event để sidebar cập nhật
      socket.emit('conversation:status-changed', {
        conversationId,
        status
      })
    } catch (error) {
      console.error('Error updating status:', error)
      antdMessage.error('Không thể cập nhật trạng thái')
    }
  }

  const formatTime = (time: string) => {
    if (!time) return ''
    const date = new Date(time)
    if (isNaN(date.getTime())) return ''
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 24) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) + ' ' + 
             date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (notFound) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
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
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <p className='mt-4 text-gray-500 dark:text-gray-400'>Không tìm thấy cuộc trò chuyện</p>
          <p className='text-sm text-gray-400 dark:text-gray-500'>Đang chuyển hướng...</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col bg-white dark:bg-slate-900'>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800'>
        <div className='flex items-center gap-3'>
          <img
            src={conversation.customer.avatar || `https://ui-avatars.com/api/?name=${conversation.customer.username}`}
            alt={conversation.customer.username}
            className='h-10 w-10 rounded-full object-cover'
          />
          <div>
            <h2 className='font-semibold text-gray-900 dark:text-white'>{conversation.customer.username}</h2>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {conversation.customer.account || 'Đang hoạt động'}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Select
            value={conversation.status}
            onChange={handleUpdateStatus}
            size='small'
            style={{ width: 130 }}
            options={[
              { value: 'open', label: '📩 Mới' },
              { value: 'in-progress', label: '⏳ Đang xử lý' },
              { value: 'resolved', label: '✅ Đã giải quyết' },
              { value: 'closed', label: '🔒 Đã đóng' }
            ]}
          />
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-900'>
        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary'></div>
          </div>
        ) : (
          <div className='space-y-4'>
            {messages.map((message) => {
              // Tin nhắn của mình (admin/staff hiện tại) - bên phải
              const isMyMessage = message.sender._id === user?._id
              
              return (
                <div
                  key={message._id}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[70%] gap-3 ${
                      isMyMessage ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <img
                      src={message.sender.avatar || `https://ui-avatars.com/api/?name=${message.sender.username}`}
                      alt={message.sender.username}
                      className='h-8 w-8 rounded-full object-cover'
                    />
                    <div className='flex flex-col gap-1'>
                      <div
                        className={`rounded-lg px-4 py-2 shadow-md ${
                          isMyMessage
                            ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white'
                            : 'bg-gray-50 text-gray-900 border border-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600'
                        }`}
                        style={isMyMessage ? { backgroundColor: '#2563eb', color: 'white' } : undefined}
                      >
                        <p className='whitespace-pre-wrap break-words'>{message.text}</p>
                      </div>
                      <span
                        className={`text-xs ${
                          isMyMessage 
                            ? 'text-gray-500 dark:text-gray-400 text-right' 
                            : 'text-gray-500 dark:text-gray-400 text-left'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}

            {isTyping && (
              <div className='flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400'>
                <span>Khách hàng đang nhập...</span>
                <div className='flex gap-1'>
                  <span className='h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-slate-500'></span>
                  <span className='h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-100 dark:bg-slate-500'></span>
                  <span className='h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-200 dark:bg-slate-500'></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className='border-t border-gray-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800'>
        <form onSubmit={handleSendMessage} className='flex items-end gap-2'>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            placeholder='Nhập tin nhắn...'
            rows={1}
            disabled={sending}
            className='flex-1 resize-none rounded-full border bg-white text-gray-900 border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-400 dark:bg-slate-200 dark:text-slate-900 dark:placeholder-slate-600'
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e)
              }
            }}
          />
          <button
            type='submit'
            disabled={!inputText.trim() || sending}
            className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'
            title='Gửi (Enter)'
          >
            {sending ? (
              <svg className='h-4 w-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
            ) : (
              <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
              </svg>
            )}
          </button>
        </form>
        <p className='mt-1 text-xs text-gray-400'>Nhấn Enter để gửi, Shift+Enter để xuống dòng</p>
      </div>
    </div>
  )
}

export default ChatRoom
