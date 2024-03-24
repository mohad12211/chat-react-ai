import React from 'react'
import { useNavigate } from "react-router-dom"
import defaultImg from "../assets/user.png"

const url = process.env.NODE_ENV === 'production' ? "https://typological.me/" : "http://localhost:4000/";

const ChatBody = ({ messages, typingStatus, lastMessageRef }) => {
  const navigate = useNavigate()

  const handleLeaveChat = () => {
    localStorage.removeItem("userName")
    navigate("/")
    window.location.reload()
  }

  return (
    <>
      <header className='chat__mainHeader'>
        <p>Hangout with Colleagues</p>
        <button className='leaveChat__btn' onClick={handleLeaveChat}>LEAVE CHAT</button>
      </header>


      <div className='message__container'>
        {messages.map(message => (
          message.name === localStorage.getItem("userName") ? (

            <div className="message__chats" key={message.id}>
              <p className='sender__name'>You</p>
              <div className='message__sender'>
                <img className='sender__pfp' src={`${url}${message.userId}`} alt="profile" onError={e => e.currentTarget.src = defaultImg} />
                <p>{message.text}</p>
              </div>
            </div>
          ) : (
            <div className="message__chats" key={message.id}>
              <p>{message.name}</p>
              {(message.predictions && message.predictions.length !== 0) && (
                <p style={{ color: "red", fontWeight: 600, fontStyle: 'italic' }}>
                  This message has been identified by our AI systems as potentially containing: {
                    message.predictions.map(p => p.label.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")).join(", ")
                  }
                </p>
              )}
              <div className='message__recipient'>
                <p><img className='recipient__pfp' src={`${url}${message.userId}`} alt="profile" onError={e => e.currentTarget.src = defaultImg} />{message.text}</p>
              </div>
            </div>
          )
        ))}

        <div className='message__status'>
          <p>{typingStatus}</p>
        </div>
        <div ref={lastMessageRef} />
      </div>
    </>
  )
}

export default ChatBody
