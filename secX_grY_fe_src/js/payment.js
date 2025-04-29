const express = require('express');
const router = express.Router();

router.post('/payment', (req, res) => {
  const { amount, method } = req.body;
  res.json({ success: true, message: `Payment of ${amount} via ${method} processed` });
});

module.exports = router;