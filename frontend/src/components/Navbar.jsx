import React, { useState, useEffect } from "react"
import SearchBar from "./SearchBar/SearchBar"
import ProfileInfo from "./Cards/ProfileInfo"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"
import {
  signInSuccess,
  signoutFailure,
  signoutStart,
} from "../redux/user/userSlice"
import axios from "axios"

const Navbar = ({ userInfo, onSearchNote, handleClearSearch, onCreateNote }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState(null)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery)
    }
  }

  const onClearSearch = () => {
    setSearchQuery("")
    handleClearSearch()
  }

  const onLogout = async () => {
    try {
      dispatch(signoutStart())

      const res = await axios.get("https://echo-notes-backend.onrender.com/api/auth/signout", {
        withCredentials: true,
      })

      if (res.data.success === false) {
        dispatch(signoutFailure(res.data.message))
        toast.error(res.data.message)
        return
      }

      toast.success(res.data.message)
      dispatch(signInSuccess())
      navigate("/login")
    } catch (error) {
      toast.error(error.message)
      dispatch(signoutFailure(error.message))
    }
  }

  const startRecording = () => {
    if (recognition) {
      recognition.start()
      setIsRecording(true)
    }
  }

  const stopRecording = () => {
    if (recognition) {
      recognition.stop()
      setIsRecording(false)
    }
  }

  const handleTranscription = (event) => {
    const transcript = event.results[0][0].transcript
    onCreateNote && onCreateNote(transcript)
  }

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new webkitSpeechRecognition()
      recognitionInstance.lang = 'en-US'
      recognitionInstance.maxAlternatives = 1
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.onresult = handleTranscription
      recognitionInstance.onend = () => setIsRecording(false)
      setRecognition(recognitionInstance)
    } else {
      toast.error("Web Speech API not supported in this browser.")
    }
  }, [])

  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow">
      <Link to={"/"}>
        <h2 className="text-xl font-medium text-black py-2">
          <span className="text-slate-500">Echo</span>
          <span className="text-slate-900">Notes</span>
        </h2>
      </Link>

      <SearchBar
        value={searchQuery}
        onChange={({ target }) => setSearchQuery(target.value)}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
      />

      <button
        className="ml-4 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={!recognition}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
    </div>
  )
}

export default Navbar
