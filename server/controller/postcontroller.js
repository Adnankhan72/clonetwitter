// controllers/postController.js
const Post = require('../models/post');
const User = require('../models/user');
const moment = require('moment-timezone');

// Function to handle posting logic
exports.createPost = async (req, res) => {
  try {
    const { userId, content } = req.body;

    // Find the user and their followers
    const user = await User.findById(userId).populate('followers');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const followerCount = user.followers.length;

    // Get current time in IST
    const currentISTTime = moment().tz('Asia/Kolkata');

    // Check if the user has followers
    if (followerCount === 0) {
      // User doesn't follow anyone, they can only post once between 10 AM and 10:30 AM IST
      const startPostingWindow = moment().tz('Asia/Kolkata').set({ hour: 10, minute: 0, second: 0 });
      const endPostingWindow = moment().tz('Asia/Kolkata').set({ hour: 10, minute: 30, second: 0 });

      // Check if the current time is within the allowed posting window
      if (currentISTTime.isBefore(startPostingWindow) || currentISTTime.isAfter(endPostingWindow)) {
        return res.status(403).json({ message: 'You can post only between 10:00 AM and 10:30 AM IST.' });
      }

      // Check if the user has already posted today
      const todayStart = moment().tz('Asia/Kolkata').startOf('day');
      const postCountToday = await Post.countDocuments({
        userId: userId,
        createdAt: { $gte: todayStart.toDate() },
      });

      if (postCountToday >= 1) {
        return res.status(403).json({ message: 'You can post only once per day.' });
      }
    } else if (followerCount < 10) {
      // User has less than 10 followers, they can post up to 2 times a day
      const todayStart = moment().tz('Asia/Kolkata').startOf('day');
      const postCountToday = await Post.countDocuments({
        userId: userId,
        createdAt: { $gte: todayStart.toDate() },
      });

      if (postCountToday >= 2) {
        return res.status(403).json({ message: 'You can post only 2 times per day.' });
      }
    } else {
      // User has more than 10 followers, no restriction on posting
    }

    // Create and save the new post
    const newPost = new Post({ userId, content });
    await newPost.save();

    return res.status(200).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
