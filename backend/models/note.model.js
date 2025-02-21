import mongoose from 'mongoose';

// Note Schema
const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,  
  },
});

// Export the model
const Note = mongoose.model('Note', noteSchema);

export default Note;
