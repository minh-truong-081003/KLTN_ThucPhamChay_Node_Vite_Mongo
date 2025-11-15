import { Message } from '../../types'
import parse from 'html-react-parser'
import { useAppSelector } from '../../../../store/hooks'

interface ChatContentProps {
  messages: Message[]
}

export const ChatContent = ({ messages }: ChatContentProps) => {
  const { user: userData } = useAppSelector((state) => state.persistedReducer.auth)

  return (
    <div className='flex-1 h-full py-1 overflow-auto px-5 scrollbar-none'>
      {messages.map((message: Message, index: number) => (
        <div
          key={index}
          className={`py-2 flex flex-row w-full ${message.isChatOwner ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`${message.isChatOwner ? 'order-2' : 'order-1'}`}>
            {/* avata */}
            <div className='relative w-10 h-10 overflow-hidden bg-gray-100 rounded-full'>
              {message.isChatOwner && (
                <img
                  src={
                    userData
                      ? userData.avatar
                      : 'https://png.pngtree.com/png-vector/20191027/ourlarge/pngtree-avatar-vector-icon-white-background-png-image_1884971.jpg'
                  }
                  className='w-12 object-cover h-12 text-gray-400'
                  alt='bot'
                />
              )}
              {!message.isChatOwner && (
                <img
                  src='https://cdn.dribbble.com/users/464600/screenshots/2863054/bot-emotions-principle.gif'
                  className='w-12 object-cover h-12 text-gray-400'
                  alt='bot'
                />
              )}
            </div>
          </div>
          <div
            className={`px-3 py-3 flex flex-col bg-[#D3B673] items-start rounded-lg text-white max-w-[75%] ${
              message.isChatOwner ? 'order-1 mr-2' : 'order-2 ml-2'
            }`}
          >
            <span className='text-xs text-gray-200'>
              {message.sentBy}&nbsp;-&nbsp;
              {new Date(message.sentAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <div className='text-sm mt-1 break-words w-full'>{parse(message.text)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
