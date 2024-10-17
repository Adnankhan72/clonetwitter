// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Array of user references for followers
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
