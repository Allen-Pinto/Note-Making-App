import mongoose from 'mongoose';

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
    ref: 'User',  // Assuming you have a User model to reference
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,  // Fixed the default value to be a function
  },
});

// Export the model
const Note = mongoose.model('Note', noteSchema);

export default Note;
