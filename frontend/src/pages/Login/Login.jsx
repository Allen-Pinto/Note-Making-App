import React, { useState } from "react"
import PasswordInput from "../../components/Input/PasswordInput"
import { Link, useNavigate } from "react-router-dom"
import { validateEmail } from "../../utils/helper"
import { useDispatch } from "react-redux"
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../../redux/user/userSlice"
import axios from "axios"
import { toast } from "react-toastify"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    // Validate the email
    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    // Validate password
    if (!password) {
      setError("Please enter the password")
      return
    }

    // Clear error before making the request
    setError("")

    try {
      dispatch(signInStart())

      const res = await axios.post(
        "https://echo-notes-backend.onrender.com/api/auth/signin",
        { email, password },
        { withCredentials: true }
      )

      // Check for success in response
      if (res.data.success === false) {
        toast.error(res.data.message)
        dispatch(signInFailure(res.data.message)) // Corrected from data.message
        return
      }

      // Success response
      toast.success(res.data.message)
      dispatch(signInSuccess(res.data))
      navigate("/")
    } catch (error) {
      // Handle network or other errors
      if (error.response) {
        // Server responded with an error
        toast.error(error.response.data.message || error.message)
        dispatch(signInFailure(error.response.data.message || error.message))
      } else {
        // Network or other errors
        toast.error("An error occurred while logging in")
        dispatch(signInFailure("An error occurred while logging in"))
      }
    }
  }

  return (
    <div className="flex items-center justify-center mt-28">
      <div className="w-96 border rounded bg-white px-7 py-10">
        <form onSubmit={handleLogin}>
          <h4 className="text-2xl mb-7">Login</h4>

          <input
            type="text"
            placeholder="Email"
            className="input-box"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm pb-1">{error}</p>}

          <button type="submit" className="btn-primary">
            LOGIN
          </button>

          <p className="text-sm text-center mt-4">
            Not registered yet?{" "}
            <Link
              to={"/signup"}
              className="font-medium text-[#2B85FF] underline"
            >
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
