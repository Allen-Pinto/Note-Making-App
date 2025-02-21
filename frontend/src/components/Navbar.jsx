import React, { useState, useRef } from "react"
import SearchBar from "./SearchBar/SearchBar"
import ProfileInfo from "./Cards/ProfileInfo"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"
import axios from "axios"
import { signInSuccess, signoutFailure, signoutStart } from "../redux/user/userSlice"

const Navbar = ({ userInfo, onSearchNote, handleClearSearch }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [transcribedText, setTranscribedText] = useState("")
  const recognition = useRef(null)

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
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition API is not supported by your browser.");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    recognition.current = new SpeechRecognition();
    recognition.current.lang = "en-US";
    recognition.current.continuous = true; // Allow continuous recognition
    recognition.current.interimResults = false;

    recognition.current.onstart = () => {
      setIsRecording(true);
    };

    recognition.current.onresult = (event) => {
      console.log(event); // Log the event to see its structure
      const transcript = event.results[0][0].transcript;
      setTranscribedText(transcript);
    };

recognition.current.onerror = (event) => {
  console.log('Speech recognition error:', event.error);
  if (event.error === "network") {
    alert('Network error occurred. Retrying...');
    setTimeout(() => startRecording(), 2000); // Retry after 2 seconds
  } else {
    alert(`Error with speech recognition: ${event.error}`);
  }
};

    recognition.current.onend = () => {
      setIsRecording(false);
      createNote();
    };

    recognition.current.start();
  };

  const stopRecording = () => {
    if (recognition.current) {
      recognition.current.stop();
    }
  };

  const createNote = async () => {
    try {
      if (transcribedText.trim()) {
        const res = await axios.post(
          "https://echo-notes-backend.onrender.com/api/notes", 
          { text: transcribedText },
          { withCredentials: true }
        );
        toast.success("Note created successfully!");
      } else {
        toast.error("No text transcribed.");
      }
    } catch (error) {
      toast.error("Error creating note.");
    }
  };

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

      <ProfileInfo userInfo={userInfo} onLogout={onLogout} />

      <div className="ml-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className="p-2 bg-blue-500 text-white rounded"
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
