import React, { useState } from 'react'

interface Message {
  user: string
  bot: string
}

const Bot = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState<string>('')

  const sendMessage = async () => {
    try {
      const url = `http://localhost:3333/ask?query=${encodeURIComponent(inputMessage)}`
      const response = await fetch(url)

      if (!response.ok) {
        const text = await response.text().catch(() => null)
        console.error('Bot /ask non-OK response', response.status, text)
        setMessages((prevMessages) => [...prevMessages, { user: inputMessage, bot: 'Đã có lỗi khi gọi bot (mã ' + response.status + ')' }])
        setInputMessage('')
        return
      }

      let data
      try {
        data = await response.json()
      } catch (err) {
        const text = await response.text().catch(() => null)
        console.error('Bot /ask returned non-JSON body', text)
        setMessages((prevMessages) => [...prevMessages, { user: inputMessage, bot: text || 'Lỗi: phản hồi không hợp lệ' }])
        setInputMessage('')
        return
      }

      setMessages((prevMessages) => [...prevMessages, { user: inputMessage, bot: data.answer }])
      setInputMessage('')
    } catch (error) {
      console.error('Error fetching response:', error)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(event.target.value)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    sendMessage()
  }

  return (
    <div className='mt-10'>
      <ul className='text-red-500 font-bold'>
        {messages.map((message, index) => (
          <React.Fragment key={index}>
            <li>User: {message.user}</li>
            <li>Bot: {message.bot}</li>
          </React.Fragment>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input id='message-input' value={inputMessage} onChange={handleInputChange} />
        <button type='submit'>Submit</button>
      </form>
    </div>
  )
}

export default Bot
