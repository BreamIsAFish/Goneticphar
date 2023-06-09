import {
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
  const [players, setPlayers] = useState([])
  const [roomInfo, setRoomInfo] = useState()
  const isHostRef = useRef(false)
  const [countDown, setCountDown] = useState(0)

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
        } else if (room.room_status === 'starting') {
          showStartGameCountdown()
        }

        isHostRef.current = room.host === player_username
      },
      (err) => {
        console.log(`Encountered error: ${err}`)
      }
    )
    return unsubscribe
  }, [])

  const showStartGameCountdown = () => {
    let count = 5
    setCountDown(count)
    const interval = setInterval(() => {
      count--
      setCountDown(count)
      if (count <= 0) {
        clearInterval(interval)
        startGame()
      }
    }, 1000)
  }

  const getTokenInfo = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    return jwt_decode(token)
  }

  const onClickStartGame = async () => {
    if (players.length < 2) return

    await resetRoomData()
  }

  const startGame = async () => {
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

  const resetRoomData = async () => {
    const q = query(collection(db, 'room'), where('room_num', '==', room_num))
    const findRoom = await getDocs(q)
    const room = findRoom.docs[0].data()
    const roomRef = doc(db, 'room', room.id)
    const shuffledWords = room.all_question_list.sort(
      (a, b) => 0.5 - Math.random()
    )
    await updateDoc(roomRef, {
      players_score: {},
      room_status: 'starting',
      question_list: shuffledWords.slice(0, 5),
    })
      .then(() => {
        console.log('Room data has been cleared')
      })
      .catch((error) => {
        console.log(error)
      })
  }

  return (
    <div className="flex flex-col w-screen min-h-screen p-12 bg-mountain bg-cover relative">
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
        <div className="row-span-1 col-span-1 p-6 min-h-[20vh] rounded-xl bg-white">
          <h3 className="text-lg font-semibold">
            Room:
            <span className="text-indigo-600 ml-2">{room_num}</span>
          </h3>
          <h3 className="text-lg font-semibold">
            Max player:
            <span className="text-indigo-600 ml-2">{roomInfo?.max_player}</span>
          </h3>
          <h3 className="text-lg font-semibold">
            Host:
            <span className="text-indigo-600 ml-2">{roomInfo?.host}</span>
          </h3>
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
          <div className="h-full p-8 rounded-lg bg-white">
            <h3 className="text-2xl font-bold mb-8">Players</h3>
            {players.map((player, idx) => (
              <div
                key={player}
                className="flex items-center mb-6"
              >
                <h3
                  className={`flex justify-center text-xl font-bold p-2 mr-4 rounded-xl ${
                    roomInfo.host === player ? 'bg-yellow-500' : 'bg-blue-400'
                  } text-white`}
                >
                  {`Player ${idx + 1}`}
                </h3>
                <h3 className="text-xl font-semibold">{`${player} ${
                  roomInfo.host === player ? '(Host)' : ''
                }`}</h3>
              </div>
            ))}
          </div>
          <button
            onClick={onClickStartGame}
            disabled={players.length < 2 || !isHostRef.current}
            className={`font-semibold text-white h-16 mt-4 rounded-xl ${
              isHostRef.current && players.length >= 2
                ? 'bg-indigo-400'
                : 'bg-gray-400'
            } shadow-xl`}
          >
            {isHostRef.current
              ? 'Start Game'
              : 'Waiting for host to start game'}
          </button>
        </div>
      </div>

      {/* Count Down Modal */}
      {countDown && (
        <div className="flex flex-col justify-center items-center w-screen h-screen bg-black/50 absolute top-0 left-0">
          <h1
            className="text-[30vw] font-bold font-nordic text-pink-600"
            style={{ WebkitTextStroke: '2px black' }}
          >
            {countDown}
          </h1>
        </div>
      )}
    </div>
  )
}

export default Lobby
