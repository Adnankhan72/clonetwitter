const nodemailer = require('nodemailer');
const useragent = require('user-agent');
const requestIp = require('request-ip');

// Function to send OTP via email
exports.sendOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000);  // Generate 6-digit OTP

  let transporter = nodemailer.createTransport({
    service: 'gmail',
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
    throw new Error('Unable to send OTP.'); // Throw error to handle it upstream
  }
};

// Function to handle login and browser/OS restrictions
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIp = requestIp.getClientIp(req);  // Get user's IP address
    const userAgent = useragent.parse(req.headers['user-agent']);  // Get user's browser and OS info

    const browser = userAgent.family;  // e.g., Chrome, Edge
    const os = userAgent.os.family;    // e.g., Windows, iOS
    const deviceType = userAgent.device.type || 'Unknown';  // Fallback for device type

    // Mobile device access only between 10 AM to 1 PM
    const currentHour = new Date().getHours();
    if (deviceType === 'Mobile' && (currentHour < 10 || currentHour > 13)) {
      return res.status(403).json({ message: 'Access allowed only between 10 AM to 1 PM on mobile devices.' });
    }

    if (browser === 'Chrome') {
      const otp = await this.sendOTP(email);  // Trigger OTP to user's email
      return res.status(401).json({ message: 'OTP sent to your email for verification.', otp }); // Return OTP if needed for verification
    }

    if (browser === 'Edge') {
      // Assume authentication logic, replace with your actual authentication logic
      const user = await authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      await this.saveLoginHistory(req, user, clientIp, browser, os, deviceType);
      return res.status(200).json({ message: 'Login successful', user });
    }

    return res.status(401).json({ message: 'Unsupported browser.' });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Function to save login history in the database
exports.saveLoginHistory = async (req, user, ip, browser, os, deviceType) => {
  const loginInfo = {
    userId: user._id,   // Assuming user has an _id field
    email: user.email,
    ip,
    browser: browser || 'Unknown',  // Fallback if browser name is undefined
    os: os || 'Unknown',              // Fallback if OS is undefined
    deviceType: deviceType || 'Unknown',  // Fallback if device type is undefined
    loginTime: new Date(),
  };

  try {
    const loginHistoryCollection = req.usercollection;  // Assume login history is stored in 'users' collection
    await loginHistoryCollection.updateOne(
      { _id: user._id },
      { $push: { loginHistory: loginInfo } },
      { upsert: true }
    );
    console.log('Login history saved successfully:', loginInfo);
  } catch (error) {
    console.error('Error saving login history:', error);
  }
};

