import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { api } from '../utils/api'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setLoading] = useState(false)

  const navigate = useNavigate()

  const login = async () => {
    if (!isInputValid()) {
      alert('Enter valid username and password')
      return
    }

    const req = {
      username,
      password,
    }

    setLoading(true)

    await api
      .post('/user/signin', req)
      .then(({ data }) => {
        console.log(data)
        localStorage.setItem('token', data.idToken)
        navigate('/home')
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
        if (
          err?.response?.status === 401 &&
          err?.response?.data?.err?.code === 'NotAuthorizedException'
        ) {
          alert('Invalid username or password')
        }
        console.log(err?.response)
      })
  }

  const register = () => {
    navigate('/register')
  }

  const isInputValid = () => {
    return username.trim() !== '' && password.trim() !== ''
  }

  return (
    <div className="flex flex-col justify-center items-center mx-auto my-20">
      <h1 className="text-3xl font-bold text-pink-500">Login to Goneticphar</h1>

      <div className="flex flex-col p-8 mt-16 border border-pink-500 rounded-xl shadow-xl">
        <h3 className="text-xl font-semibold mb-2">Username</h3>
        <input
          type="text"
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded-lg w-full px-4 py-2"
        />
        <h3 className="text-xl font-semibold mb-2 mt-4">Password</h3>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded-lg w-full px-4 py-2"
        />

        {/* Button Section */}
        <div className="flex flex-col w-full mt-8">
          <button
            onClick={login}
            disabled={!isInputValid() || isLoading}
            className={`font-bold p-4 mt-4 w-96 rounded-xl ${
              !isInputValid()
                ? `bg-gray-300 text-gray-100`
                : `bg-pink-500 text-white`
            }`}
          >
            {isLoading ? 'Loading...' : 'Login'}
          </button>
          <button
            onClick={register}
            className="font-bold p-4 mt-4 w-96 border-2 rounded-xl"
          >
            Create new account
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
