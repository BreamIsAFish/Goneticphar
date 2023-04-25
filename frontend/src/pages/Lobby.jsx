import { collection, limit, onSnapshot, query, where } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import jwt_decode from 'jwt-decode'
import { useNavigate, useParams } from 'react-router-dom'

import { api } from '../utils/api'
import { db } from '../utils/firebase'
import ChatBox from '../components/ChatBox'

const Lobby = () => {
  // const [messages, setMessages] = useState([])
  const [players, setPlayers] = useState([])
  const [roomInfo, setRoomInfo] = useState()

  // const chatInputRef = useRef('')
  const navigate = useNavigate()
  const { room_num } = useParams()

  useEffect(() => {
    // Check if token is valid
    const token = localStorage.getItem('token')
    if (!token) navigate('/login')
  }, [])

  useEffect(() => {
    // Check if room is valid & user is in this room
    const q = query(
      collection(db, 'room'),
      where('room_num', '==', room_num),
      // orderBy("created_at"),
      limit(1)
    )
    // const query = db.collection("room").where("room_num", "==", room_num);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        // Check if room exists
        if (querySnapshot.docs.length === 0) {
          console.log('Room does not exist')
          navigate('/home')
          return
        }

        const room = querySnapshot.docs[0].data()
        setRoomInfo(room)
        setPlayers(room?.players ?? [])

        // Check if player is in this room
        // const player_id = getTokenInfo().sub
        const player_username = getTokenInfo()['cognito:username']
        if (!room.players.includes(player_username)) {
          console.log('Player is not in this room')
          navigate('/home')
          return
        }
      },
      (err) => {
        console.log(`Encountered error: ${err}`)
      }
    )
    return () => unsubscribe
  }, [])

  // useEffect(() => {
  //   const q = query(
  //     collection(db, 'messages'),
  //     orderBy('created_at'),
  //     limit(20)
  //   )
  //   const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
  //     let messages = []
  //     QuerySnapshot.forEach((doc) => {
  //       messages.push({ ...doc.data(), id: doc.id })
  //     })
  //     setMessages(messages)
  //   })
  //   return () => unsubscribe
  // }, [])

  const getTokenInfo = () => {
    const token = localStorage.getItem('token')
    if (!token) navigate('/login')
    return jwt_decode(token)
  }

  // const sendMessage = (event) => {
  //   event.preventDefault()
  //   console.log('clicked')
  //   if (chatInputRef.current.value.trim() === '') {
  //     return
  //   }

  //   const userInfo = getTokenInfo()
  //   const sender = userInfo['cognito:username']

  //   const data = {
  //     message: chatInputRef.current.value,
  //     sender: sender,
  //     room_num: 1,
  //   }

  //   chatInputRef.current.value = ''

  //   api({
  //     method: 'POST',
  //     url: '/message',
  //     data,
  //   })
  //     .then(({ data }) => {
  //       if (data.message === 'Toxic message') {
  //         setMessages([
  //           ...messages.slice(1),
  //           { message: 'Your message is considered toxic', sender: 'System' },
  //         ])
  //       }
  //       console.log(data)
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //       if (err.response.status === 401) {
  //         navigate('/login')
  //       }
  //     })
  // }

  const startGame = () => {
    if (players.length < 2) return

    api({
      method: 'POST',
      url: '/room/startRoom',
      headers: {
        InvocationType: 'Event',
        'X-Amz-Invocation-Type': 'Event',
      },
      data: {
        room_num,
      },
    })
      .then(({ data }) => {
        console.log(data)
      })
      .catch((err) => {
        console.log(err)
      })
    navigate(`/room/${room_num}/game`)
  }

  const exitRoom = async () => {
    if (players.length <= 1 || getTokenInfo().sub === '') {
      console.log('closing room...')
      await api({
        method: 'DELETE',
        url: '/room/closeRoom',
        data: {
          room_num,
        },
      })
        .then(({ data }) => {
          console.log(data)
          navigate('/home')
        })
        .catch((err) => {
          console.log(err)
        })
    } else {
      console.log('exiting room...')
      // const player_id = getTokenInfo().sub
      const player_username = getTokenInfo()['cognito:username']
      await api({
        method: 'PUT',
        url: '/room/leaveRoom',
        data: {
          room_num,
          player_id: player_username,
        },
      })
        .then(({ data }) => {
          console.log(data)
          // navigate("home");
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }

  return (
    <div className="flex flex-col w-screen min-h-screen p-12 bg-pink-800">
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <button
            className="text-base px-4 py-2 mr-4 rounded-xl bg-gray-500 text-white"
            onClick={exitRoom}
          >
            Exit
          </button>
          <h3 className="text-3xl font-semibold text-white">Goneticphar</h3>
        </div>
        <h3 className="text-3xl font-semibold text-white">{`Lobby`}</h3>
      </div>

      <div className="grid grid-rows-4 grid-flow-col gap-4">
        {/* Left Section (Room info & Chat box) */}
        {/* Room info */}
        <div className="row-span-1 col-span-1 p-3 min-h-[20vh] border border-pink-200 rounded-xl bg-white">
          <h3 className="text-lg font-semibold">{`Room: ${room_num}`}</h3>
          <h3 className="text-lg font-semibold">{`Max player: 5`}</h3>
        </div>

        {/* Chat box */}
        <div className="row-span-3 min-w-[25vw]">
          <ChatBox
            senderUsername={getTokenInfo()['cognito:username']}
            roomNum={room_num}
          />
        </div>

        {/* Right Section (Player list) */}
        <div className="flex flex-col justify-end row-span-4 col-span-5">
          <div className="h-full p-8 border border-pink-200 rounded-lg bg-white">
            <h3 className="text-2xl font-bold mb-8">Players</h3>
            {players.map((player, idx) => (
              <div
                key={player}
                className="flex items-center mb-6"
              >
                <h3 className="flex justify-center text-xl font-bold p-2 mr-4 rounded-xl bg-blue-400 text-white">
                  {`Player ${idx + 1}`}
                </h3>
                <h3 className="text-xl font-semibold">{player}</h3>
              </div>
            ))}
          </div>
          <button
            onClick={startGame}
            disabled={players.length < 2}
            className={`font-semibold text-white h-16 mt-4 rounded-xl ${
              players.length < 2 ? 'bg-gray-400' : 'bg-indigo-400'
            } shadow-xl`}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  )
}

export default Lobby
