import React, { useEffect, useState, useRef, useCallback } from 'react'
import { messageService, IMessage, IConversation } from '../../../api/message.service'
import { useAppSelector } from '../../../store/hooks'
import { socket } from '../../../socket'
import { message as antdMessage } from 'antd'

interface CustomerChatProps {
  onClose?: () => void
}

const CustomerChat: React.FC<CustomerChatProps> = ({ onClose }) => {
  const { user } = useAppSelector((state) => state.persistedReducer.auth)
  const [conversation, setConversation] = useState<IConversation | null>(null)
  const [messages, setMessages] = useState<IMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load conversation
  const loadConversation = useCallback(async () => {
    if (!user?._id) return

    try {
      const response = await messageService.getOrCreateConversation(user._id)
      if (response.success) {
        setConversation(response.data)
        return response.data._id
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      return null
    }
  }, [user])

  // Load messages
  const loadMessages = useCallback(async (convId: string) => {
    setLoading(true)
    try {
      const response = await messageService.getMessages(convId, {
        page: 1,
        limit: 100
      })
      if (response.success) {
        setMessages(response.data.docs || [])
        // Mark as read
        await messageService.markMessagesAsRead(convId)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initChat = async () => {
      const convId = await loadConversation()
      if (convId) {
        await loadMessages(convId)

        // Join conversation room
        console.log('🔌 Joining conversation room:', convId)
        socket.emit('conversation:join', convId)
        if (user?._id) {
          console.log('🔌 Joining user room:', user._id)
          socket.emit('user:join', user._id)
        }

        // Remove old listeners trước khi đăng ký mới
        socket.off('new-message')
        socket.off('user-typing')
        socket.off('user-stop-typing')

        // Socket events
        const handleNewMessage = (data: { message: IMessage; conversationId: string }) => {
          console.log('📨 Received new message:', data)
          if (data.conversationId === convId) {
            setMessages((prev) => {
              // Check xem message đã tồn tại chưa để tránh duplicate
              const exists = prev.some(msg => msg._id === data.message._id)
              if (exists) {
                console.log('⚠️ Message already exists, skipping')
                return prev
              }
              return [...prev, data.message]
            })
            scrollToBottom()
            // Mark as read
            messageService.markMessagesAsRead(convId)
          }
        }

        const handleTyping = () => setIsTyping(true)
        const handleStopTyping = () => setIsTyping(false)

        socket.on('new-message', handleNewMessage)
        socket.on('user-typing', handleTyping)
        socket.on('user-stop-typing', handleStopTyping)
      }
    }

    initChat()

    return () => {
      if (conversation?._id) {
        socket.emit('conversation:leave', conversation._id)
      }
      socket.off('new-message')
      socket.off('user-typing')
      socket.off('user-stop-typing')
    }
  }, [user, loadConversation, loadMessages, conversation?._id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputText.trim() || !conversation?._id) return

    setSending(true)
    try {
      await messageService.sendMessage({
        conversationId: conversation._id,
        text: inputText.trim()
      })
      setInputText('')
      // Stop typing indicator
      socket.emit('typing:stop', { conversationId: conversation._id })
    } catch (error) {
      console.error('Error sending message:', error)
      antdMessage.error('Không thể gửi tin nhắn')
    } finally {
      setSending(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)

    if (conversation?._id) {
      // Typing indicator
      socket.emit('typing:start', {
        conversationId: conversation._id,
        userId: user?._id,
        username: user?.username
      })

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { conversationId: conversation._id, userId: user?._id })
      }, 1000)
    }
  }

  const formatTime = (time: string) => {
    const date = new Date(time)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className='flex h-full flex-col bg-white'>
      {/* Header */}
      <div className='flex items-center justify-between border-b bg-[#D7B978] px-4 py-3'>
        <div className='flex items-center gap-3'>
          <img
            src='https://png.pngtree.com/png-clipart/20230409/original/pngtree-admin-and-customer-service-job-vacancies-png-image_9041264.png'
            alt='Support'
            className='h-10 w-10 rounded-full object-cover'
          />
          <div>
            <h3 className='font-semibold text-white'>Nhân viên hỗ trợ</h3>
            <p className='text-xs text-white/80'>{isTyping ? 'Đang nhập...' : 'Luôn sẵn sàng hỗ trợ bạn'}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className='text-white hover:text-white/80 transition-colors'>
            <svg className='h-6 w-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto bg-gray-50 p-4'>
        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#D7B978]'></div>
          </div>
        ) : messages.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <svg className='mb-4 h-16 w-16 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              />
            </svg>
            <p className='text-gray-500'>Bắt đầu cuộc trò chuyện của bạn</p>
            <p className='text-sm text-gray-400'>Chúng tôi sẵn sàng hỗ trợ bạn!</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {messages.map((message) => {
              // Tin nhắn của mình (customer hiện tại) - bên phải
              const isMyMessage = message.sender._id === user?._id
              
              return (
                <div
                  key={message._id}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[80%] gap-2 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <img
                      src={message.sender.avatar || `https://ui-avatars.com/api/?name=${message.sender.username}`}
                      alt={message.sender.username}
                      className='h-8 w-8 flex-shrink-0 rounded-full object-cover'
                    />
                    <div className='flex flex-col gap-1'>
                      <div
                        className={`rounded-lg px-4 py-2 shadow-md ${
                          isMyMessage 
                            ? 'bg-[#D7B978] text-white' 
                            : 'bg-gray-100 text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className='whitespace-pre-wrap break-words text-sm'>{message.text}</p>
                      </div>
                      <span
                        className={`text-xs text-gray-400 ${isMyMessage ? 'text-right' : 'text-left'}`}
                      >
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}

            {isTyping && (
              <div className='flex items-start gap-2'>
                <img
                  src='https://png.pngtree.com/png-clipart/20230409/original/pngtree-admin-and-customer-service-job-vacancies-png-image_9041264.png'
                  alt='Support'
                  className='h-8 w-8 rounded-full object-cover'
                />
                <div className='rounded-lg bg-white px-4 py-3 shadow-sm'>
                  <div className='flex gap-1'>
                    <span className='h-2 w-2 animate-bounce rounded-full bg-gray-400'></span>
                    <span className='h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.1s]'></span>
                    <span className='h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]'></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className='border-t bg-white p-4'>
        <form onSubmit={handleSendMessage} className='flex gap-2'>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            placeholder='Nhập tin nhắn của bạn...'
            rows={1}
            disabled={sending}
            className='flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#D7B978] focus:outline-none'
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
            className='rounded-lg bg-[#D7B978] px-4 py-2 text-white transition-colors hover:bg-[#C5A868] disabled:cursor-not-allowed disabled:opacity-50'
          >
            <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default CustomerChat
