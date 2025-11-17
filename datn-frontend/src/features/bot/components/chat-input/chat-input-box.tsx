import { DebouncedInput } from '../debounce-input'
import { IUser } from '../../../../interfaces/user.type'
import { Message } from '../../types'
import { sendMessage } from '../../api'
import { useAppSelector } from '../../../../store/hooks'
import { useState } from 'react'

interface ChatInputBoxProps {
  sendANewMessage: (message: Message) => void
}

export const ChatInputBox = ({ sendANewMessage }: ChatInputBoxProps) => {
  const [newMessage, setNewMessage] = useState<string>('')

  // const dispatch = useDispatch()
  const { user: userInfo } = useAppSelector((state) => state.persistedReducer.auth)

  const doSendMessage = async () => {
    if (newMessage && newMessage.length > 0) {
      // Hiển thị tin nhắn của người dùng ngay lập tức để giảm cảm giác lag
      const newMessageUser: Message = {
        sentAt: new Date(),
        sentBy: (userInfo as IUser)?.username || 'customer',
        isChatOwner: true,
        text: newMessage
      }
      sendANewMessage(newMessageUser)

      // Clear input ngay để cảm giác mượt khi người dùng nhấn Enter
      setNewMessage('')

      // Gọi API bất đồng bộ — khi có phản hồi mới đẩy bot message vào
      try {
        const data = await sendMessage(newMessage, userInfo ? userInfo._id : '')
        const newMessageBot: Message = {
          sentAt: new Date(),
          sentBy: 'Tôi là bot',
          isChatOwner: false,
          text: data?.answer || 'Chúng tôi sẽ liên lạc với bạn sớm nhất có thể'
        }
        sendANewMessage(newMessageBot)
      } catch (err) {
        // Nếu lỗi, gửi tin nhắn lỗi nhẹ nhàng
        const errorBot: Message = {
          sentAt: new Date(),
          sentBy: 'Tôi là bot',
          isChatOwner: false,
          text: 'Có lỗi khi gửi tin nhắn. Vui lòng thử lại.'
        }
        sendANewMessage(errorBot)
      }
    }
  }

  return (
    <div className='w-100 rounded-bl-xl rounded-br-xl py-3 overflow-hidden bg-white px-5'>
      <div className='flex flex-row items-center space-x-5'>
        <DebouncedInput
          value={newMessage ?? ''}
          placeholder='Nội dung tin nhắn'
          debounce={100}
          onChange={(value) => setNewMessage(String(value))}
          onEnterPress={doSendMessage}
        />
        <button
          type='button'
          disabled={!newMessage || newMessage.length === 0}
          className='hover:bg-[#D3B673] focus:ring-4 focus:outline-none focus:ring-purple-300 disabled:opacity-50 px-3 py-2 text-xs font-medium text-center text-white bg-[#D3B673] rounded-lg'
          onClick={() => doSendMessage()}
        >
          Send
        </button>
      </div>
    </div>
  )
}
