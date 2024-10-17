// server/Usermodel.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String },
    loginHistory: [
        {
            ip: String,
            systemInfo: {
                browser: String,
                os: String,
                deviceType: String,
            },
            timestamp: { type: Date, default: Date.now },
        },
    ],
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
