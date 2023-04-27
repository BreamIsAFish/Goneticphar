import React, { useEffect, useRef, useState } from 'react'
import { signInAnonymously } from 'firebase/auth'
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'

import { auth, db } from '../utils/firebase'
import { api } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { Canvas } from '../components/Canvas'
import { useCanvas } from '../context/CanvasContext'

const ChatTest = () => {
  const messageRef = useRef('')
  const [messages, setMessages] = useState([])
  const [name, setName] = useState('')
  const navigate = useNavigate()
  const { clearCanvas, getBase64Data } = useCanvas()

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('created_at'),
      limit(50)
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

  const testAsync = () => {
    api({
      method: 'POST',
      url: '/async-test',
      data: {
        message: 'yoyoyoyoyoy',
        sender: 'asdfghjkl',
        room_id: 999,
      },
    })
      .then(({ data }) => {
        console.log(data)
      })
      .catch((err) => {
        console.log(err)
      })
    navigate('/home')
  }

  const sendMessage = async (event) => {
    event.preventDefault()
    if (name === '') {
      console.log('Name is empty')
      return
    }
    if (messageRef.current.value.trim() === '') {
      alert('Enter valid message')
      return
    }

    api({
      method: 'POST',
      url: '/message',
      data: {
        message: messageRef.current.value,
        sender: name,
        room_id: 1,
      },
    })
      .then(({ data }) => {
        console.log(data)
      })
      .catch((err) => {
        console.log(err)
      })
    /*
    event.preventDefault();
    if (name === "") {
      console.log("Name is empty");
      return;
    }
    if (messageRef.current.value.trim() === "") {
      alert("Enter valid message");
      return;
    }
    // const { uid, displayName, photoURL } = auth.currentUser;
    await addDoc(collection(db, "messages"), {
      message: messageRef.current.value,
      sender: name,
      room_id: "1",
      created_at: serverTimestamp(),
    });
    messageRef.current.value = "";
    */
  }

  const onClickGet = () => {
    console.log(getBase64Data())
  }

  const onClickClear = () => {
    clearCanvas()
  }

  return (
    <div>
      <h1>Home</h1>

      <button
        className="bg-red-500 p-8"
        onClick={testAsync}
      >
        test Async
      </button>

      <h3>Name Input</h3>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <h3 className="text-red-600">Message Input</h3>
      <form onSubmit={sendMessage}>
        <input ref={messageRef} />
        <button type="submit">Send</button>
      </form>

      <h3>Chat</h3>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {messages?.map((message) => (
          <span
            key={message.id}
          >{`${message.sender}: ${message.message}`}</span>
        ))}
      </div>

      <button
        className="p-4 mr-8 bg-green-300"
        onClick={onClickGet}
      >
        get base 64
      </button>
      <button
        className="p-4 bg-red-300"
        onClick={onClickClear}
      >
        clear
      </button>
      <div className="flex rounded-xl w-[80vw] relative overflow-hidden border-2 border-red-600">
        <Canvas />
      </div>
    </div>
  )
}

export default ChatTest
