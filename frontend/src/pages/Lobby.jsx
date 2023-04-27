import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import React, { useEffect, useRef, useState } from 'react'
import jwt_decode from 'jwt-decode'
import { useNavigate, useParams } from 'react-router-dom'

import { api } from '../utils/api'
import { db } from '../utils/firebase'
import ChatBox from '../components/ChatBox'

const Lobby = () => {
  // const [messages, setMessages] = useState([])
  const [players, setPlayers] = useState([])
  const [roomInfo, setRoomInfo] = useState()
  const isHostRef = useRef(false)

  // const chatInputRef = useRef('')
  const navigate = useNavigate()
  const { room_num } = useParams()

  useEffect(() => {
    // Check if token is valid
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
  }, [])

  useEffect(() => {
    // Check if room is valid & user is in this room
    const q = query(
      collection(db, 'room'),
      where('room_num', '==', room_num),
      limit(1)
    )

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
        const player_username = getTokenInfo()?.['cognito:username']
        if (!room.players.includes(player_username)) {
          console.log('Player is not in this room')
          navigate('/home')
          return
        }

        if (room.room_status === 'playing') {
          navigate(`/room/${room_num}/game`)
        }

        isHostRef.current = room.host === player_username
      },
      (err) => {
        console.log(`Encountered error: ${err}`)
      }
    )
    return unsubscribe
  }, [])

  const getTokenInfo = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    return jwt_decode(token)
  }

  const startGame = async () => {
    if (players.length < 2) return

    await clearRoomScore()

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
      api({
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
      // Transfer host to another player
      if (isHostRef.current) {
        const q = query(
          collection(db, 'room'),
          where('room_num', '==', room_num)
        )
        const findRoom = await getDocs(q)
        const room = findRoom.docs[0].data()
        const roomRef = doc(db, 'room', room.id)

        const currentHost = getTokenInfo()?.['cognito:username']
        const newHost =
          room.players[0] === currentHost ? room.players[1] : room.players[0]

        await updateDoc(roomRef, {
          host: newHost,
        })
          .then(() => {
            console.log(`Host has been transferred to ${room.host}`)
            // Notify new host
            api({
              method: 'POST',
              url: '/message',
              data: {
                message: `Host has been transferred to ${room.host}`,
                sender: 'System',
                room_id: room_num,
              },
            })
          })
          .catch((error) => {
            console.log(error)
          })
      }

      console.log('exiting room...')
      // const player_id = getTokenInfo().sub
      const player_username = getTokenInfo()?.['cognito:username']
      api({
        method: 'PUT',
        url: '/room/leaveRoom',
        data: {
          room_num,
          player_id: player_username,
        },
      })
        .then(({ data }) => {
          console.log(data)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    navigate('home')
  }

  const clearRoomScore = async () => {
    const q = query(collection(db, 'room'), where('room_num', '==', room_num))
    const findRoom = await getDocs(q)
    const room = findRoom.docs[0].data()
    const roomRef = doc(db, 'room', room.id)
    await updateDoc(roomRef, {
      players_score: {},
      room_status: 'waiting',
      current_question: room.question_list[0],
    })
      .then(() => {
        console.log('Room score has been cleared')
      })
      .catch((error) => {
        console.log(error)
      })
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
            senderUsername={getTokenInfo()?.['cognito:username']}
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
            disabled={players.length < 2 || !isHostRef.current}
            className={`font-semibold text-white h-16 mt-4 rounded-xl ${
              players.length < 2 ? 'bg-gray-400' : 'bg-indigo-400'
            } shadow-xl`}
          >
            {isHostRef.current
              ? 'Start Game'
              : 'Waiting for Host to start game'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Lobby
