import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Visibility,
  VisibilityOff,
  VoicemailOutlined,
} from '@mui/icons-material'

import { api } from '../utils/api'
import { EmailOutlined } from '@mui/icons-material'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    <div className="flex flex-col justify-center items-center h-screen w-screen mx-auto py-20 bg-fixed bg-cover bg-mountain">
      <h1 className="text-4xl font-bold font-nordic text-center leading-loose text-white">
        Login to
        <p className="text-5xl">Goneticphar</p>
      </h1>

      {/* Login Form */}
      <div className="flex flex-col p-16 mt-16 border bg-white bg-opacity-20 border-white rounded-3xl shadow-xl">
        {/* Username Field */}
        <h3 className="text-xl font-semibold font-aqua text-white mb-2">
          Username
        </h3>
        <div className="flex flex-row justify-between items-center border-b">
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            className="text-lg font-medium font-aqua text-white w-full px-4 py-2 bg-transparent outline-none"
          />
          <EmailOutlined color="action" />
        </div>

        {/* Password Field */}
        <h3 className="text-xl font-semibold font-aqua text-white mb-2 mt-4">
          Password
        </h3>
        <div className="flex flex-row justify-between items-center border-b">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="text-lg font-medium font-aqua text-white w-full px-4 py-2 bg-transparent outline-none"
          />
          <div onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? (
              <VisibilityOff color="action" />
            ) : (
              <Visibility color="action" />
            )}
          </div>
        </div>

        {/* Button Section */}
        <div className="flex flex-col justify-center items-center w-full mt-8">
          <button
            onClick={login}
            disabled={!isInputValid() || isLoading}
            className={`font-bold py-3 mt-4 w-60 rounded-full ${
              !isInputValid()
                ? `bg-gray-300 bg-opacity-50 text-gray-500`
                : `bg-purple-700 text-white`
            }`}
          >
            {isLoading ? 'Loading...' : 'Log in'}
          </button>
          <p className="flex text-base font-aqua font-bold text-white mt-8">
            Don't have an account?{' '}
            <p
              onClick={register}
              className="pl-2 underline cursor-pointer"
            >
              Create an account
            </p>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
