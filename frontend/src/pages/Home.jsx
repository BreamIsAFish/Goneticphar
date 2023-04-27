import React, { useEffect, useRef, useState } from 'react'
// import { signInAnonymously } from "firebase/auth";
// import {
//   addDoc,
//   collection,
//   limit,
//   onSnapshot,
//   orderBy,
//   query,
//   serverTimestamp,
// } from "firebase/firestore";

// import { auth, db } from "../utils/firebase";
import { useNavigate } from 'react-router-dom'
import jwt_decode from 'jwt-decode'

import { api } from '../utils/api'
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../utils/firebase'

const Home = () => {
  const roomIdRef = useRef('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    const tokenExp = jwt_decode(token).exp
    if (tokenExp < Math.floor(Date.now() / 1000)) {
      // Token expired
      localStorage.removeItem('token')
      navigate('/login')
    }
  }, [])

  const getTokenInfo = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    return jwt_decode(token)
  }

  const joinRoom = async () => {
    if (roomIdRef.current.value.trim() === '') {
      alert('Enter valid room id')
      return
    }

    // const player_id = getTokenInfo().sub;
    const player_username = getTokenInfo()['cognito:username']
    const room_num = roomIdRef.current.value

    // Check if room exist or player is already in that room
    const q = query(
      collection(db, 'room'),
      where('room_num', '==', room_num),
      limit(1)
    )
    const querySnapshot = await getDocs(q)
    // If room is not exist
    if (querySnapshot.empty) {
      alert(`Room ${room_num} is not exist`)
      return
    }

    // If player is already in that room -> reconnect to the room
    const room = querySnapshot.docs[0].data()
    // if (room?.players && room?.players.includes(player_id)) {
    if (room?.players && room?.players.includes(player_username)) {
      navigate(`/room/${room_num}/lobby`)
      return
    }

    await api({
      method: 'PUT',
      url: '/room/joinRoom',
      data: {
        player_id: player_username,
        room_num,
      },
    })
      .then(({ data }) => {
        console.log(data)
        navigate(`/room/${room_num}/lobby`)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const createRoom = async () => {
    // const player_id = getTokenInfo().sub;
    const player_username = getTokenInfo()['cognito:username']

    await api({
      method: 'POST',
      url: '/room/createRoom',
      data: {
        host: player_username,
        max_player: 5,
      },
    })
      .then(async ({ data }) => {
        console.log(data)
        if (data?.room_num) navigate(`/room/${data.room_num}/lobby`)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="flex flex-col justify-center items-center mx-auto my-20">
      <div className="absolute right-4 top-4">
        <button
          className="text-sm font-medium text-white px-4 py-2 rounded-xl bg-black"
          onClick={logout}
        >
          Logout
        </button>
      </div>

      <h1 className="text-3xl font-bold text-pink-500">
        Welcome to Goneticphar
      </h1>

      <div className="flex flex-col justify-center items-center w-full my-8">
        <h3 className="text-xl font-semibold mb-2">Enter Room ID</h3>
        <input
          type="number"
          maxLength={6}
          ref={roomIdRef}
          className="border w-1/5 px-4 py-2"
        />
      </div>

      <div className="flex flex-col ">
        <button
          onClick={joinRoom}
          className="font-bold p-4 w-96 border-2 rounded-xl"
        >
          Join Room
        </button>
        <button
          onClick={createRoom}
          className="font-bold p-4 mt-4 w-96 border-2 rounded-xl"
        >
          Create Room
        </button>
      </div>
    </div>
  )
}

export default Home
