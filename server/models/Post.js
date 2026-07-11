const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    body: {
      type: String,
      default: '',
      maxlength: 5000,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    commentCount: {
      type: Number,
      default: 0, // denormalized for fast list rendering — updated whenever a Comment is created/deleted
    },
  },
  { timestamps: true }
);

// Common query pattern: "show me recent posts in this community" — index supports it directly
postSchema.index({ community: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
