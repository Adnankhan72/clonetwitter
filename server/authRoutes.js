const express = require('express');
const crypto = require('crypto'); // For generating tokens
const nodemailer = require('nodemailer'); // For sending emails
const bcrypt = require('bcryptjs'); // For hashing passwords

const router = express.Router();

// Generate a random reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send password reset email
const sendResetEmail = async (email, token) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail', // You can use another email service if you prefer
    auth: {
      user: 'adnankhan958975@gmail.com',
      pass: 'isqahqzokpiddlns' // Use an app-specific password here
    },
  });

  const resetLink = `http://localhost:3000/reset-password/${token}`;

  await transporter.sendMail({
    from: 'adnankhan958975@gmail.com',
    to: email,
    subject: 'Password Reset Request',
    html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
  });
};

// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    // Access the usercollection from the main server
    const user = await req.usercollection.findOne({ email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour validity

    const updateDoc = {
      $set: { resetToken, resetTokenExpiry },
    };
    await req.usercollection.updateOne({ email }, updateDoc);

    await sendResetEmail(email, resetToken);

    res.send("Password reset link has been sent to your email.");
  } catch (error) {
    console.error("Error handling forgot password:", error);
    res.status(500).send("Error handling forgot password");
  }
});

// Reset Password Route
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Search for the user by token and ensure token hasn't expired
    const user = await req.usercollection.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateDoc = {
      $set: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    };

    await req.usercollection.updateOne({ resetToken: token }, updateDoc);

    res.send("Password has been reset successfully.");
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).send("Error resetting password");
  }
});

module.exports = router;
