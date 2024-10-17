// server.js
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const User = require('./model/Usermodel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uri = "mongodb+srv://adnankhan958975:admin@websitetweet.ztqhr.mongodb.net/";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});


app.use(express.json());

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).send('Invalid username or password');
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).send('Invalid username or password');
  }
  const token = jwt.sign({ userId: user._id }, 'secretkey');
  res.send({ token });
});

// Get login history route
app.get('/login-history', async (req, res) => {
  const userId = req.user.userId;
  const user = await User.findById(userId);
  res.send(user.loginHistory);
});

// Update login history route
app.post('/update-login-history', async (req, res) => {
  const userId = req.user.userId;
  const user = await User.findById(userId);
  const loginHistory = user.loginHistory;
  loginHistory.push({
    browser: req.body.browser,
    os: req.body.os,
    device: req.body.device,
    ipAddress: req.body.ipAddress,
    loginTime: new Date()
  });
  user.loginHistory = loginHistory;
  await user.save();
  res.send('Login history updated');
});

// Google Chrome OTP route
app.post('/google-chrome-otp', async (req, res) => {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const otp = Math.floor(100000 + Math.random() * 900000);
    // Send OTP to user's email using a email service like Nodemailer
    const transporter = nodemailer.createTransport({
      host: 'smtp.example.com',
      port: 587,
      secure: false, // or 'STARTTLS'
      auth: {
        user: 'adnankhan958975@gmail.com',
        pass: 'isqahqzokpiddlns'
      }
    });
    const mailOptions = {
      from: 'your-email@example.com',
      to: user.email,
      subject: 'One-Time Password (OTP)',
      text: `Your OTP is: ${otp}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
    });
    res.send({ otp });
  });

// Microsoft browser route
app.post('/microsoft-browser', async (req, res) => {
  const userId = req.user.userId;
  const user = await User.findById(userId);
  // Allow user without authentication
  res.send('Welcome!');
});

// Mobile device route
app.post('/mobile-device', async (req, res) => {
  const userId = req.user.userId;
  const user = await User.findById(userId);
  const currentTime = new Date();
  const hour = currentTime.getHours();
  if (hour >= 10 && hour <= 13) {
    // Allow access during 10 AM to 1 PM
    res.send('Welcome!');
  } else {
    res.status(401).send('Access denied');
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});