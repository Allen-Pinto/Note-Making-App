import { useState } from "react";
import AudioRecorder from "./AudioRecorder";

const NoteTaking = () => {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");

  const handleSaveNote = (content) => {
    setNotes([...notes, { id: Date.now(), text: content }]);
  };

  return (
    <div>
      <h2>Create a Note</h2>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="Type your note here..."
      />
      <button onClick={() => handleSaveNote(text)}>Save Note</button>

      <h3>Or Record Audio</h3>
      <AudioRecorder onSave={handleSaveNote} />

      <h3>Notes</h3>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>{note.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default NoteTaking;
