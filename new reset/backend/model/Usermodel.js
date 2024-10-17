// user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  loginHistory: [
    {
      browser: String,
      os: String,
      device: String,
      ipAddress: String,
      loginTime: Date
    }
  ]
});

const User = mongoose.model('User', userSchema);

module.exports = User;