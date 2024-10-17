const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const router = express.Router();

// Razorpay instance
const razorpay = new Razorpay({
  key_id: 'https://api.razorpay.com/v1/payments', // Replace with your Razorpay Key ID
  key_secret: 'your_razorpay_key_secret', // Replace with your Razorpay Key Secret
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  const { planType, userEmail } = req.body;

  // Set amount based on plan
  const amount = planType === 'bronze' ? 10000 : planType === 'silver' ? 30000 : 100000; // Amount in paise (₹100, ₹300, ₹1000)
  
  const options = {
    amount: amount, // Amount in paise (1 INR = 100 paise)
    currency: 'INR',
    receipt: `receipt_order_${Math.random().toString(36).substring(7)}`,
    payment_capture: 1, // 1 means automatic capture, 0 means manual
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: 'https://api.razorpay.com/v1/payments', // Send the key to the frontend
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Verify Razorpay payment signature
router.post('/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Generate signature for verification
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', 'your_razorpay_key_secret') // Replace with your Razorpay Key Secret
    .update(body)
    .digest('hex');

  // Compare generated signature with Razorpay signature
  if (expectedSignature === razorpay_signature) {
    res.json({ success: true, message: 'Payment verified successfully' });
  } else {
    res.json({ success: false, message: 'Invalid signature, payment verification failed' });
  }
});

module.exports = router;
