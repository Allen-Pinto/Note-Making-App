import React, { useState, useEffect } from "react";
import { MdMic, MdMicOff } from "react-icons/md";  // Microphone icons
import SearchBar from "./SearchBar/SearchBar";
import ProfileInfo from "./Cards/ProfileInfo";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  signoutSuccess,
  signoutFailure,
  signoutStart,
} from "../redux/user/userSlice";
import axios from "axios";

const Navbar = ({ userInfo, onSearchNote, handleClearSearch, onCreateNoteWithText }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [isSpeechRecognitionAvailable, setIsSpeechRecognitionAvailable] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch();
  };

  const onLogout = async () => {
    try {
      dispatch(signoutStart());

      const res = await axios.post("https://echo-notes-backend.onrender.com/api/auth/signout", 
        {}, 
        { withCredentials: true }
      );

      if (!res.data.success) {
        dispatch(signoutFailure(res.data.message));
        toast.error(res.data.message);
        return;
      }

      dispatch(signoutSuccess());
      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
      dispatch(signoutFailure(error.message));
    }
  };

  // Set up Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition; 

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
  } else {
    setIsSpeechRecognitionAvailable(false);
    toast.error("Speech Recognition is not supported in your browser.");
  }

  // Start/Stop Recording
  const handleRecording = () => {
    if (!recognition) return;  // Prevent errors if SpeechRecognition is unavailable

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscribedText(transcript);
    };

    recognition.onerror = (event) => {
      toast.error("Error while recording: " + event.error);
    };

    return () => {
      recognition.stop();  // Cleanup
    };
  }, []);

  // Once the recording stops, create a note using the transcribed text
  useEffect(() => {
    if (transcribedText) {
      onCreateNoteWithText(transcribedText);  // Pass transcribed text to parent
      setTranscribedText("");  // Clear transcribed text after use
    }
  }, [transcribedText, onCreateNoteWithText]);

  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow">
      <Link to={"/"}>
        <h2 className="text-xl font-medium text-black py-2">
          <span className="text-slate-500">Echo</span>
          <span className="text-slate-900">Notes</span>
        </h2>
      </Link>

      <div className="flex items-center gap-3">
        <SearchBar
          value={searchQuery}
          onChange={({ target }) => setSearchQuery(target.value)}
          handleSearch={handleSearch}
          onClearSearch={onClearSearch}
        />

        {/* Microphone Icon */}
        <button
          onClick={handleRecording}
          className="text-2xl text-gray-500"
          disabled={!isSpeechRecognitionAvailable} // Disable button if recognition is not available
        >
          {isRecording ? <MdMicOff /> : <MdMic />}
        </button>
      </div>

      <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
    </div>
  );
};

export default Navbar;
