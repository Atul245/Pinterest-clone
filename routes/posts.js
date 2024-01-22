const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/pinterest");

// Define the Post schema
const postSchema = new mongoose.Schema({
  imageText: {
    type: String,
    required: true,
  },

  image: {
    type: String,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  currentDateAndTime: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Array,
    default: [],
  },
});

// Create the Post model
const Post = mongoose.model('Post', postSchema);
module.exports = Post;
