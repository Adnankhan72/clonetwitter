// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controller/postcontroller');

// Route to handle post creation
router.post('/create', postController.createPost);
// Route to get how many posts a user has made today
router.get('/today/:userId', async (req, res) => {
    const { userId } = req.params;
    const todayStart = moment().tz('Asia/Kolkata').startOf('day').toDate();
  
    try {
      const postCount = await Post.countDocuments({
        userId,
        createdAt: { $gte: todayStart },
      });
  
      res.status(200).json({ postCount });
    } catch (error) {
      console.error('Error fetching post count:', error);
      res.status(500).json({ message: 'Error fetching post count' });
    }
  });
  

module.exports = router;
