const nodemailer = require('nodemailer');

exports.sendOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
  let transporter = nodemailer.createTransport({
    service: 'gmail', // You can use another email service if you prefer
    auth: {
      user: 'adnankhan958975@gmail.com',
      pass: 'isqahqzokpiddlns' // Use an app-specific password here
    },
  });

  const mailOptions = {
    from: '"Your App" <no-reply@yourapp.com>',
    to: email,
    subject: 'OTP for Login',
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return otp;
  } catch (error) {
    console.error('Error sending OTP:', error);
  }
};
