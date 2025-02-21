import React, { useState, useEffect, useRef } from "react";
import { MdMic, MdMicOff } from "react-icons/md";
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
  const recognitionRef = useRef(null); // Using ref to store recognition

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechRecognitionAvailable(false);
      toast.error("Speech Recognition is not supported in your browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscribedText(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      toast.error("Speech recognition error: " + event.error);
    };

    return () => {
      recognitionRef.current = null; // Cleanup on unmount
    };
  }, []);

  const handleRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Speech Recognition is not initialized.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        toast.error("Error starting speech recognition.");
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (transcribedText) {
      onCreateNoteWithText(transcribedText);
      setTranscribedText("");
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
          handleSearch={() => onSearchNote(searchQuery)}
          onClearSearch={() => {
            setSearchQuery("");
            handleClearSearch();
          }}
        />

        <button
          onClick={handleRecording}
          className="text-2xl text-gray-500"
          disabled={!isSpeechRecognitionAvailable}
        >
          {isRecording ? <MdMicOff /> : <MdMic />}
        </button>
      </div>

      <ProfileInfo userInfo={userInfo} onLogout={async () => {
        try {
          dispatch(signoutStart());
          const res = await axios.post("https://echo-notes-backend.onrender.com/api/auth/signout", {}, { withCredentials: true });
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
      }} />
    </div>
  );
};

export default Navbar;
