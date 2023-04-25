import React, { useEffect, useRef, useState } from 'react'
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore'

import { api } from '../utils/api'
import { db } from '../utils/firebase'

const ChatBox = ({ senderUsername, roomNum }) => {
  const [messages, setMessages] = useState([])
  const chatInputRef = useRef('')

  // Query Messages //
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('room_id', '==', roomNum),
      orderBy('created_at'),
      limit(20)
    )
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      let messages = []
      QuerySnapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id })
      })
      setMessages(messages)
    })
    return () => unsubscribe
  }, [])

  // Send New Messages //
  const sendMessage = (event) => {
    event.preventDefault()
    console.log('clicked')
    if (chatInputRef.current.value.trim() === '') {
      return
    }

    const data = {
      message: chatInputRef.current.value,
      sender: senderUsername,
      room_id: roomNum,
    }

    chatInputRef.current.value = ''

    api({
      method: 'POST',
      url: '/message',
      data,
    })
      .then(({ data }) => {
        if (data.body.message === 'Toxic message') {
          setMessages([
            ...messages,
            { message: 'Your message is toxic', sender: 'System' },
          ])
        }
        console.log(data)
      })
      .catch((err) => {
        console.log(err)
        // if (err.response.status === 401) {
        //   navigate('/login')
        // }
      })
  }

  return (
    <div className="flex flex-col justify-end w-full h-full p-3 pb-12 border border-pink-600 rounded-xl bg-white overflow-hidden relative">
      {messages.map((message, idx) => (
        <div key={idx}>
          <span
            className={`font-semibold ${
              message.sender === 'System' ? 'text-red-600' : 'text-purple-600'
            }`}
          >{`[${message.sender}] `}</span>
          <span>{message.message}</span>
        </div>
      ))}
      {/* Chat Input */}
      <form
        onSubmit={sendMessage}
        className="flex justify-between px-4 py-2 w-full rounded-xl bg-gray-300 absolute left-0 bottom-0"
      >
        <input
          ref={chatInputRef}
          type="text"
          className="w-full bg-transparent outline-none"
          placeholder="Type your message here..."
        />
        <input
          type="submit"
          value="Send"
          className="font-semibold w-fit"
        />
      </form>
    </div>
  )
}

export default ChatBox
