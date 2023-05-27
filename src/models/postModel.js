const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
  }],
  videos: [{
    type: String,
  }],
  isPublic: {
    type: Boolean,
    default: true,
  },
  hashtags: [{
    type: String,
  }],
  friendTags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    text: {
      type: String,
      required: true,
    },
    subComments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      text: {
        type: String,
        required: true,
      },
    }],
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isDeleted: { type: Boolean, default: false },
},
 { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
