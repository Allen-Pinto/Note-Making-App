import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import TagInput from "../../components/Input/TagInput";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const AddEditNotes = ({ onClose, noteData, type, getAllNotes }) => {
  const [title, setTitle] = useState(noteData?.title || "");
  const [content, setContent] = useState(noteData?.content || "");
  const [tags, setTags] = useState(noteData?.tags || []);
  const [error, setError] = useState(null);

  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.token || localStorage.getItem("token"); // Ensure token is fetched

  const handleSaveNote = async () => {
    if (!title || !content) {
      setError("Title and content are required");
      return;
    }

    try {
      const url =
        type === "edit"
          ? `https://echo-notes-backend.onrender.com/api/note/edit/${noteData._id}`
          : "https://echo-notes-backend.onrender.com/api/note/add";

      const method = type === "edit" ? "put" : "post"; // Use PUT for editing

      const res = await axios({
        method,
        url,
        data: { title, content, tags },
        headers: {
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      toast.success(res.data.message);
      getAllNotes();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <button onClick={onClose}><MdClose /></button>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} />
      <TagInput tags={tags} setTags={setTags} />
      <button onClick={handleSaveNote}>{type === "edit" ? "UPDATE" : "ADD"}</button>
    </div>
  );
};

export default AddEditNotes;
