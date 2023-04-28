import React, { useEffect, useRef, useState } from 'react'

import { Canvas } from '../components/Canvas'
import { useCanvas } from '../context/CanvasContext'
import { collection, limit, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../utils/firebase'
import { useNavigate, useParams } from 'react-router-dom'
import jwt_decode from 'jwt-decode'
import ChatBox from '../components/ChatBox'

const Game = () => {
  const [timer, setTimer] = useState(30)
  const currentQuestionRef = useRef('')
  const currentQuestionNumRef = useRef(1)
  const submittedCurrentQuestion = useRef(false)

  const [players, setPlayers] = useState([])
  const gameStartedRef = useRef(false)
  const gameEndedRef = useRef(false)
  const [reset, setReset] = useState(false)

  const navigate = useNavigate()
  const { room_num } = useParams()
  const { clearCanvas, submitQuestion } = useCanvas()

  const timePerQuestion = 20
  const tools = [
    { name: 'Pen', onClick: () => {} },
    { name: 'Clear', onClick: clearCanvas },
  ]

  useEffect(() => {
    console.log(gameStartedRef.current)
  }, [gameStartedRef.current])

  // Check if token is valid
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) navigate('/login')
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
        // setRoomInfo(room)
        setPlayers(room?.players ?? [])

        // Check if player is in this room
        const player_username = getTokenInfo()['cognito:username']
        if (!room.players.includes(player_username)) {
          console.log('Player is not in this room')
          navigate('/home')
          return
        }

        if (room.room_status === 'waiting') {
          currentQuestionNumRef.current = 0
          currentQuestionRef.current = 'Preparing to start...'
        }

        onQuestionChanged(room)
        /*
        if (
          room.room_status === 'playing' &&
          room.current_question !== currentQuestion
        ) {
          console.log('playing...')
          if (!gameStarted) {
            console.log('started...')
            setGameStarted(true)
          } else if (
            !submittedCurrentQuestion.current &&
            currentQuestion !== ''
          ) {
            submittedCurrentQuestion.current = true
            submitQuestion(room_num, currentQuestion)
          }
          setCurrentQuestion(room.current_question)
          setCurrentQuestionNum(
            room?.question_list?.indexOf(room.current_question) + 1 ?? -1
          )
        } else if (room.room_status === 'ending' && !gameEnded) {
          setGameEnded(true)
          if (!submittedCurrentQuestion.current) {
            submittedCurrentQuestion.current = true
            submitQuestion(room_num, currentQuestion)
          }
          setTimeout(() => {
            console.log(new Date(), 'navigating to scoreboard...')
            // navigate(`/room/${room_num}/scoreboard`)
          }, 200)
        }
        */
      },
      (err) => {
        console.log(`Encountered error: ${err}`)
      }
    )
    return unsubscribe
  }, [])

  useEffect(() => {
    // if (currentQuestion !== '') {
    // if (!gameStarted) {
    //   setGameStarted(true)
    // } else {
    //   submitQuestion()
    // }
    // clearCanvas();
    // setTimer(timePerQuestion)
    // }
    submittedCurrentQuestion.current = false
    setTimer(timePerQuestion)
  }, [currentQuestionRef.current])

  useEffect(() => {
    if (timer > 0 && gameStartedRef.current) {
      const timer = setInterval(() => {
        setTimer((oldTimer) => {
          return oldTimer - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
    // else if (timer <= 0 && !submitted) {
    //   setSubmitted(true);
    //   submitQuestion();
    // }
  }, [timer, gameStartedRef.current])

  const onQuestionChanged = (room) => {
    if (
      room.room_status === 'playing' &&
      room.current_question !== currentQuestionRef.current
    ) {
      if (!gameStartedRef.current) {
        gameStartedRef.current = true
      } else if (
        !submittedCurrentQuestion.current &&
        currentQuestionRef.current !== ''
      ) {
        submittedCurrentQuestion.current = true
        submitQuestion(
          room_num,
          currentQuestionRef.current,
          getTokenInfo()['cognito:username']
        )
      }
      currentQuestionRef.current = room.current_question
      currentQuestionNumRef.current =
        room?.question_list?.indexOf(room.current_question) + 1 ?? -1
    } else if (room.room_status === 'ending' && !gameEndedRef.current) {
      gameEndedRef.current = true
      if (!submittedCurrentQuestion.current) {
        submittedCurrentQuestion.current = true
        submitQuestion(
          room_num,
          currentQuestionRef.current,
          getTokenInfo()['cognito:username']
        )
      }
      setTimeout(() => {
        console.log(new Date(), 'navigating to scoreboard...')
        navigate(`/room/${room_num}/scoreboard`)
      }, 200)
    }
  }

  useEffect(() => {
    if (reset) setReset(false)
  }, [reset])

  useEffect(() => {
    if (!reset) setReset(true)
  }, [currentQuestionRef.current, currentQuestionNumRef.current])

  const getTokenInfo = () => {
    const token = localStorage.getItem('token')
    if (!token) navigate('/login')
    return jwt_decode(token)
  }

  return (
    <div className="flex flex-col px-24 py-10 w-screen min-h-screen bg-pink-800">
      {/* Top Section (Icon & QuestionWord & Timer) */}
      <div className="flex pl-8 justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Goneticphar</h1>
        <div className="flex px-4 py-2 border-2 rounded-xl">
          <h className="text-xl font-semibold text-white">{`${timer} s`}</h>
        </div>
      </div>
      {/* Middle Section (PlayersBar & DrawBoard) */}
      <div className="flex my-4 w-full h-fit justify-between">
        {/* PlayersBar */}
        <div className="flex flex-col items-center p-3 mr-5 w-[20vw] h-[525px] rounded-xl bg-white">
          {players.map((player, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center w-full px-4 py-3 mb-3 rounded-xl bg-blue-500"
            >
              <span className="text-md font-semibold text-white">
                {player.slice(0, 10)}
              </span>
            </div>
          ))}
        </div>
        {/* DrawBoard */}
        <div className="flex rounded-xl w-[80vw] relative overflow-hidden">
          <Canvas />
          <div className="flex flex-row justify-center items-center px-6 py-2 rounded-br-2xl absolute top-0 bg-indigo-600">
            <p className="text-lg font-semibold text-white">
              {`Round ${currentQuestionNumRef.current} : `}
            </p>
            <p className="text-2xl font-bold ml-2 text-yellow-400">
              {currentQuestionRef.current}
            </p>
          </div>
          {/* Tools */}
          <div className="flex flex-col items-center p-4 h-full bg-slate-400 right-0 absolute">
            {tools.map((tool, idx) => (
              <div
                key={idx}
                onClick={tool.onClick}
                className="my-4"
              >
                {tool.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section (Chat etc.) */}
      {/* Chat box */}
      <div className="flex w-full h-[30vh]">
        <ChatBox
          senderUsername={getTokenInfo()['cognito:username']}
          roomNum={room_num}
        />
      </div>
    </div>
  )
}

export default Game
