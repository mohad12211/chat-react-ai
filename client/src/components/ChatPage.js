import React, { useEffect, useState, useRef } from 'react'
import ChatBar from './ChatBar'
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'

const url = process.env.NODE_ENV === 'production' ? "http://typological.me:4000/api" : "http://localhost:4000/api"

const ChatPage = ({ socket }) => {
  const [messages, setMessages] = useState([])
  const [typingStatus, setTypingStatus] = useState("")
  const lastMessageRef = useRef(null);

  useEffect(() => {
    socket.on("messageResponse", data => setMessages([...messages, data]))
  }, [socket, messages])

  useEffect(() => {
    function fetchMessages() {
      fetch(url)
        .then(response => response.json())
        .then(data => setMessages(data.messages))
    }
    fetchMessages()
  }, [])

  useEffect(() => {
    socket.on("typingResponse", data => setTypingStatus(data))
  }, [socket])

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  return (
    <div className="chat">
      <ChatBar socket={socket} />
      <div className='chat__main'>
        <ChatBody messages={messages} typingStatus={typingStatus} lastMessageRef={lastMessageRef} />
        <ChatFooter socket={socket} />
      </div>
    </div>
  )
}

export default ChatPage
