const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Assuming User model exists
  email: { type: String, required: true },
  ip: { type: String, required: true },
  browser: { type: String, required: true },
  os: { type: String, required: true },
  deviceType: { type: String, default: 'Unknown' },
  location: {
    city: { type: String, default: 'Unknown' },
    region: { type: String, default: 'Unknown' },
    country: { type: String, default: 'Unknown' },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  loginTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
