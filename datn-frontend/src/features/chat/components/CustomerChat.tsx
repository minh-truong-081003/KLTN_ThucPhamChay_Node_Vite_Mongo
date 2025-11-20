import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { messageService, IMessage, IConversation } from '../../../api/message.service'
import { useAppSelector } from '../../../store/hooks'
import { socket } from '../../../socket'
import { message as antdMessage } from 'antd'
import ImageModal from './ImageModal'

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
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalImage, setModalImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
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
        socket.emit('conversation:join', convId)
        if (user?._id) {
          socket.emit('user:join', user._id)
        }

        // Remove old listeners trước khi đăng ký mới
        socket.off('new-message')
        socket.off('user-typing')
        socket.off('user-stop-typing')

        // Socket events
        const handleNewMessage = (data: { message: IMessage; conversationId: string }) => {
          if (data.conversationId === convId) {
            setMessages((prev) => {
              // Check xem message đã tồn tại chưa để tránh duplicate
              const exists = prev.some((msg) => msg._id === data.message._id)
              if (exists) {
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

    if (!conversation?._id) return

    setSending(true)
    try {
      await messageService.sendMessage({
        conversationId: conversation._id,
        text: inputText.trim() || ' '
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !conversation?._id) return

    // Helper: resize image on client to improve upload speed (optimized)
    const resizeImage = useCallback((file: File, maxWidth = 800, quality = 0.7): Promise<Blob> => {
      return new Promise((resolve) => {
        // Skip processing for non-images or small files
        if (!file.type.startsWith('image/') || file.size <= 100 * 1024) {
          resolve(file)
          return
        }

        const img = new Image()
        const reader = new FileReader()

        reader.onload = (ev) => {
          img.src = ev.target?.result as string
        }

        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            resolve(file)
            return
          }

          const ratio = img.width / img.height
          const width = Math.min(maxWidth, img.width)
          const height = Math.round(width / ratio)

          canvas.width = width
          canvas.height = height

          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              resolve(blob || file)
            },
            'image/jpeg',
            quality
          )
        }

        reader.readAsDataURL(file)
      })
    }, [])

    const fileArray = Array.from(files)
    try {
      setUploading(true)
      setUploadProgress(0)

      const processedFiles = await Promise.all(
        fileArray.slice(0, 5).map(async (file) => {
          // Limit to 5 files max
          try {
            const blob = await resizeImage(file)
            return blob instanceof File
              ? blob
              : new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: blob.type })
          } catch (err) {
            return file
          }
        })
      )

      const formData = new FormData()
      processedFiles.forEach((f) => formData.append('images', f))

      const uploadRes = await messageService.uploadImages(formData, (progressEvent: any) => {
        if (progressEvent?.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percent)
        }
      })

      const uploaded = uploadRes?.urls || []
      const urls = uploaded.map((u: any) => u.url)

      if (urls.length > 0) {
        await messageService.sendMessage({
          conversationId: conversation._id,
          text: ' ',
          attachments: urls
        })
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      antdMessage.error('Không thể tải ảnh lên')
    } finally {
      setUploading(false)
      setUploadProgress(null)
      // reset input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const openImage = (url: string) => {
    setModalImage(url)
    setModalVisible(true)
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

  // Memoize formatTime to avoid recalculating on every render
  const formatTime = useCallback((time: string) => {
    const date = new Date(time)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }, [])

  // Memoize message rendering for better performance
  const renderedMessages = useMemo(() => {
    return messages.map((message) => {
      const isMyMessage = message.sender._id === user?._id

      return (
        <div key={message._id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
          <div className={`flex max-w-[80%] gap-2 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
            <img
              src={message.sender.avatar || `https://ui-avatars.com/api/?name=${message.sender.username}`}
              alt={message.sender.username}
              className='h-8 w-8 flex-shrink-0 rounded-full object-cover'
              loading='lazy'
            />
            <div className='flex flex-col gap-1'>
              <div
                className={`rounded-lg px-4 py-2 shadow-md ${
                  isMyMessage ? 'bg-[#D7B978] text-white' : 'bg-gray-100 text-gray-900 border border-gray-200'
                }`}
              >
                <p className='whitespace-pre-wrap break-words text-sm'>{message.text}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {message.attachments.map((att: string, idx: number) => (
                      <img
                        key={idx}
                        src={att}
                        alt={`attachment-${idx}`}
                        onClick={() => openImage(att)}
                        className='h-28 w-28 cursor-pointer rounded-md object-cover shadow-sm'
                        loading='lazy'
                      />
                    ))}
                  </div>
                )}
              </div>
              <span className={`text-xs text-gray-400 ${isMyMessage ? 'text-right' : 'text-left'}`}>
                {formatTime(message.createdAt)}
              </span>
            </div>
          </div>
        </div>
      )
    })
  }, [messages, user?._id, formatTime])

  return (
    <div className='flex h-full flex-col bg-white'>
      {/* Header */}
      <div className='flex items-center justify-between border-b bg-[#D7B978] px-4 py-3 text-white'>
        <h3 className='text-lg font-semibold'>Chat với chúng tôi</h3>
        <button onClick={onClose} className='rounded-full p-1 hover:bg-white/20' title='Đóng chat'>
          <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='text-gray-500'>Đang tải tin nhắn...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className='flex items-center justify-center py-8'>
            <div className='text-center text-gray-500'>
              <p>Chào mừng bạn đến với ViFood!</p>
              <p className='text-sm mt-1'>Hãy gửi tin nhắn để được hỗ trợ.</p>
            </div>
          </div>
        ) : (
          <>
            {renderedMessages}
            {isTyping && (
              <div className='flex justify-start'>
                <div className='flex max-w-[80%] gap-2'>
                  <img
                    src={`https://ui-avatars.com/api/?name=Admin`}
                    alt='Admin'
                    className='h-8 w-8 flex-shrink-0 rounded-full object-cover'
                  />
                  <div className='rounded-lg bg-gray-100 px-4 py-2 border border-gray-200'>
                    <div className='flex space-x-1'>
                      <div className='h-2 w-2 animate-bounce rounded-full bg-gray-400'></div>
                      <div
                        className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className='h-2 w-2 animate-bounce rounded-full bg-gray-400'
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className='border-t bg-white p-4'>
        <form onSubmit={handleSendMessage} className='flex gap-2 items-end'>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            multiple
            onChange={handleFileChange}
            className='hidden'
          />
          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            title='Gửi ảnh'
            disabled={uploading}
            className='mr-1 flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
          >
            {uploading ? (
              <span className='text-sm'>Đang tải{uploadProgress ? ` ${uploadProgress}%` : '...'}</span>
            ) : (
              // image SVG icon
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.5'
              >
                <rect x='3' y='3' width='18' height='18' rx='2' ry='2' className='stroke-current' />
                <circle cx='8.5' cy='8.5' r='1.5' className='stroke-current' />
                <path d='M21 15l-5-5L5 21' className='stroke-current' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            )}
          </button>
          {uploadProgress !== null && (
            <div className='mr-2 flex items-center'>
              <div className='h-2 w-20 overflow-hidden rounded bg-gray-200'>
                <div style={{ width: `${uploadProgress}%` }} className='h-full bg-[#D7B978] transition-all' />
              </div>
              <span className='ml-2 text-xs text-gray-600'>{uploadProgress}%</span>
            </div>
          )}
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
      <ImageModal open={modalVisible} imageUrl={modalImage} onClose={() => setModalVisible(false)} />
    </div>
  )
}

export default CustomerChat
