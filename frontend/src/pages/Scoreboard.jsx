import { useEffect, useRef, useState } from 'react'
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
import { useNavigate, useParams } from 'react-router-dom'
import jwt_decode from 'jwt-decode'

import ChatBox from '../components/ChatBox'
import { api } from '../utils/api'
import { db } from '../utils/firebase'

const Scoreboard = () => {
  const [reset, setReset] = useState(false)
  const [players, setPlayers] = useState([])
  const [isLoading, setLoading] = useState(true)
  const scoreRef = useRef({}) // { [player: string]: number[] }
  const isHostRef = useRef(false)
  const navigate = useNavigate()
  const { room_num } = useParams()

  const maxQuestion = 5

  // Check if token is valid
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    // Loading screen to wait for score to be retrieved
    setTimeout(() => {
      setLoading(false)
    }, 4000)
  }, [])

  // Check if room is valid & user is in this room
  useEffect(() => {
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
        console.log('room', room)
        setPlayers(room?.players ?? [])

        // Check if player is in this room
        const player_username = getTokenInfo()?.['cognito:username']
        if (!room.players.includes(player_username)) {
          console.log('Player is not in this room')
          navigate('/home')
          return
        }

        // Check room status
        if (room.room_status === 'waiting') {
          console.log('This room is not ended yet')
          navigate(`room/${room_num}/lobby`)
          return
        }

        isHostRef.current = room.host === player_username
        if (room?.players_score) {
          Object.keys(room?.players_score).map((player) => {
            const scoreLength = room?.players_score[player].length
            if (scoreLength < maxQuestion) {
              const score = room?.players_score[player]
              scoreRef.current[player] = [
                ...Array.from(Array(maxQuestion - scoreLength)).fill(0),
                ...score,
              ]
            }
          })
        } else {
          scoreRef.current = {}
        }
      },
      (err) => {
        console.log(`Encountered error: ${err}`)
      }
    )
    return unsubscribe
  }, [])

  useEffect(() => {
    if (reset) setReset(false)
  }, [reset])

  useEffect(() => {
    if (!reset) setReset(true)
  }, [scoreRef.current])

  const getTokenInfo = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    return jwt_decode(token)
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
            console.log(`Host has been transferred to ${newHost}`)
            // Notify new host
            api({
              method: 'POST',
              url: '/message',
              data: {
                message: `Host has been transferred to ${newHost}`,
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

  const playAgain = async () => {
    navigate(`/room/${room_num}/lobby`)
  }

  const getSortedScore = (a, b) => {
    const scoreArray = Object.keys(scoreRef.current).map((player) => {
      return [
        player,
        ...scoreRef.current[player],
        scoreRef.current[player].reduce((a, b) => a + parseInt(b), 0),
      ]
    })
    const sortedScore = scoreArray.sort((a, b) => {
      return b[b.length - 1] - a[a.length - 1]
    })
    return sortedScore
  }

  const getScoreboardHeader = () => {
    const header = ['Player']
    if (Object.values(scoreRef.current).length > 0) {
      Object.values(scoreRef.current)[0].map((_, idx) => {
        header.push(`Round ${idx + 1}`)
      })
    }
    header.push('Total Score')
    return header
  }

  return (
    <div className="flex flex-col px-20 py-10 w-screen min-h-screen bg-mountain bg-cover relative">
      {/* Top Section (Icon & QuestionWord & Timer) */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Goneticphar</h1>
        <h1 className="text-2xl font-semibold text-white">{`Scoreboard ( Room ${room_num} )`}</h1>
      </div>

      {/* Middle Section (PlayersBar & DrawBoard) */}
      <div className="flex my-4 w-full h-fit justify-between">
        {/* Chat box */}
        <div className="flex w-5/12 mr-6">
          <ChatBox
            senderUsername={getTokenInfo()?.['cognito:username']}
            roomNum={room_num}
          />
        </div>

        {/* Scoreboard */}
        <div className="flex flex-col items-center p-3 w-full min-h-[525px] rounded-xl bg-white">
          {isLoading || Object.keys(scoreRef.current).length === 0 ? (
            // Loading Scores
            <div className="flex flex-col justify-center items-center w-full h-full">
              <img
                className="w-40 rounded-full object-contain"
                src="/Assets/dancing-cat.gif"
                alt="dancing-cat"
              />
              <p className="text-3xl font-bold mt-8 mb-2 text-gray-600">
                Loading the scores
              </p>
              <p className="text-2xl font-semibold text-gray-600">
                Please waiting a sec...
              </p>
            </div>
          ) : (
            // Scores are loaded
            <div
              className="grid gap-6 text-center items-center"
              style={{
                gridTemplateColumns: `repeat(${
                  Object.values(scoreRef.current)[0].length + 2
                }, 1fr)`,
              }}
            >
              {/* Render Header */}
              {getScoreboardHeader().map((title) => (
                <p
                  key={title}
                  className="text-lg font-bold text-indigo-700"
                >
                  {title}
                </p>
              ))}

              {/* Player Scores */}
              {getSortedScore().map((playerData) => {
                // const playerData = {
                //   name: player,
                //   scores: scoreRef.current[player],
                //   total_score: scoreRef.current[player].reduce(
                //     (a, b) => a + parseInt(b),
                //     0
                //   ),
                // }
                // console.log(playerData)
                return playerData.map((data, idx) => {
                  // Player name
                  return (
                    <div key={`${playerData[0]}-${idx}`}>
                      {idx === 0 ? (
                        <p className="text-lg font-bold text-black">{data}</p>
                      ) : idx === playerData.length - 1 ? (
                        <p className="text-base font-bold text-black py-1 bg-yellow-400 rounded-full">
                          {data}
                        </p>
                      ) : (
                        // Scores
                        <p className="text-base font-semibold text-gray-700">
                          {parseInt(data) ?? 0}
                        </p>
                      )}
                    </div>
                  )
                })
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex justify-end w-full">
        <button
          onClick={exitRoom}
          className="text-lg font-bold text-white px-4 py-3 mr-8 rounded-xl bg-red-400 shadow-xl"
        >
          Exit Room
        </button>
        <button
          onClick={playAgain}
          className="text-lg font-bold text-white px-4 py-3 rounded-xl bg-indigo-500 shadow-xl"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}

export default Scoreboard
