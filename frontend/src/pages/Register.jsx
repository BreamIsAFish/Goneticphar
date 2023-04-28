import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AccountBox, EmailOutlined, Key } from '@mui/icons-material'

import { api } from '../utils/api'

const Register = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setLoading] = useState(false)

  const navigate = useNavigate()

  const register = async () => {
    setLoading(true)

    const req = {
      username,
      password,
      email,
    }
    await api
      .post('/user/signup', req)
      .then(async () => {
        // navigate('/login')
        await login(username, password)
      })
      .catch((err) => {
        alert('Username already exists')
        console.log(err)
        setLoading(false)
      })
  }

  const login = async (username, password) => {
    const req = {
      username,
      password,
    }
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

  const isInputValid = () => {
    return (
      username.trim() !== '' &&
      password.trim() !== '' &&
      email.trim() !== '' &&
      password === confirmPassword
    )
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen mx-auto py-20 bg-fixed bg-cover bg-mountain">
      <h1 className="text-4xl font-bold font-nordic text-center leading-loose text-white">
        Register to
        <p className="text-5xl">Goneticphar</p>
      </h1>

      <div className="flex flex-col p-16 mt-12 max-w-xl border bg-white bg-opacity-10 border-white rounded-3xl shadow-2xl">
        {/* Email */}
        <h3 className="text-xl font-semibold font-aqua text-white">Email</h3>
        <div className="flex flex-row justify-between items-center border-b mb-6">
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="text-lg font-medium font-aqua text-white w-full px-4 py-2 bg-transparent outline-none"
          />
          <EmailOutlined color="action" />
        </div>

        {/* Username */}
        <h3 className="text-xl font-semibold font-aqua text-white">Username</h3>
        <div className="flex flex-row justify-between items-center border-b mb-6">
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            className="text-lg font-medium font-aqua text-white w-full px-4 py-2 bg-transparent outline-none"
          />
          <AccountBox color="action" />
        </div>

        {/* Password Section */}
        <div className="flex w-full">
          {/* Password */}
          <div className="flex flex-col w-full">
            <h3 className="text-xl font-semibold font-aqua text-white">
              Password
            </h3>
            <div className="flex flex-row justify-between items-center border-b mb-6">
              <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                className="text-lg font-medium font-aqua text-white w-full px-4 py-2 bg-transparent outline-none"
              />
              <Key color="action" />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col w-full ml-4">
            <h3 className="text-xl font-semibold font-aqua text-white">
              Confirm Password
            </h3>
            <div className="flex flex-row justify-between items-center border-b mb-6">
              <input
                type="password"
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="text-lg font-medium font-aqua text-white w-full px-4 py-2 bg-transparent outline-none"
              />
              <Key color="action" />
            </div>
          </div>
        </div>

        {/* Button Section */}
        <div className="flex flex-col justify-center items-center w-full mt-8">
          <button
            onClick={register}
            disabled={!isInputValid()}
            className={`font-bold py-3 mt-4 w-60 rounded-full ${
              !isInputValid()
                ? `bg-gray-300 bg-opacity-50 text-gray-500`
                : `bg-purple-700 text-white`
            }`}
          >
            {isLoading ? 'Loading...' : 'Register'}
          </button>
          <p
            onClick={() => navigate('/login')}
            className="flex text-base font-aqua font-bold text-white mt-8 underline cursor-pointer"
          >
            Already have an account
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
