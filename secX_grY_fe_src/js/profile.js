const express    = require('express');
const bcrypt     = require('bcrypt');
const multer     = require('multer');
const path       = require('path');
const { query }  = require('../../db');
const { authenticate } = require('./auth'); 
const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/avatars'),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fn  = Date.now() + '-' + Math.random().toString(36).slice(2);
    cb(null, fn + ext);
  }
});
const upload = multer({ storage });


router.get('/', authenticate, async (req, res) => {
  try {
    const rows = await query(
      'SELECT first_name, last_name, email, phone, address, dob, avatar FROM patient WHERE patient_id = ?',
      [req.patientId]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'error' });
  }
});


router.put('/', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    const { email, phone, address, dob, password } = req.body;
    const updates = [];
    const params  = [];


    if (req.file) {
      updates.push('avatar = ?');
      params.push(`/uploads/avatars/${req.file.filename}`);
    }

    if (email) {
      updates.push('email = ?');
      params.push(email);
    }

    if (phone) {
      updates.push('phone = ?');
      params.push(phone);
    }

    if (address) {
      updates.push('address = ?');
      params.push(address);
    }

    if (dob) {
      updates.push('dob = ?');
      params.push(dob);
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      params.push(hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'no update' });
    }


    const sql = `UPDATE patient SET ${updates.join(', ')} WHERE patient_id = ?`;
    params.push(req.patientId);

    await query(sql, params);
    res.json({ message: 'update success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'error' });
  }
});

module.exports = router;