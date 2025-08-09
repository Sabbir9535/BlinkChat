import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [isDataSubmitted, setIsDataSubmitted]= useState(false);

  const {login} = useContext(AuthContext)

  const onSubmitHandler = (event) => {
    event.preventDefault()

    // Final form submission
    if (currState === 'Sign up') {
      console.log("Signing up with:", { fullName, email, password, bio })
    } else {
      console.log("Logging in with:", { email, password })
    }

    // Clear form
    setFullName("")
    setEmail("")
    setPassword("")
    setBio("")

    login(currState=== "Sign up"? 'signup':'login',{fullName,email,password,bio})
  }

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/*------Left-------*/}
      <img src={assets.logo_big} alt="" className='w-[min(30vw, 250px)]' />

      {/*------Right-------*/}
      <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
        <h2 className='font-medium text-2xl'>
          {currState}
        </h2>

        {currState === "Sign up" && (
          <>
            <input
              onChange={(e) => setFullName(e.target.value)}
              value={fullName}
              type="text"
              placeholder='Full Name'
              className='p-2 border border-gray-500 rounded-md focus:outline-none'
              required
            />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder='Email Address'
              className='p-2 border border-gray-500 rounded-md focus:outline-none'
              required
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder='Password'
              className='p-2 border border-gray-500 rounded-md focus:outline-none'
              required
            />
            <textarea
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              rows={4}
              placeholder='Provide a short bio...'
              className='p-2 border border-gray-500 rounded-md focus:outline-none'
              required
            ></textarea>
          </>
        )}

        {currState === "Login" && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder='Email Address'
              className='p-2 border border-gray-500 rounded-md focus:outline-none'
              required
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder='Password'
              className='p-2 border border-gray-500 rounded-md focus:outline-none'
              required
            />
          </>
        )}

        <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
          {currState === "Sign up" ? "Create Account" : "Login Now"}
        </button>

        <div className='flex items-center gap-2 text-sm text-gray-400'>
          <input type="checkbox" required />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        <div className='flex flex-col gap-2'>
          {currState === "Sign up" ? (
            <p className='text-sm text-gray-600'>
              Already have an account?{' '}
              <span
                onClick={() => setCurrState("Login")}
                className='font-medium text-violet-500 cursor-pointer'
              >
                Login here
              </span>
            </p>
          ) : (
            <p className='text-sm text-gray-600'>
              Create an account{' '}
              <span
                onClick={() => setCurrState("Sign up")}
                className='font-medium text-violet-500 cursor-pointer'
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export default LoginPage
